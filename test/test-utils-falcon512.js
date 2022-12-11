const fs = require('fs').promises;
const BN = require('bn.js');
const key_pair = require('../src/utils/key_pair');

const nearApi = require('../src/index');

const networkId = 'unittest';

const HELLO_WASM_PATH = process.env.HELLO_WASM_PATH || 'node_modules/near-hello/dist/main.wasm';
const HELLO_WASM_BALANCE = new BN('10000000000000000000000000');
const HELLO_WASM_METHODS = {
    viewMethods: ['getValue', 'getLastResult'],
    changeMethods: ['setValue', 'callPromise']
};
const MULTISIG_WASM_PATH = process.env.MULTISIG_WASM_PATH || './test/wasm/multisig.wasm';
// Length of a random account. Set to 40 because in the protocol minimal allowed top-level account length should be at
// least 32.
const RANDOM_ACCOUNT_LENGTH = 40;

async function setUpTestConnection() {
    const keyStore = new nearApi.keyStores.InMemoryKeyStore();
    const config = Object.assign(require('./config')(process.env.NODE_ENV || 'local'), {
        networkId: networkId,
        deps: { keyStore },
    });
    console.warn(config);;

    if (config.masterAccount) {
        await keyStore.setKey(networkId, config.masterAccount, nearApi.utils.KeyPair.fromString('falcon512:2prjFkTciQYMD68X3XVtHyTkT2VXUxLowJnBwSwAneRJAbbTNzXzkt8rhX33RQP4jHhMXAHonvsBanepcB5KoKV3nPMndyjXj22mGyTc7NfWd9dCoYpD6aYyW1HThZURVntvDBRncLGAA9UYM7KKVA38EPC2yuSTbDFbcv7wTcLhkwBXAxZFGe4sqmX9zBM884d9uuS349vpXj2iaaYbTHf2dv9f2fTWtmLDuiDz8L8GTDBNH6ffEmtJmLqeDU5TsiFXwwE7RWovenTCLXxKDpAK7UCWuRpE5t69GGCCZTWDXepMwU1zWqfYfCAksF1vuLchTxNyMU7C9nASkCWQATn3fYsWSbZWAGbPPHMBzSmDPaxw53KkrJZnHzyQZK7LV34zdf4TSTQ9g7R422pRi1XUYrpa22ur6kdXLDcAn8iUcf7sKEpVRzMS5DvRsromnLFqwcLsdGBF7sYfm6Qv4LXq9Hwcc766hZTUnHXfgvaYwfi5xGpgRM8eaqBq5DKLHr5DKV3sCwzZmGTYYnM1ShkdQe1K4mMe8eEicw9cYoXJhRoxCTsjQVqpkinrL6gzEks9Gevyb72FCy1YeUyuoRF7gcG9yk6To4JYgP2woiYQWYdNyyAUQfm7rXPznbwFf9JCaYzQxKT4mVEvrhFiNJk2AtxbzMHh8HpVPa913YSjEnyP7QcJXQD8TmLWJeCgkX7YaqsEyvReNEy6aH5ACSERs6YqJipNKcjV8owVoMF42Au4ZhRZqHmTcgresbdzJoibtLvUZY4qbpmpAfH28V15SEK9mhUcRBsG7MVBCZ5SLUPMcz62JycxK3Gr8fWkxVyvR4kF22hV3w2hSkqjrgf97WomQU81Rt9q3KpbF8kR4zyCj37Z41AojZbgSg9yzgL6PQiZorDbjWsvqFmkT4SCH8FdYKHY6UkfE7uYnx1jYzKr86MUfwNsg5ZgYyyPvfA5gtLBdNTaGq5GxtPX8qhvFfrNpMzVTKW9nmQYTfU8T2G8XdGAVEM3Z5sXg7qCh6jLtqnyjXwfVnFXvGz5ryhnwANoge4uoj7LBynrzEwVdSyhFPpnkCE2WkwBTaAq4X4s7upxjz7v9t2XexMubFT1ajgBpR3q7AMUaTfe1TCodop94FuQa2QSmvoc6eFWYKx2iyUhr3oo5NJWoQLXX6srfyUwTaqHPdjvHgwHXJBCRW8nYkh7DYfmMZncunfDVHzowBow82dnnDEgUYajHsf1g7FsEsobdeLpkNAHLjNe6yQ3nXmW3ZGBhY4VD6eHeU52DJsGSvUC7HPAysFTCGQDuZrtcSAgHeKZ5JFvw5QgCXBptmhdAatjiENqeRs5DsxBcnmJ38QB9Uta5aKXssPonRDtUrQhsHddGKxCZZEAJocemjxnuRab8ttE1hXfCyDPapoVq7sBNQBtwzW2ZsB2QL27YKdQxJ8uvn4gAcm2sb8q5xhAYBLc9AoSJU2phRfB3e2N2Ned2cuSz27KxSWxaoYhQXGHp3auebCS8kjRpYkyTARcKubzuWNwfKp4URSBpMChpops9mzET7R7TTGn6c6n5JZnzgZwS2FYkpd4F6r6dV6AsCk5bmUiixWTfhUoPCgsebMiKfDzwPuTrwg1YRywv1kpZ7JAa7YXzqeTdqjNjEwUZJ3ktQBkRMwbC5WBbMTZRLhwjzPg1VhTjwLaREkh5xMjW8f8xgMaM1EG5GepZLkzyqPA1cBCQMAD6p9ZXuhzjp9By25eUMNa8Z'));
    }

    return nearApi.connect(config);
}

// Generate some unique string of length at least RANDOM_ACCOUNT_LENGTH with a given prefix using the alice nonce.
function generateUniqueString(prefix) {
    let result = `${prefix}-${Date.now()}-${Math.round(Math.random() * 1000000)}`;
    let add_symbols = Math.max(RANDOM_ACCOUNT_LENGTH - result.length, 1);
    for (let i = add_symbols; i > 0; --i) result += '0';
    return result;
}

async function createAccount(near) {
    console.log("Before generating accountid");
    const newAccountName = generateUniqueString('test');
    console.log("Account : " + newAccountName);
    console.log("Before creating key");
    const newPublicKey = await near.connection.signer.createKey(newAccountName, networkId, key_pair.KeyType.FALCON512);
    console.log("PublicKey : " + newPublicKey);
    console.log("Before creating account");
    await near.createAccount(newAccountName, newPublicKey);
    console.log("Before creating local account");
    const account = new nearApi.Account(near.connection, newAccountName);
    console.log("Before returning");
    return account;
}

async function createAccountMultisig(near, options) {
    const newAccountName = generateUniqueString('test');
    const newPublicKey = await near.connection.signer.createKey(newAccountName, networkId, key_pair.KeyType.FALCON512);
    await near.createAccount(newAccountName, newPublicKey);
    // add a confirm key for multisig (contract helper sim)
    
    try {
        const confirmKeyPair = nearApi.utils.KeyPair.fromRandom('falcon512');
        const { publicKey } = confirmKeyPair;
        // const account = new nearApi.Account(near.connection, newAccountName);
        // await account.addKey(publicKey, account.accountId, nearApi.multisig.MULTISIG_CONFIRM_METHODS, '0')
        // create multisig account instance and deploy contract
        const accountMultisig = new nearApi.multisig.AccountMultisig(near.connection, newAccountName, options);
        accountMultisig.useConfirmKey = async () => {
            await near.connection.signer.setKey(networkId, options.masterAccount, confirmKeyPair);
        };
        accountMultisig.getRecoveryMethods = () => ({ data: [] });
        accountMultisig.postSignedJson = async (path) => {
            switch (path) {
            case '/2fa/getAccessKey': return { publicKey };
            }
        };
        await accountMultisig.deployMultisig(new Uint8Array([...(await fs.readFile(MULTISIG_WASM_PATH))]));
        return accountMultisig;
    } catch(e) {
        console.log(e);
    }
}

async function deployContract(workingAccount, contractId) {
    const newPublicKey = await workingAccount.connection.signer.createKey(contractId, networkId, key_pair.KeyType.FALCON512);
    const data = [...(await fs.readFile(HELLO_WASM_PATH))];
    await workingAccount.createAndDeployContract(contractId, newPublicKey, data, HELLO_WASM_BALANCE);
    return new nearApi.Contract(workingAccount, contractId, HELLO_WASM_METHODS);
}

function sleep(time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time);
    });
}

function waitFor(fn) {
    const _waitFor = async (count = 10) => {
        try {
            return await fn();
        } catch(e) {
            if(count > 0) {
                await sleep(500);
                return _waitFor(count - 1);
            }
            else throw e;
        }
    };

    return _waitFor();
}

async function ensureDir(dirpath) {
    try {
        await fs.mkdir(dirpath, { recursive: true });
    } catch (err) {
        if (err.code !== 'EEXIST') throw err;
    }
}

module.exports = {
    setUpTestConnection,
    networkId,
    generateUniqueString,
    createAccount,
    createAccountMultisig,
    deployContract,
    sleep,
    waitFor,
    ensureDir,
    HELLO_WASM_PATH,
    HELLO_WASM_BALANCE,
};
