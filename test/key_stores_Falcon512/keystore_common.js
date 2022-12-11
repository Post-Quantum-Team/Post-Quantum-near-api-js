
const nearApi = require('../../src/index');

const KeyPair = nearApi.utils.KeyPairFalcon512;

const NETWORK_ID_SINGLE_KEY = 'singlekeynetworkid';
const ACCOUNT_ID_SINGLE_KEY = 'singlekey_accountid';
const KEYPAIR_SINGLE_KEY = new KeyPair('2prjFkTciQYMD68X3XVtHyTkT2VXUxLowJnBwSwAneRJAbbTNzXzkt8rhX33RQP4jHhMXAHonvsBanepcB5KoKV3nPMndyjXj22mGyTc7NfWd9dCoYpD6aYyW1HThZURVntvDBRncLGAA9UYM7KKVA38EPC2yuSTbDFbcv7wTcLhkwBXAxZFGe4sqmX9zBM884d9uuS349vpXj2iaaYbTHf2dv9f2fTWtmLDuiDz8L8GTDBNH6ffEmtJmLqeDU5TsiFXwwE7RWovenTCLXxKDpAK7UCWuRpE5t69GGCCZTWDXepMwU1zWqfYfCAksF1vuLchTxNyMU7C9nASkCWQATn3fYsWSbZWAGbPPHMBzSmDPaxw53KkrJZnHzyQZK7LV34zdf4TSTQ9g7R422pRi1XUYrpa22ur6kdXLDcAn8iUcf7sKEpVRzMS5DvRsromnLFqwcLsdGBF7sYfm6Qv4LXq9Hwcc766hZTUnHXfgvaYwfi5xGpgRM8eaqBq5DKLHr5DKV3sCwzZmGTYYnM1ShkdQe1K4mMe8eEicw9cYoXJhRoxCTsjQVqpkinrL6gzEks9Gevyb72FCy1YeUyuoRF7gcG9yk6To4JYgP2woiYQWYdNyyAUQfm7rXPznbwFf9JCaYzQxKT4mVEvrhFiNJk2AtxbzMHh8HpVPa913YSjEnyP7QcJXQD8TmLWJeCgkX7YaqsEyvReNEy6aH5ACSERs6YqJipNKcjV8owVoMF42Au4ZhRZqHmTcgresbdzJoibtLvUZY4qbpmpAfH28V15SEK9mhUcRBsG7MVBCZ5SLUPMcz62JycxK3Gr8fWkxVyvR4kF22hV3w2hSkqjrgf97WomQU81Rt9q3KpbF8kR4zyCj37Z41AojZbgSg9yzgL6PQiZorDbjWsvqFmkT4SCH8FdYKHY6UkfE7uYnx1jYzKr86MUfwNsg5ZgYyyPvfA5gtLBdNTaGq5GxtPX8qhvFfrNpMzVTKW9nmQYTfU8T2G8XdGAVEM3Z5sXg7qCh6jLtqnyjXwfVnFXvGz5ryhnwANoge4uoj7LBynrzEwVdSyhFPpnkCE2WkwBTaAq4X4s7upxjz7v9t2XexMubFT1ajgBpR3q7AMUaTfe1TCodop94FuQa2QSmvoc6eFWYKx2iyUhr3oo5NJWoQLXX6srfyUwTaqHPdjvHgwHXJBCRW8nYkh7DYfmMZncunfDVHzowBow82dnnDEgUYajHsf1g7FsEsobdeLpkNAHLjNe6yQ3nXmW3ZGBhY4VD6eHeU52DJsGSvUC7HPAysFTCGQDuZrtcSAgHeKZ5JFvw5QgCXBptmhdAatjiENqeRs5DsxBcnmJ38QB9Uta5aKXssPonRDtUrQhsHddGKxCZZEAJocemjxnuRab8ttE1hXfCyDPapoVq7sBNQBtwzW2ZsB2QL27YKdQxJ8uvn4gAcm2sb8q5xhAYBLc9AoSJU2phRfB3e2N2Ned2cuSz27KxSWxaoYhQXGHp3auebCS8kjRpYkyTARcKubzuWNwfKp4URSBpMChpops9mzET7R7TTGn6c6n5JZnzgZwS2FYkpd4F6r6dV6AsCk5bmUiixWTfhUoPCgsebMiKfDzwPuTrwg1YRywv1kpZ7JAa7YXzqeTdqjNjEwUZJ3ktQBkRMwbC5WBbMTZRLhwjzPg1VhTjwLaREkh5xMjW8f8xgMaM1EG5GepZLkzyqPA1cBCQMAD6p9ZXuhzjp9By25eUMNa8Z');

module.exports.shouldStoreAndRetriveKeys = ctx => {
    beforeEach(async () => {
        await ctx.keyStore.clear();
        await ctx.keyStore.setKey(NETWORK_ID_SINGLE_KEY, ACCOUNT_ID_SINGLE_KEY, KEYPAIR_SINGLE_KEY);
    });

    test('Get all keys with empty network returns empty list', async () => {
        const emptyList = await ctx.keyStore.getAccounts('emptynetwork');
        expect(emptyList).toEqual([]);
    });  
    
    test('Get all keys with single key in keystore', async () => {
        const accountIds = await ctx.keyStore.getAccounts(NETWORK_ID_SINGLE_KEY);
        expect(accountIds).toEqual([ACCOUNT_ID_SINGLE_KEY]);
    });

    test('Get not-existing account', async () => {
        expect(await ctx.keyStore.getKey('somenetwork', 'someaccount')).toBeNull();
    });

    test('Get account id from a network with single key', async () => {
        const key = await ctx.keyStore.getKey(NETWORK_ID_SINGLE_KEY, ACCOUNT_ID_SINGLE_KEY);
        expect(key).toEqual(KEYPAIR_SINGLE_KEY);
    });

    test('Get networks', async () => {
        const networks = await ctx.keyStore.getNetworks();
        expect(networks).toEqual([NETWORK_ID_SINGLE_KEY]);
    });

    test('Add two keys to network and retrieve them', async () => {
        const networkId = 'twoKeyNetwork';
        const accountId1 = 'acc1';
        const accountId2 = 'acc2';
        const key1Expected = KeyPair.fromRandom();
        const key2Expected = KeyPair.fromRandom();
        await ctx.keyStore.setKey(networkId, accountId1, key1Expected);
        await ctx.keyStore.setKey(networkId, accountId2, key2Expected);
        const key1 = await ctx.keyStore.getKey(networkId, accountId1);
        const key2 = await ctx.keyStore.getKey(networkId, accountId2);
        expect(key1).toEqual(key1Expected);
        expect(key2).toEqual(key2Expected);
        const accountIds = await ctx.keyStore.getAccounts(networkId);
        expect(accountIds).toEqual([accountId1, accountId2]);
        const networks = await ctx.keyStore.getNetworks();
        expect(networks).toEqual([NETWORK_ID_SINGLE_KEY, networkId]);
    });
};
