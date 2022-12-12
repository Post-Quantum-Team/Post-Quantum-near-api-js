export type Arrayish = string | ArrayLike<number>;
export interface Signature {
    signature: Uint8Array;
    publicKey: PublicKey;
}
/** All supported key types */
export declare enum KeyType {
    ED25519 = 0,
    FALCON512 = 2
}
/**
 * PublicKey representation that has type and bytes of the key.
 */
export declare abstract class PublicKey {
    keyType: KeyType;
    data: Uint8Array;
    constructor(args: any);
    static from(value: string | PublicKey): PublicKey;
    static fromString(encodedKey: string): PublicKeyEd25519 | PublicKeyFalcon512;
    abstract toString(): string;
    abstract verify(message: Uint8Array, signature: Uint8Array): boolean;
}
export declare class PublicKeyEd25519 extends PublicKey {
    toString(): string;
    verify(message: Uint8Array, signature: Uint8Array): boolean;
}
export declare class PublicKeyFalcon512 extends PublicKey {
    toString(): string;
    verify(message: Uint8Array, signature: Uint8Array): boolean;
}
export declare abstract class KeyPair {
    abstract sign(message: Uint8Array): Signature;
    abstract verify(message: Uint8Array, signature: Uint8Array): boolean;
    abstract toString(): string;
    abstract getPublicKey(): PublicKey;
    /**
     * @param algo Name of elliptical curve, case-insensitive
     * @returns Random KeyPair based on the curve
     */
    static fromRandom(algo: string): KeyPair;
    static fromString(encodedKey: string): KeyPair;
}
/**
 * This class provides key pair functionality for Ed25519 curve:
 * generating key pairs, encoding key pairs, signing and verifying.
 */
export declare class KeyPairEd25519 extends KeyPair {
    readonly publicKey: PublicKey;
    readonly secretKey: string;
    /**
     * Construct an instance of key pair given a secret key.
     * It's generally assumed that these are encoded in base58.
     * @param {string} secretKey
     */
    constructor(secretKey: string);
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
    static fromRandom(): KeyPairEd25519;
    sign(message: Uint8Array): Signature;
    verify(message: Uint8Array, signature: Uint8Array): boolean;
    toString(): string;
    getPublicKey(): PublicKey;
}
/**
 * This class provides key pair functionality for Ed25519 curve:
 * generating key pairs, encoding key pairs, signing and verifying.
 */
export declare class KeyPairFalcon512 extends KeyPair {
    readonly publicKey: PublicKey;
    readonly secretKey: string;
    /**
     * Construct an instance of key pair given a secret key.
     * It's generally assumed that these are encoded in base58.
     * @param {string} secretKey
     */
    constructor(secretKey: string);
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
    static fromRandom(): KeyPairFalcon512;
    sign(message: Uint8Array): Signature;
    verify(message: Uint8Array, signature: Uint8Array): boolean;
    toString(): string;
    getPublicKey(): PublicKey;
}
