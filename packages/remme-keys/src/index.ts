// import { NewPubKeyPayload } from "remme-protobuf";
import { IRemmeKeys } from "./interface";
import {
    RSA,
    EdDSA,
    ECDSA,
    GenerateOptions,
    KeyType,
    IRemmeKeysParams,
    RSASignaturePadding,
} from "./models";
import {RemmeFamilyName} from "../../remme-utils/dist/models";

// const { PubKeyType: KeyType } = NewPubKeyPayload;
// const { RSASignaturePadding } = NewPubKeyPayload;
/* tslint:disable */

/**
 * Class that works with different types of keys.
 * For now it is RSA, EdDSA (ED25519), ECDSA (secp256k1).
 *
 * @example
 * If you don't have key pair you can generate it.
 * ```typescript
 * import { KeyType } from "remme-keys";
 *
 * const keys = Remme.Keys.generateKeyPair(KeyType.RSA); // Our chain works only with RSA now.
 *
 * // then you can sign some data. For rsa key type you should provide RSASignaturePadding (by default PSS)
 * const signature = keys.sign("some data");
 * console.log(keys.verify(signature, "some data")); // true
 *
 * // or you can store it in the chain. For rsa key type you should provide RSASignaturePadding (by default EMPTY)
 *  const publicKeyStoring = await remme.publicKeyStorage.store({
 *       data: "store data",
 *       keys,
 *       rsaSignaturePadding: RSASignaturePadding.PSS
 *       validFrom: Math.round(Date.now() / 1000),
 *       validTo: Math.round(Date.now() / 1000 + 1000)
 *  });
 * ```
 *
 * If you have private key. You can construct RemmeKeys based on private key.
 * ```typescript
 * import { KeyType } from "remme-keys";
 * import { privateKeyFromPem } from "remme-utils";
 *
 * const privateKey = "-----BEGIN RSA PRIVATE KEY-----\r\nMIIEowIBAAKCAQEAkhdw64WKrvXCWtGsNeVTPKDPpcHN0kcF4acvfPauDE8TpIFu\r\n8rFQdnGdBldJMo+iHC4VkEc7SqP0Z7bynBXZze6YAsi7VUggO+5kDuJnKrg0VJ5s\r\nwfV/Jdvj9ev1iG1TeVTAyp1Uvjmek9uAh6DgobdtWM/VpVYsbBcMT4XXpzmuv0qk\r\nEf9YmR3kJ5SBGdkb6jaOnjJWO0O6kOUO54y06wr0BXqYWWQTnGC3DJf2iqu68Ceo\r\nZsg/dRNs1zXP4x00GyOW7OdnmMUsySquf//KHUlnD3Oa1TyWzjF6NcMWv0PgDg6u\r\n8q4739X0ueBNDpXJyiMMpQUZ/8YbW/Ijdfv7DQIDAQABAoIBADRnHCYfXMOte+2/\r\n0Bn1DIpu1I0Mm5uVxlJO+gXFJmFb7BvSIc4ENGyIDF896A+u3eNl1G5QXsBDV2Ps\r\nh9HdNKddskEtZ6ULniRhOprsMz1rnbnMqg5Y1SbrXTXVUdmB/bND53PGQ6OIX42B\r\n6vS7jFf1x89XnbcU1hJfohbUV6qvwr+hyrvrV859LM80rErCKGXXi6gtiRBiTYA3\r\n2qgO+F/ntmoU638XDzeIhKNjCP+KcWcQX1TRlrcuKfPKfCttHTb1MCGWnrOqy56w\r\nU628Iz4lKfjCOOdAXvyDRBEFSPKfriuB5JQQ67cZ9w783/2ZChhAY4wzBqvgnnlo\r\np6cPXDECgYEA+shoBswhqkA81RHxdkMoM9/iGwfkdFwxr9TqHGN7+L0hRXJlysKP\r\npBFX7Wg6GWF3BDHQzLoWQCEox0NgHbAVTC5DBxjIEjRemmlYEeAPqVRTub1lfp37\r\nYcK8BqsllDgXsqlQQNKqqVj4V2y/PO6NzlHWN9inJrp8ZZKSKPSamq8CgYEAlSF7\r\nDB0STde20E+ZPzQZi7zLWl59yM29mlKujlRktp2vl3foRJgQsndOAIc6k4+ImXR8\r\ngtfwpCYrXTQhJE4GHO/E/52vuwkVVz9qN5ZmgzR13yzlicCVmfZ7aaZ6jblNiQ1G\r\ngnIx1chcb8Vl5fncmaoa9SgefwWciPERNg31RQMCgYEApH1SjjLSWgMsY20Tfchq\r\n1Cui+Kviktft1zDGJbyzEeGrswtn7OhUov6lN5jHkuI02FF8bOwZsBKP1rNAlfhq\r\n377wQ/VjNV2YN5ulIoRegWhISmoJ6lThD6xU++LCEUgBczRO6VXEjrNGoME5ZlPq\r\nO0u+QH8gk+x5r33F1Isr5Q0CgYBHrmEjsHGU4wPnWutROuywgx3HoTWaqHHjVKy8\r\nkwoZ0O+Owb7uAZ28+qWOkXFxbgN9p0UV60+qxwH++ciYV7yOeh1ZtGS8ZSBR4JRg\r\nhbVeiX/CtyTZsqz15Ujqvm+X4aLIJo5msxcLKBRuURaqlRAY+G+euRr3eS4FkMHy\r\nFoF3GwKBgFDNeJc7VfbQq2toRSxCNuUTLXoZPrPfQrV+mA9umGCep44Ea02xIKQu\r\nbYpYghpdbASOp6fJvBlwjI8LNX3dC/PfUpbIG84bVCokgBCMNJQ+/DBuPBt7L29A\r\n7Ra1poXMbXt0nF3LgAtZHveRmVDtcr52dZ/6Yd2km5mAHj+4yPZo\r\n-----END RSA PRIVATE KEY-----\r\n"
 * const keys = new Remme.Keys({
     *      keyType: KeyType.RSA,
     *      privateKey: privateKeyFromPem(privateKey),
     * }); // Our chain works only with RSA now.
 * ```
 *
 * If you have public key. You can get an address for it.
 * ```typescript
 * import { KeyType } from "remme-keys";
 * import { publicKeyFromPem } from "remme-utils";
 *
 * const publicKey = "-----BEGIN PUBLIC KEY-----\r\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAkhdw64WKrvXCWtGsNeVT\r\nPKDPpcHN0kcF4acvfPauDE8TpIFu8rFQdnGdBldJMo+iHC4VkEc7SqP0Z7bynBXZ\r\nze6YAsi7VUggO+5kDuJnKrg0VJ5swfV/Jdvj9ev1iG1TeVTAyp1Uvjmek9uAh6Dg\r\nobdtWM/VpVYsbBcMT4XXpzmuv0qkEf9YmR3kJ5SBGdkb6jaOnjJWO0O6kOUO54y0\r\n6wr0BXqYWWQTnGC3DJf2iqu68CeoZsg/dRNs1zXP4x00GyOW7OdnmMUsySquf//K\r\nHUlnD3Oa1TyWzjF6NcMWv0PgDg6u8q4739X0ueBNDpXJyiMMpQUZ/8YbW/Ijdfv7\r\nDQIDAQAB\r\n-----END PUBLIC KEY-----\r\n";
 * const address = Remme.getAddressFromPublicKey(KeyType.RSA, publicKeyFromPem(publicKey)); // Our chain works only with RSA now.
 * ```
 */
/* tslint:enable */
class RemmeKeys implements IRemmeKeys {
    private readonly _keys: IRemmeKeys;

    /**
     * Generate key pair and get instance of RemmeKeys.
     * @example
     * If you don't have key pair you can generate it.
     * ```typescript
     * import { KeyType } from "remme-keys";
     *
     * const keys = Remme.Keys.generateKeyPair(KeyType.RSA); // Our chain works only with RSA now.
     * ```
     * @param {KeyType} keyType
     * @param {GenerateOptions} options
     * @returns {Promise<IRemmeKeys>}
     */
    public static async generateKeyPair(
        // keyType: NewPubKeyPayload.PubKeyType,
        keyType: KeyType,
        options?: GenerateOptions,
    ): Promise<IRemmeKeys> {
        let keys: {
            privateKey: any,
            publicKey: any,
        };
        switch (keyType) {
            case KeyType.RSA: {
                keys = await RSA.generateKeyPair(options);
                break;
            }
            case KeyType.EdDSA: {
                keys = EdDSA.generateKeyPair(options);
                break;
            }
            case KeyType.ECDSA: {
                keys = ECDSA.generateKeyPair();
                break;
            }
        }
        return new RemmeKeys({
            keyType,
            privateKey: keys.privateKey,
            publicKey: keys.publicKey,
        });
    }
    /* tslint:disable */
    /**
     * Can get address from public key.
     * @example
     * If you have public key. You can get an address for it.
     * ```typescript
     * import { KeyType } from "remme-keys";
     * import { publicKeyFromPem } from "remme-utils";
     *
     * const publicKey = "-----BEGIN PUBLIC KEY-----\r\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAkhdw64WKrvXCWtGsNeVT\r\nPKDPpcHN0kcF4acvfPauDE8TpIFu8rFQdnGdBldJMo+iHC4VkEc7SqP0Z7bynBXZ\r\nze6YAsi7VUggO+5kDuJnKrg0VJ5swfV/Jdvj9ev1iG1TeVTAyp1Uvjmek9uAh6Dg\r\nobdtWM/VpVYsbBcMT4XXpzmuv0qkEf9YmR3kJ5SBGdkb6jaOnjJWO0O6kOUO54y0\r\n6wr0BXqYWWQTnGC3DJf2iqu68CeoZsg/dRNs1zXP4x00GyOW7OdnmMUsySquf//K\r\nHUlnD3Oa1TyWzjF6NcMWv0PgDg6u8q4739X0ueBNDpXJyiMMpQUZ/8YbW/Ijdfv7\r\nDQIDAQAB\r\n-----END PUBLIC KEY-----\r\n";
     * const address = Remme.getAddressFromPublicKey(KeyType.RSA, publicKeyFromPem(publicKey)); // Our chain works only with RSA now.
     * ```
     * @param {KeyType} keyType
     * @param publicKey
     * @returns {string}
     */
    /* tslint:enable */
    public static getAddressFromPublicKey(
        // keyType: NewPubKeyPayload.PubKeyType,
        keyType: KeyType,
        publicKey: any,
    ): string {
        switch (keyType) {
            case KeyType.RSA: {
                return RSA.getAddressFromPublicKey(publicKey);
            }
            case KeyType.EdDSA: {
                return EdDSA.getAddressFromPublicKey(publicKey);
            }
            case KeyType.ECDSA: {
                return ECDSA.getAddressFromPublicKey(publicKey);
            }
        }
    }

    // public static construct(
    //     keyType: KeyType,
    //     privateKey: any,
    //     publicKey?: any,
    // ): IRemmeKeys {
    //     switch (keyType) {
    //         case KeyType.RSA: {
    //             return new RSA(privateKey, publicKey);
    //         }
    //         case KeyType.EdDSA: {
    //             return new EdDSA(privateKey, publicKey);
    //         }
    //         case KeyType.ECDSA: {
    //             return new ECDSA(privateKey, publicKey);
    //         }
    //     }
    // }
    /* tslint:disable */
    /**
     * @example
     * If you have private key. You can construct RemmeKeys based on private key.
     * ```typescript
     * import { KeyType } from "remme-keys";
     * import { privateKeyFromPem, publicKeyFromPem } from "remme-utils";
     *
     * const privateKey = "-----BEGIN RSA PRIVATE KEY-----\r\nMIIEowIBAAKCAQEAkhdw64WKrvXCWtGsNeVTPKDPpcHN0kcF4acvfPauDE8TpIFu\r\n8rFQdnGdBldJMo+iHC4VkEc7SqP0Z7bynBXZze6YAsi7VUggO+5kDuJnKrg0VJ5s\r\nwfV/Jdvj9ev1iG1TeVTAyp1Uvjmek9uAh6DgobdtWM/VpVYsbBcMT4XXpzmuv0qk\r\nEf9YmR3kJ5SBGdkb6jaOnjJWO0O6kOUO54y06wr0BXqYWWQTnGC3DJf2iqu68Ceo\r\nZsg/dRNs1zXP4x00GyOW7OdnmMUsySquf//KHUlnD3Oa1TyWzjF6NcMWv0PgDg6u\r\n8q4739X0ueBNDpXJyiMMpQUZ/8YbW/Ijdfv7DQIDAQABAoIBADRnHCYfXMOte+2/\r\n0Bn1DIpu1I0Mm5uVxlJO+gXFJmFb7BvSIc4ENGyIDF896A+u3eNl1G5QXsBDV2Ps\r\nh9HdNKddskEtZ6ULniRhOprsMz1rnbnMqg5Y1SbrXTXVUdmB/bND53PGQ6OIX42B\r\n6vS7jFf1x89XnbcU1hJfohbUV6qvwr+hyrvrV859LM80rErCKGXXi6gtiRBiTYA3\r\n2qgO+F/ntmoU638XDzeIhKNjCP+KcWcQX1TRlrcuKfPKfCttHTb1MCGWnrOqy56w\r\nU628Iz4lKfjCOOdAXvyDRBEFSPKfriuB5JQQ67cZ9w783/2ZChhAY4wzBqvgnnlo\r\np6cPXDECgYEA+shoBswhqkA81RHxdkMoM9/iGwfkdFwxr9TqHGN7+L0hRXJlysKP\r\npBFX7Wg6GWF3BDHQzLoWQCEox0NgHbAVTC5DBxjIEjRemmlYEeAPqVRTub1lfp37\r\nYcK8BqsllDgXsqlQQNKqqVj4V2y/PO6NzlHWN9inJrp8ZZKSKPSamq8CgYEAlSF7\r\nDB0STde20E+ZPzQZi7zLWl59yM29mlKujlRktp2vl3foRJgQsndOAIc6k4+ImXR8\r\ngtfwpCYrXTQhJE4GHO/E/52vuwkVVz9qN5ZmgzR13yzlicCVmfZ7aaZ6jblNiQ1G\r\ngnIx1chcb8Vl5fncmaoa9SgefwWciPERNg31RQMCgYEApH1SjjLSWgMsY20Tfchq\r\n1Cui+Kviktft1zDGJbyzEeGrswtn7OhUov6lN5jHkuI02FF8bOwZsBKP1rNAlfhq\r\n377wQ/VjNV2YN5ulIoRegWhISmoJ6lThD6xU++LCEUgBczRO6VXEjrNGoME5ZlPq\r\nO0u+QH8gk+x5r33F1Isr5Q0CgYBHrmEjsHGU4wPnWutROuywgx3HoTWaqHHjVKy8\r\nkwoZ0O+Owb7uAZ28+qWOkXFxbgN9p0UV60+qxwH++ciYV7yOeh1ZtGS8ZSBR4JRg\r\nhbVeiX/CtyTZsqz15Ujqvm+X4aLIJo5msxcLKBRuURaqlRAY+G+euRr3eS4FkMHy\r\nFoF3GwKBgFDNeJc7VfbQq2toRSxCNuUTLXoZPrPfQrV+mA9umGCep44Ea02xIKQu\r\nbYpYghpdbASOp6fJvBlwjI8LNX3dC/PfUpbIG84bVCokgBCMNJQ+/DBuPBt7L29A\r\n7Ra1poXMbXt0nF3LgAtZHveRmVDtcr52dZ/6Yd2km5mAHj+4yPZo\r\n-----END RSA PRIVATE KEY-----\r\n"
     * const keys = new Remme.Keys({
     *      keyType: KeyType.RSA,
     *      privateKey: privateKeyFromPem(privateKey),
     * }); // Our chain works only with RSA now.
     * ```
     *
     * If you public key. You can construct RemmeKeys based on public key.
     * ```typescript
     * import { KeyType } from "remme-keys";
     * import { privateKeyFromPem, publicKeyFromPem } from "remme-utils";
     *
     * const publicKey = "-----BEGIN PUBLIC KEY-----\r\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAkhdw64WKrvXCWtGsNeVT\r\nPKDPpcHN0kcF4acvfPauDE8TpIFu8rFQdnGdBldJMo+iHC4VkEc7SqP0Z7bynBXZ\r\nze6YAsi7VUggO+5kDuJnKrg0VJ5swfV/Jdvj9ev1iG1TeVTAyp1Uvjmek9uAh6Dg\r\nobdtWM/VpVYsbBcMT4XXpzmuv0qkEf9YmR3kJ5SBGdkb6jaOnjJWO0O6kOUO54y0\r\n6wr0BXqYWWQTnGC3DJf2iqu68CeoZsg/dRNs1zXP4x00GyOW7OdnmMUsySquf//K\r\nHUlnD3Oa1TyWzjF6NcMWv0PgDg6u8q4739X0ueBNDpXJyiMMpQUZ/8YbW/Ijdfv7\r\nDQIDAQAB\r\n-----END PUBLIC KEY-----\r\n";
     * const keys = new Remme.Keys({
     *      keyType: KeyType.RSA,
     *      publicKey: publicKeyFromPem(publicKey),
     * }); // Our chain works only with RSA now.
     * ```
     * @param {KeyType} keyType
     * @param {any} privateKey
     * @param {any} publicKey
     */
    /* tslint:enable */
    constructor({
                    // keyType: NewPubKeyPayload.PubKeyType,
                    keyType,
                    privateKey,
                    publicKey,
                }: IRemmeKeysParams = { keyType: KeyType.RSA }) {

        if (!privateKey && !publicKey) {
            throw new Error("Can't construct without private or public keys");
        }

        switch (keyType) {
            case KeyType.RSA: {
                this._keys = new RSA({ privateKey, publicKey });
                break;
            }
            case KeyType.EdDSA: {
                this._keys = new EdDSA({ privateKey, publicKey });
                break;
            }
            case KeyType.ECDSA: {
                this._keys = new ECDSA({ privateKey, publicKey });
                break;
            }
        }
    }
    /* tslint:disable */


    /**
     * You can sign data based on private key.
     * @example
     * ```typescript
     * import { KeyType } from "remme-keys";
     *
     * // If don't have private key you can generate it.
     * const keys = Remme.Keys.generateKeyPair(KeyType.RSA); // Our chain works only with RSA now.
     *
     * // If you have private key you can construct RemmeKeys based on it.
     * const utils = await import("remme-utils");
     * const privateKey = "-----BEGIN RSA PRIVATE KEY-----\r\nMIIEowIBAAKCAQEAkhdw64WKrvXCWtGsNeVTPKDPpcHN0kcF4acvfPauDE8TpIFu\r\n8rFQdnGdBldJMo+iHC4VkEc7SqP0Z7bynBXZze6YAsi7VUggO+5kDuJnKrg0VJ5s\r\nwfV/Jdvj9ev1iG1TeVTAyp1Uvjmek9uAh6DgobdtWM/VpVYsbBcMT4XXpzmuv0qk\r\nEf9YmR3kJ5SBGdkb6jaOnjJWO0O6kOUO54y06wr0BXqYWWQTnGC3DJf2iqu68Ceo\r\nZsg/dRNs1zXP4x00GyOW7OdnmMUsySquf//KHUlnD3Oa1TyWzjF6NcMWv0PgDg6u\r\n8q4739X0ueBNDpXJyiMMpQUZ/8YbW/Ijdfv7DQIDAQABAoIBADRnHCYfXMOte+2/\r\n0Bn1DIpu1I0Mm5uVxlJO+gXFJmFb7BvSIc4ENGyIDF896A+u3eNl1G5QXsBDV2Ps\r\nh9HdNKddskEtZ6ULniRhOprsMz1rnbnMqg5Y1SbrXTXVUdmB/bND53PGQ6OIX42B\r\n6vS7jFf1x89XnbcU1hJfohbUV6qvwr+hyrvrV859LM80rErCKGXXi6gtiRBiTYA3\r\n2qgO+F/ntmoU638XDzeIhKNjCP+KcWcQX1TRlrcuKfPKfCttHTb1MCGWnrOqy56w\r\nU628Iz4lKfjCOOdAXvyDRBEFSPKfriuB5JQQ67cZ9w783/2ZChhAY4wzBqvgnnlo\r\np6cPXDECgYEA+shoBswhqkA81RHxdkMoM9/iGwfkdFwxr9TqHGN7+L0hRXJlysKP\r\npBFX7Wg6GWF3BDHQzLoWQCEox0NgHbAVTC5DBxjIEjRemmlYEeAPqVRTub1lfp37\r\nYcK8BqsllDgXsqlQQNKqqVj4V2y/PO6NzlHWN9inJrp8ZZKSKPSamq8CgYEAlSF7\r\nDB0STde20E+ZPzQZi7zLWl59yM29mlKujlRktp2vl3foRJgQsndOAIc6k4+ImXR8\r\ngtfwpCYrXTQhJE4GHO/E/52vuwkVVz9qN5ZmgzR13yzlicCVmfZ7aaZ6jblNiQ1G\r\ngnIx1chcb8Vl5fncmaoa9SgefwWciPERNg31RQMCgYEApH1SjjLSWgMsY20Tfchq\r\n1Cui+Kviktft1zDGJbyzEeGrswtn7OhUov6lN5jHkuI02FF8bOwZsBKP1rNAlfhq\r\n377wQ/VjNV2YN5ulIoRegWhISmoJ6lThD6xU++LCEUgBczRO6VXEjrNGoME5ZlPq\r\nO0u+QH8gk+x5r33F1Isr5Q0CgYBHrmEjsHGU4wPnWutROuywgx3HoTWaqHHjVKy8\r\nkwoZ0O+Owb7uAZ28+qWOkXFxbgN9p0UV60+qxwH++ciYV7yOeh1ZtGS8ZSBR4JRg\r\nhbVeiX/CtyTZsqz15Ujqvm+X4aLIJo5msxcLKBRuURaqlRAY+G+euRr3eS4FkMHy\r\nFoF3GwKBgFDNeJc7VfbQq2toRSxCNuUTLXoZPrPfQrV+mA9umGCep44Ea02xIKQu\r\nbYpYghpdbASOp6fJvBlwjI8LNX3dC/PfUpbIG84bVCokgBCMNJQ+/DBuPBt7L29A\r\n7Ra1poXMbXt0nF3LgAtZHveRmVDtcr52dZ/6Yd2km5mAHj+4yPZo\r\n-----END RSA PRIVATE KEY-----\r\n"
     * const keys = new Remme.Keys({
     *      keyType: KeyType.RSA,
     *      privateKey: utils.privateKeyFromPem(privateKey),
     * }); // Our chain works only with RSA now.
     *
     * // then you can sign some data. For rsa key type you should provide RSASignaturePadding (by default PSS)
     * const signature = keys.sign("some data");
     * console.log(keys.verify(signature, "some data")); // true
     *
     * @param {string} data
     * @param {RSASignaturePadding} rsaSignaturePadding
     * @returns {string}
     */
    /* tslint:enable */
    public sign(
        data: string,
        // rsaSignaturePadding?: NewPubKeyPayload.RSASignaturePadding,
        rsaSignaturePadding?: RSASignaturePadding,
    ): string {
        if (!this._keys.privateKey) {
            throw new Error("You can't sign this data because you didn't provide private key for this.");
        }
        if (this._keys instanceof RSA) {
            return this._keys.sign(data, rsaSignaturePadding);
        }
        return this._keys.sign(data);
    }
    /* tslint:disable */
    /**
     * You can verify signature for data based on public key.
     * @example
     * ```typescript
     * import { KeyType } from "remme-keys";
     *
     * // If you have public key from private key that is signed this data you can construct RemmeKeys based on it.
     * const utils = await import("remme-utils");
     * const publicKey = "-----BEGIN PUBLIC KEY-----\r\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAkhdw64WKrvXCWtGsNeVT\r\nPKDPpcHN0kcF4acvfPauDE8TpIFu8rFQdnGdBldJMo+iHC4VkEc7SqP0Z7bynBXZ\r\nze6YAsi7VUggO+5kDuJnKrg0VJ5swfV/Jdvj9ev1iG1TeVTAyp1Uvjmek9uAh6Dg\r\nobdtWM/VpVYsbBcMT4XXpzmuv0qkEf9YmR3kJ5SBGdkb6jaOnjJWO0O6kOUO54y0\r\n6wr0BXqYWWQTnGC3DJf2iqu68CeoZsg/dRNs1zXP4x00GyOW7OdnmMUsySquf//K\r\nHUlnD3Oa1TyWzjF6NcMWv0PgDg6u8q4739X0ueBNDpXJyiMMpQUZ/8YbW/Ijdfv7\r\nDQIDAQAB\r\n-----END PUBLIC KEY-----\r\n";
     * const keys = new Remme.Keys({
     *      keyType: KeyType.RSA,
     *      publicKey: publicKeyFromPem(publicKey),
     * }); // Our chain works only with RSA now.
     *
     * console.log(keys.verify(signature, "some data")); // true if private key for this public key is signed data else false
     *
     * @param {string} signature
     * @param {string} data
     * @param {RSASignaturePadding} rsaSignaturePadding
     * @returns {boolean}
     */
    /* tslint:enable */
    public verify(
        data: string,
        signature: string,
        // rsaSignaturePadding?: NewPubKeyPayload.RSASignaturePadding,
        rsaSignaturePadding?: RSASignaturePadding,
    ): boolean {
        if (this._keys instanceof RSA) {
            return this._keys.verify(data, signature, rsaSignaturePadding);
        }
        return this._keys.verify(data, signature);
    }

    /**
     * Address of this key in blockchain. (https://docs.remme.io/remme-core/docs/family-account.html#addressing)
     */
    public get address(): string {
        return this._keys.address;
    }

    /**
     * Return private key.
     * @returns {Buffer}
     */
    public get privateKey(): any {
        return this._keys.privateKey;
    }

    /**
     * Return public key.
     * @returns {Buffer}
     */
    public get publicKey(): any {
        return this._keys.publicKey;
    }

    /**
     * Return key type.
     * @returns {string}
     */
    public get keyType(): string {
        return KeyType[this._keys.keyType];
    }

    /**
     * Return base 64 of public key.
     * @returns {string}
     */
    public get publicKeyBase64(): string {
        return this._keys.publicKeyBase64;
    }

    /**
     * Return private key in pem format.
     * @returns {string}
     */
    public get privateKeyPem(): string {
        return this._keys.privateKeyPem;
    }

    /**
     * Return public key in pem format.
     * @returns {string}
     */
    public get publicKeyPem(): string {
        return this._keys.publicKeyPem;
    }

    /**
     * Return private key in pem format.
     * @returns {string}
     */
    public get privateKeyHex(): string {
        return this._keys.privateKeyHex;
    }

    /**
     * Return public key in pem format.
     * @returns {string}
     */
    public get publicKeyHex(): string {
        return this._keys.publicKeyHex;
    }

    /**
     * Return public key in pem format.
     * @returns {string}
     */
    public get familyName(): RemmeFamilyName {
        return this._keys.familyName;
    }

}

export {
    RemmeKeys,
    IRemmeKeys,
    KeyType,
    RSASignaturePadding,
    IRemmeKeysParams,
    RSA,
    ECDSA,
    EdDSA,
};
