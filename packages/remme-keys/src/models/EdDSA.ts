// import {NewPubKeyPayload} from "remme-protobuf";
import {forge, generateAddress, bytesToHex, RemmeFamilyName} from "remme-utils";

import {IRemmeKeys} from "../interface";
import {GenerateOptions, IKeys, KeyDto, KeyType} from "./index";

class EdDSA extends KeyDto implements IRemmeKeys {
    constructor({ privateKey, publicKey }: IKeys) {
        super();
        if (privateKey && publicKey) {
            this._privateKey = privateKey;
            this._publicKey = publicKey;
        } else if (privateKey) {
            this._privateKey = privateKey;
            this._publicKey = forge.pki.ed25519.publicKeyFromPrivateKey(this._privateKey);
        } else if (publicKey) {
            this._publicKey = publicKey;
        }

        this._publicKeyHex = bytesToHex(this._publicKey);

        if (this._privateKey) {
            this._privateKeyHex = bytesToHex(this._privateKey);
        }

        try {
            this._publicKeyBase64 = btoa(this._publicKeyHex);
        } catch (e) {
            this._publicKeyBase64 = Buffer.from(this._publicKeyHex).toString("base64");
        }

        this._address = generateAddress(RemmeFamilyName.PublicKey, this._publicKeyBase64);
        this._keyType = KeyType.EdDSA;
    }

    public static generateKeyPair({ seed }: GenerateOptions = {}) {
        if (seed) {
            seed = new forge.util.ByteBuffer(seed, "utf8");
            return forge.pki.ed25519.generateKeyPair({ seed });
        }
        return forge.pki.ed25519.generateKeyPair();
    }

    public static getAddressFromPublicKey(publicKey: any): string {
        let publicKeyBase64 = bytesToHex(publicKey);

        try {
            publicKeyBase64 = btoa(publicKeyBase64);
        } catch (e) {
            publicKeyBase64 = Buffer.from(publicKeyBase64).toString("base64");
        }

        return generateAddress(RemmeFamilyName.PublicKey, publicKeyBase64);
    }

    public sign(
        data: string,
    ): string {
        const signature = forge.pki.ed25519.sign({
            message: data,
            encoding: "utf8",
            privateKey: this._privateKey,
        });
        return forge.util.bytesToHex(signature);
    }

    public verify(
        data: string,
        signature: string,
    ): boolean {
        return forge.pki.ed25519.verify({
            message: data,
            encoding: "utf8",
            signature,
            publicKey: this._publicKey,
        });
    }
}

export {
    EdDSA,
};
