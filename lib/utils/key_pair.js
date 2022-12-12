"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeyPairFalcon512 = exports.KeyPairEd25519 = exports.KeyPair = exports.PublicKeyFalcon512 = exports.PublicKeyEd25519 = exports.PublicKey = exports.KeyType = void 0;
const tweetnacl_1 = __importDefault(require("tweetnacl"));
const serialize_1 = require("./serialize");
const crypto_falcon_js_1 = require("crypto_falcon_js");
/** All supported key types */
var KeyType;
(function (KeyType) {
    KeyType[KeyType["ED25519"] = 0] = "ED25519";
    KeyType[KeyType["FALCON512"] = 2] = "FALCON512";
})(KeyType = exports.KeyType || (exports.KeyType = {}));
function key_type_to_str(keyType) {
    switch (keyType) {
        case KeyType.ED25519: return 'ed25519';
        case KeyType.FALCON512: return 'falcon512';
        default: throw new Error(`Unknown key type ${keyType}`);
    }
}
function str_to_key_type(keyType) {
    switch (keyType.toLowerCase()) {
        case 'ed25519': return KeyType.ED25519;
        case 'falcon512': return KeyType.FALCON512;
        default: throw new Error(`Unknown key type ${keyType}`);
    }
}
/**
 * PublicKey representation that has type and bytes of the key.
 */
class PublicKey {
    keyType;
    data;
    constructor(args) {
        this.keyType = args["keyType"];
        this.data = args["data"];
    }
    static from(value) {
        if (typeof value === 'string') {
            return PublicKey.fromString(value);
        }
        return value;
    }
    static fromString(encodedKey) {
        const parts = encodedKey.split(':');
        if (parts.length === 1) {
            return new PublicKeyEd25519({ keyType: KeyType.ED25519, data: (0, serialize_1.base_decode)(parts[0]) });
        }
        else if (parts.length === 2) {
            if (str_to_key_type(parts[0]) === KeyType.ED25519) {
                return new PublicKeyEd25519({ keyType: KeyType.ED25519, data: (0, serialize_1.base_decode)(parts[1]) });
            }
            else if (str_to_key_type(parts[0]) === KeyType.FALCON512) {
                return new PublicKeyFalcon512({ keyType: KeyType.FALCON512, data: (0, serialize_1.base_decode)(parts[1]) });
            }
            else {
                throw new Error('Unknown key type');
            }
        }
        else {
            throw new Error('Invalid encoded key format, must be <algo>:<encoded key>');
        }
    }
}
exports.PublicKey = PublicKey;
class PublicKeyEd25519 extends PublicKey {
    toString() {
        return `${key_type_to_str(KeyType.ED25519)}:${(0, serialize_1.base_encode)(this.data)}`;
    }
    verify(message, signature) {
        return tweetnacl_1.default.sign.detached.verify(message, signature, this.data);
    }
}
exports.PublicKeyEd25519 = PublicKeyEd25519;
class PublicKeyFalcon512 extends PublicKey {
    toString() {
        return `${key_type_to_str(KeyType.FALCON512)}:${(0, serialize_1.base_encode)(this.data)}`;
    }
    verify(message, signature) {
        return crypto_falcon_js_1.falcon.verifyDetached(signature, message, this.data);
    }
}
exports.PublicKeyFalcon512 = PublicKeyFalcon512;
class KeyPair {
    /**
     * @param algo Name of elliptical curve, case-insensitive
     * @returns Random KeyPair based on the curve
     */
    static fromRandom(algo) {
        switch (algo.toUpperCase()) {
            case 'ED25519': return KeyPairEd25519.fromRandom();
            case 'FALCON512': return KeyPairFalcon512.fromRandom();
            default: throw new Error(`Unknown algo ${algo}`);
        }
    }
    static fromString(encodedKey) {
        const parts = encodedKey.split(':');
        if (parts.length === 1) {
            return new KeyPairEd25519(parts[0]);
        }
        else if (parts.length === 2) {
            switch (parts[0].toUpperCase()) {
                case 'ED25519': return new KeyPairEd25519(parts[1]);
                case 'FALCON512': return new KeyPairFalcon512(parts[1]);
                default: throw new Error(`Unknown algo: ${parts[0]}`);
            }
        }
        else {
            throw new Error('Invalid encoded key format, must be <algo>:<encoded key>');
        }
    }
}
exports.KeyPair = KeyPair;
/**
 * This class provides key pair functionality for Ed25519 curve:
 * generating key pairs, encoding key pairs, signing and verifying.
 */
class KeyPairEd25519 extends KeyPair {
    publicKey;
    secretKey;
    /**
     * Construct an instance of key pair given a secret key.
     * It's generally assumed that these are encoded in base58.
     * @param {string} secretKey
     */
    constructor(secretKey) {
        super();
        const keyPair = tweetnacl_1.default.sign.keyPair.fromSecretKey((0, serialize_1.base_decode)(secretKey));
        this.publicKey = new PublicKeyEd25519({ keyType: KeyType.ED25519, data: keyPair.publicKey });
        this.secretKey = secretKey;
    }
    /**
     * Generate a new random keypair.
     * @example
     * const keyRandom = KeyPair.fromRandom();
     * keyRandom.publicKey
     * // returns [PUBLIC_KEY]
     *
     * keyRandom.secretKey
     * // returns [SECRET_KEY]
     */
    static fromRandom() {
        const newKeyPair = tweetnacl_1.default.sign.keyPair();
        return new KeyPairEd25519((0, serialize_1.base_encode)(newKeyPair.secretKey));
    }
    sign(message) {
        const signature = tweetnacl_1.default.sign.detached(message, (0, serialize_1.base_decode)(this.secretKey));
        return { signature, publicKey: this.publicKey };
    }
    verify(message, signature) {
        return this.publicKey.verify(message, signature);
    }
    toString() {
        return `ed25519:${this.secretKey}`;
    }
    getPublicKey() {
        return this.publicKey;
    }
}
exports.KeyPairEd25519 = KeyPairEd25519;
/**
 * This class provides key pair functionality for Ed25519 curve:
 * generating key pairs, encoding key pairs, signing and verifying.
 */
class KeyPairFalcon512 extends KeyPair {
    publicKey;
    secretKey;
    /**
     * Construct an instance of key pair given a secret key.
     * It's generally assumed that these are encoded in base58.
     * @param {string} secretKey
     */
    constructor(secretKey) {
        super();
        const pubKey = crypto_falcon_js_1.falcon.pubKey((0, serialize_1.base_decode)(secretKey));
        this.publicKey = new PublicKeyFalcon512({ keyType: KeyType.FALCON512, data: pubKey });
        this.secretKey = secretKey;
    }
    /**
     * Generate a new random keypair.
     * @example
     * const keyRandom = KeyPair.fromRandom();
     * keyRandom.publicKey
     * // returns [PUBLIC_KEY]
     *
     * keyRandom.secretKey
     * // returns [SECRET_KEY]
     */
    static fromRandom() {
        const newKeyPair = crypto_falcon_js_1.falcon.keyPair();
        return new KeyPairFalcon512((0, serialize_1.base_encode)(newKeyPair.privateKey));
    }
    sign(message) {
        const signature = crypto_falcon_js_1.falcon.signDetached(message, (0, serialize_1.base_decode)(this.secretKey));
        return { signature, publicKey: this.publicKey };
    }
    verify(message, signature) {
        return this.publicKey.verify(message, signature);
    }
    toString() {
        return `falcon512:${this.secretKey}`;
    }
    getPublicKey() {
        return this.publicKey;
    }
}
exports.KeyPairFalcon512 = KeyPairFalcon512;
