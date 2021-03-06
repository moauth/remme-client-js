import {
    sha512,
    generateAddress,
    generateSettingsAddress,
    RemmeFamilyName,
    PublicKeyRequest,
    bytesToHex,
    checkAddress,
    NodeConfigRequest,
} from "remme-utils";
import { RemmeMethods, IRemmeApi } from "remme-api";
import { IRemmeTransactionService, IBaseTransactionResponse } from "remme-transaction-service";
import { TransactionPayload, NewPubKeyPayload, PubKeyMethod, RevokePubKeyPayload } from "remme-protobuf";
import { IRemmeAccount } from "remme-account";
import { KeyType, RSASignaturePadding } from "remme-keys";

import { IRemmePublicKeyStorage } from "./interface";
import {
    PublicKeyInfo,
    IPublicKeyInfo,
    IPublicKeyStore,
} from "./models";

// const { PubKeyType: PublicKeyType } = NewPubKeyPayload;
// const { RSASignaturePadding } = NewPubKeyPayload;
/**
 * Class for working with public key storage.
 * @example
 * ```typescript
 * import { KeyType } from "remme-keys";
 * const remme = new Remme.Client();
 * const keys = await Remme.Keys.generateKeyPair(KeyType.RSA);
 * const storeResponse = await remme.publicKeyStorage.store({
 *      data: "store data",
 *      keys,
 *      validFrom,
 *      validTo,
 * });
 * storeResponse.connectToWebSocket((err: Error, res: any) => {
 *      if (err) {
 *          console.log(err);
 *          return;
 *      }
 *      console.log(res);
 *      storeResponse.closeWebSocket();
 *
 *      const keyIsValid = await remme.publicKeyStorage.check(keys.address);
 *      console.log(keyIsValid); // true
 *
 *      const publicKeyInfo = await remme.publicKeyStorage.getInfo(keys.address);
 *      console.log(publicKeyInfo); // PublicKeyInfo
 *
 *      const revoke = await remme.publicKeyStorage.revoke(keys.address);
 *      // You can connectToWebSocket like in store method.
 *      console.log(revoke.batchId); // string{\^[a-f0-9]{128}$\}
 *
 *      const publicKeyAddresses = await remme.publicKeyStorage.getAccountPublicKeys(remme.account.address);
 *      console.log(publicKeyAddresses); // string[]
 * })
 * ```
 */
class RemmePublicKeyStorage implements IRemmePublicKeyStorage {
    // index signature
    [key: string]: any;

    private readonly _remmeApi: IRemmeApi;
    private readonly _remmeAccount: IRemmeAccount;
    private readonly _remmeTransaction: IRemmeTransactionService;
    private readonly _familyName = RemmeFamilyName.PublicKey;
    private readonly _familyVersion = "0.1";

    private _generateTransactionPayload(method: number, data: Uint8Array): Uint8Array {
        return TransactionPayload.encode({
            method,
            data,
        }).finish();
    }

    private async _createAndSendTransaction(inputsOutputs: string[], payloadBytes: Uint8Array)
        : Promise<IBaseTransactionResponse> {
        const transaction = await this._remmeTransaction.create({
            familyName: this._familyName,
            familyVersion: this._familyVersion,
            inputs: inputsOutputs,
            outputs: inputsOutputs,
            payloadBytes,
        });
        return await this._remmeTransaction.send(transaction);
    }

    private async _getInfoByPublicKey(address: string)
        : Promise<PublicKeyInfo> {
        checkAddress(address);
        const payload = new PublicKeyRequest(address);
        const info = await this._remmeApi
            .sendRequest<PublicKeyRequest, IPublicKeyInfo>(RemmeMethods.publicKey, payload);
        if (info !== undefined) {
            info.address = generateAddress(this._familyName, address);
            return new PublicKeyInfo(info);
        } else {
            throw new Error(`This public key was not found`);
        }
    }

    private _generateMessage(data: string): string {
        return sha512(data);
    }

    private _generateEntityHash(message: string): string {
        const entityHashBytes = Buffer.from(message);
        return bytesToHex(entityHashBytes);
    }

    /**
     * @example
     * Usage without remme main package
     * ```typescript
     * const api = new RemmeApi();
     * const account = new RemmeAccount();
     * const transaction = new RemmeTransactionService(api, account);
     * const publicKeyStorage = new RemmePublicKeyStorage(api, account, transaction);
     * ```
     * @param {IRemmeApi} remmeApi
     * @param {IRemmeAccount} remmeAccount
     * @param {IRemmeTransactionService} remmeTransaction
     */
    constructor(remmeApi: IRemmeApi, remmeAccount: IRemmeAccount, remmeTransaction: IRemmeTransactionService) {
        this._remmeApi = remmeApi;
        this._remmeAccount = remmeAccount;
        this._remmeTransaction = remmeTransaction;
    }

    /**
     * Store public key with its data into REMChain.
     * Send transaction to chain.
     * @example
     * ```typescript
     * import { KeyType, RSASignaturePadding } from "remme-keys";
     *
     * const keys = await Remme.Keys.generateKeyPair(KeyType.RSA);
     *
     * const storeResponse = await remme.publicKeyStorage.store({
     *      data: "store data",
     *      keys,
     *      rsaSignaturePadding: RSASignaturePadding.PSS,
     *      validFrom,
     *      validTo,
     * });
     *
     * storeResponse.connectToWebSocket((err: Error, res: any) => {
     *      if (err) {
     *          console.log(err);
     *          return;
     *      }
     *      console.log(res);
     * })
     * ```
     * @param {string} data
     * @param {IRemmeKeys} keys
     * @param {number} validFrom
     * @param {number} validTo
     * @param {RSASignaturePadding} paddingRSA
     * @returns {Promise<IBaseTransactionResponse>}
     */
    public async store({
                           data,
                           keys,
                           validFrom,
                           validTo,
                           rsaSignaturePadding = RSASignaturePadding.EMPTY,
                       }: IPublicKeyStore): Promise<IBaseTransactionResponse> {
        if (KeyType[keys.keyType] !== KeyType.RSA) {
            throw new Error("Only RSA key can be stored in REMChain at now");
        }

        const message = this._generateMessage(data);
        const entityHash = this._generateEntityHash(message);
        const entityHashSignature = keys.sign(message, rsaSignaturePadding);

        const payload =  NewPubKeyPayload.encode({
            publicKey: keys.publicKeyPem,
            publicKeyType: KeyType[keys.keyType],
            entityHash,
            entityHashSignature,
            validFrom,
            validTo,
        }).finish();

        const {
            storage_public_key: storagePublicKey,
        } = await this._remmeApi.sendRequest<NodeConfigRequest>(RemmeMethods.nodeConfig);

        const pubKeyAddress = keys.address;
        const storagePublicKeyAddress = generateSettingsAddress("remme.settings.storage_pub_key");
        const settingAddress = generateSettingsAddress("remme.economy_enabled");
        const storageAddress = generateAddress(this._remmeAccount.familyName, storagePublicKey);
        const payloadBytes = this._generateTransactionPayload(PubKeyMethod.Method.STORE, payload);
        return await this._createAndSendTransaction([
            pubKeyAddress,
            storagePublicKeyAddress,
            settingAddress,
            storageAddress,
        ], payloadBytes);
    }

    /**
     * Check public key on validity and revocation.
     * Take address of public key.
     * @example
     * ```typescript
     * const isValid = await remme.publicKeyStorage.check(publicKeyAddress);
     * console.log(isValid); // true or false
     * ```
     * @param {string} address
     * @returns {Promise<boolean>}
     */
    public async check(address: string): Promise<boolean> {
        const { isValid } = await this._getInfoByPublicKey(address);
        return isValid;
    }

    /**
     * Get info about this public key.
     * Take address of public key.
     * @example
     * ```typescript
     * const info = await remme.publicKeyStorage.getInfo(publicKeyAddress);
     * console.log(info); // PublicKeyInfo
     * ```
     * @param {string} address
     * @returns {Promise<PublicKeyInfo>}
     */
    public async getInfo(address: string): Promise<PublicKeyInfo> {
        return await this._getInfoByPublicKey(address);
    }

    /**
     * Revoke public key by address.
     * Take address of public key.
     * Send transaction to chain.
     * @example
     * ```typescript
     * const revokeResponse = await remme.publicKeyStorage.revoke(publicKeyAddress);
     * revokeResponse.connectToWebSocket((err: Error, res: any) => {
     *      if (err) {
     *          console.log(err);
     *          return;
     *      }
     *      console.log(res);
     * })
     * ```
     * @param {string} address
     * @returns {Promise<IBaseTransactionResponse>}
     */
    public async revoke(address: string): Promise<IBaseTransactionResponse> {
        checkAddress(address);
        const revokePayload = RevokePubKeyPayload.encode({
            address,
        }).finish();
        const payloadBytes = this._generateTransactionPayload(PubKeyMethod.Method.REVOKE, revokePayload);
        return await this._createAndSendTransaction([address], payloadBytes);
    }

    /**
     * Take account address (which describe in PATTERNS.ADDRESS)
     * @example
     * ```typescript
     * const remme = new Remme.Client();
     * const publicKeyAddresses = await remme.publicKeyStorage.getAccountPublicKeys(remme.account.address);
     * console.log(publicKeyAddresses); // string[]
     * ```
     * @param {string} address
     * @returns {Promise<string[]>}
     */
    public async getAccountPublicKeys(address: string): Promise<string[]> {
        checkAddress(address);
        const payload = new PublicKeyRequest(address);
        return await this._remmeApi
            .sendRequest<PublicKeyRequest, string[]>(RemmeMethods.userPublicKeys, payload);
    }
}

export {
    RemmePublicKeyStorage,
    IRemmePublicKeyStorage,
    PublicKeyInfo,
    IPublicKeyStore,
};
