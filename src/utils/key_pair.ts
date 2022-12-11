import nacl from 'tweetnacl';
import { base_encode, base_decode } from './serialize';
import { Assignable } from './enums';
import { falcon } from 'crypto_falcon_js';

export type Arrayish = string | ArrayLike<number>;

export interface Signature {
    signature: Uint8Array;
    publicKey: PublicKey;
}

/** All supported key types */
export enum KeyType {
    ED25519 = 0,
    FALCON512 = 2
}

function key_type_to_str(keyType: KeyType): string {
    switch (keyType) {
    case KeyType.ED25519: return 'ed25519';
    case KeyType.FALCON512: return 'falcon512';
    default: throw new Error(`Unknown key type ${keyType}`);
    }
}

function str_to_key_type(keyType: string): KeyType {
    switch (keyType.toLowerCase()) {
    case 'ed25519': return KeyType.ED25519;
    case 'falcon512': return KeyType.FALCON512;
    default: throw new Error(`Unknown key type ${keyType}`);
    }
}

/**
 * PublicKey representation that has type and bytes of the key.
 */
export abstract class PublicKey extends Assignable {
    keyType: KeyType;
    data: Uint8Array;

    static from(value: string | PublicKey): PublicKey {
        if (typeof value === 'string') {
            return PublicKey.fromString(value);
        }
        return value;
    }

    static fromString(encodedKey: string): PublicKeyEd25519 | PublicKeyFalcon512 {
        const parts = encodedKey.split(':');
        if (parts.length === 1) {
            return new PublicKeyEd25519({ keyType: KeyType.ED25519, data: base_decode(parts[0]) });
        } else if (parts.length === 2) {
            if(str_to_key_type(parts[0]) === KeyType.ED25519) {
                return new PublicKeyEd25519({ keyType: KeyType.ED25519, data: base_decode(parts[1]) });
            } else if (str_to_key_type(parts[0]) === KeyType.FALCON512) {
                return new PublicKeyFalcon512({ keyType: KeyType.FALCON512, data: base_decode(parts[1]) });
            } else {
                throw new Error('Unknown key type');
            }
        } else {
            throw new Error('Invalid encoded key format, must be <algo>:<encoded key>');
        }
    }

    abstract toString(): string;

    abstract verify(message: Uint8Array, signature: Uint8Array): boolean;
}

export class PublicKeyEd25519 extends PublicKey {
    toString(): string {
        return `${key_type_to_str(KeyType.ED25519)}:${base_encode(this.data)}`;
    }

    verify(message: Uint8Array, signature: Uint8Array): boolean {
        return nacl.sign.detached.verify(message, signature, this.data);
    }
}

export class PublicKeyFalcon512 extends PublicKey {
    toString(): string {
        return `${key_type_to_str(KeyType.FALCON512)}:${base_encode(this.data)}`;
    }

    verify(message: Uint8Array, signature: Uint8Array): boolean {
        return falcon.verifyDetached(signature, message, this.data);
    }
}

export abstract class KeyPair {
    abstract sign(message: Uint8Array): Signature;
    abstract verify(message: Uint8Array, signature: Uint8Array): boolean;
    abstract toString(): string;
    abstract getPublicKey(): PublicKey;

    /**
     * @param algo Name of elliptical curve, case-insensitive
     * @returns Random KeyPair based on the curve
     */
    static fromRandom(algo: string): KeyPair {
        switch (algo.toUpperCase()) {
        case 'ED25519': return KeyPairEd25519.fromRandom();
        case 'FALCON512': return KeyPairFalcon512.fromRandom();
        default: throw new Error(`Unknown algo ${algo}`);
        }
    }

    static fromString(encodedKey: string): KeyPair {
        const parts = encodedKey.split(':');
        if (parts.length === 1) {
            return new KeyPairEd25519(parts[0]);
        } else if (parts.length === 2) {
            switch (parts[0].toUpperCase()) {
            case 'ED25519': return new KeyPairEd25519(parts[1]);
            case 'FALCON512': return new KeyPairFalcon512(parts[1]);
            default: throw new Error(`Unknown algo: ${parts[0]}`);
            }
        } else {
            throw new Error('Invalid encoded key format, must be <algo>:<encoded key>');
        }
    }
}

/**
 * This class provides key pair functionality for Ed25519 curve:
 * generating key pairs, encoding key pairs, signing and verifying.
 */
export class KeyPairEd25519 extends KeyPair {
    readonly publicKey: PublicKey;
    readonly secretKey: string;

    /**
     * Construct an instance of key pair given a secret key.
     * It's generally assumed that these are encoded in base58.
     * @param {string} secretKey
     */
    constructor(secretKey: string) {
        super();
        const keyPair = nacl.sign.keyPair.fromSecretKey(base_decode(secretKey));
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
        const newKeyPair = nacl.sign.keyPair();
        return new KeyPairEd25519(base_encode(newKeyPair.secretKey));
    }

    sign(message: Uint8Array): Signature {
        const signature = nacl.sign.detached(message, base_decode(this.secretKey));
        return { signature, publicKey: this.publicKey };
    }

    verify(message: Uint8Array, signature: Uint8Array): boolean {
        return this.publicKey.verify(message, signature);
    }

    toString(): string {
        return `ed25519:${this.secretKey}`;
    }

    getPublicKey(): PublicKey {
        return this.publicKey;
    }
}

/**
 * This class provides key pair functionality for Ed25519 curve:
 * generating key pairs, encoding key pairs, signing and verifying.
 */
 export class KeyPairFalcon512 extends KeyPair {
    readonly publicKey: PublicKey;
    readonly secretKey: string;

    /**
     * Construct an instance of key pair given a secret key.
     * It's generally assumed that these are encoded in base58.
     * @param {string} secretKey
     */
    constructor(secretKey: string) {
        super();
        const pubKey = falcon.pubKey(base_decode(secretKey));
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
        const newKeyPair = falcon.keyPair();
        return new KeyPairFalcon512(base_encode(newKeyPair.privateKey));
    }

    sign(message: Uint8Array): Signature {
        const signature = falcon.signDetached(message, base_decode(this.secretKey));
        return { signature, publicKey: this.publicKey };
    }

    verify(message: Uint8Array, signature: Uint8Array): boolean {
        return this.publicKey.verify(message, signature);
    }

    toString(): string {
        return `falcon512:${this.secretKey}`;
    }

    getPublicKey(): PublicKey {
        return this.publicKey;
    }
}
