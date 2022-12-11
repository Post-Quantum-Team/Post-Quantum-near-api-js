const nearApi = require('../../src/index');
const { ServerError } = require('../../src/utils/rpc_errors');
const {
    parseRpcError,
    formatError,
    getErrorTypeFromErrorMessage,
} = nearApi.utils.rpc_errors;
describe('rpc-errors', () => {
    test('test AccountAlreadyExists error', async () => {
        let rpc_error = {
            TxExecutionError: {
                ActionError: {
                    index: 1,
                    kind: {AccountAlreadyExists: {account_id: 'bob.near'}}
                }
            }
        };
        let error = parseRpcError(rpc_error);
        expect(error.type === 'AccountAlreadyExists').toBe(true);
        expect(error.index).toBe(1);
        expect(error.account_id).toBe('bob.near');
        expect(formatError(error.type, error)).toBe('Can\'t create a new account bob.near, because it already exists');
    });

    test('test ReceiverMismatch error', async () => {
        let rpc_error = {
            TxExecutionError: {
                InvalidTxError: {
                    InvalidAccessKeyError: {
                        ReceiverMismatch: {
                            ak_receiver: 'test.near',
                            tx_receiver: 'bob.near'
                        }
                    }
                }
            }
        };
        let error = parseRpcError(rpc_error);
        expect(error.type === 'ReceiverMismatch').toBe(true);
        expect(error.ak_receiver).toBe('test.near');
        expect(error.tx_receiver).toBe('bob.near');
        expect(formatError(error.type, error)).toBe(
            'Wrong AccessKey used for transaction: transaction is sent to receiver_id=bob.near, but is signed with function call access key that restricted to only use with receiver_id=test.near. Either change receiver_id in your transaction or switch to use a FullAccessKey.'
        );
    });

    test('test InvalidIteratorIndex error', async () => {
        let rpc_error = {
            TxExecutionError: {
                ActionError: {
                    FunctionCallError: {
                        HostError: {
                            InvalidIteratorIndex: {iterator_index: 42}
                        }
                    }
                }
            }
        };
        let error = parseRpcError(rpc_error);
        expect(error.type === 'InvalidIteratorIndex').toBe(true);
        expect(error.iterator_index).toBe(42);
        expect(formatError(error.type, error)).toBe('Iterator index 42 does not exist');
    });

    test('test ActionError::FunctionCallError::GasLimitExceeded error', async () => {
        let rpc_error = {
            ActionError: {
                'index': 0,
                'kind': {
                    FunctionCallError: {
                        'HostError': 'GasLimitExceeded'
                    }
                }
            }
        };
        let error = parseRpcError(rpc_error);
        expect(error.type === 'GasLimitExceeded').toBe(true);

        expect(formatError(error.type, error)).toBe('Exceeded the maximum amount of gas allowed to burn per contract');
    });

    test('test parse error object', async () => {
        const errorStr = '{"status":{"Failure":{"ActionError":{"index":0,"kind":{"FunctionCallError":{"EvmError":"ArgumentParseError"}}}}},"transaction":{"signer_id":"test.near","public_key":"falcon512:33voTQqbGnpngJrBqX3UZL6WXTzxpeVYeBoxPb3fy7ct4hJ5M4VkuDmUCUo49Jgwiffbgfk5797JVLQUGm5jimev14djD9EAzBPWQmqm1WQE5oHK71pDUBVo8Szs1DyEsmQGF4yG9VzTmfa79BfKE486HxsVQ5byn6nKb9vMdd1VAFP4g8MJKhSwXVpqLh5SG6E6THLxTb8Gbf6CnAE1RD7VC1Z4K67PM7vNyqbb2JdQFaDPjBm5vuNVdA31mkrt7HRt2ARMGddjVRQcZNd8eQ1imvV22WuxKcod7tKGz8NN9G3uUmahvQZXHkoQmjerFGQ9YHqhaTqn956hh95UwiRKXMNuE4ERpH3imj713MCvmYbSm8KhL3DzShzbkyRekjTNvsiHWAGWjzdBiJKrnjzUc1Qm16ZAyRr4ZhGw9zK1F7ouoKFKUQXgTpsHoeYLsDF6WGvo4QCkCuppJxS34hxjr23eLoRudx7bYwX17gb6gmdSAZE1A3DFGW2kW8qEpMc4asLFyHUzcmqCjQnCiHjwZsN9B1HxU9EBog9djCvExbsU4a16DFf1Pv3EuyiskrSWuRuKifjC92w2Kk1NFb87d2yRfbjAJCMMCKpXVAtrTDb1nPm4GBdLoRRd6NEm5fidxhwaH58f6B874ym6RJt6wBV2Q1LEgSzAGrZBktsu1sWt8ueZkyHRS7WSLuHQtKeVLZn8MjXWb1yrCzJBeVJS8VVKJ3iEJRZS77568aruyZEMu1fe8jq5MXDG1LacHkaCX4vYpfXLRd8dZcASYyQZ6EoFxoYdoturAnJXZo3mqbH4WMALcgo45tTncCXBxhXdhxNMLF9pWnyAm2ajRxsWHoYg6rzBMnoQjRPpQZ3GragsLLHsFVmDvw2sPsdnHoc1h31YVBVV9TzXfTAigYwcamUuoGZbSHmwiamzdUYu838hJiFJCNnVFAQ3VrMEvzt6R28SPj32WhzZpKBLDWcoRkymSJBm1WmmzbEsufHNcHBFARuSpinF7yK1hV6KSCbsdEkV5Ps3TqTe5KcRcPQF5viL9tY8iFh3k6uB4ZvqsdGmpahJNpc62WnMDLnWcNoZDKqAFiJo3yiW1MRCteM95ZNbdPqJPGU87BkP5MMQVUG6PzDEhowqshhAYABWH8U3mhXcjsPz8iGRauasDxCnZi1tzRp8oPSeVMZVPbDeKcvqsBW3Le49xh14esotN3Eq1YJYD","nonce":110,"receiver_id":"evm","actions":[{"FunctionCall":{"method_name":"transfer","args":"888ZO7SvECKvfSCJ832LrnFXuF/QKrSGztwAAA==","gas":300000000000000,"deposit":"0"}}],"signature":"falcon512:2v6fcecwJ9iaftYr1sioGENPLvroJ1XRK4QfZHF57WtEQdpsCaPn2HaWETH2U2YJVapWKWA3s1vhoTNa7ZpdqGpy4GmaqDSN9XCdT7PZnH6xqeLkbxqDyMGkoXC2RZFbSG9HEXmbQ99UrWGn1ZKbooiwxkGFR7CVzERWEs4jJHSyGJFyg75qZgirNdYSXmvq7yroc1Shv8VyG8u8QvowUCzZhpTZ3FBqbTrf2xUW2V1eUd7CBhc2Wxbwta57WadwTkw9XL51KkMPYNJrrov2vj8H8TKyJs5hWtkq7sSNSZvhn57Y8rnJte329oEqSfxjNmrmLtfEqa78AZAgzzj7BpBrmJpSzBj2PxtYajNeqpyP59e7LFsztV8t3eoWS7moRGUs2m98KSXPvnKvfgoGbMYue5JT6cjMuMEsSVb65Hi8aXZYeCXWX4AnTtn4oyQ1NzTj3jzNx7KYmt5QdquPz5hoMVeLBUMdyMSFwxJAQT5cgwS3VUrCfzNrzEz9oEti5kzc4i9WdBtTWRNnPuAB5UFPxHCR2xz17kqqLUhajaNkazCWsYzjfLWRFTaq9rT5rRQ5JnvWpzaHZkq5VtLmD4XWwwzCLVxifQwJL3dM7ghPDxqAPC7Ngbh6LXx4bjmbgNvueQLLpzkzhgHVccTy6reCqHrYSUKAKRKPziFEsvapvUdZcRTXwt9zqQBgPwxCWCv6Wwn8m9429WM8dErevM91dCTdb32ktMQDZrtS8r8eqPHwxtgKcNakhkZ1EiCHieYjjJASsV7juKfD5p2TGvFFm6isfGN8W2BSr7iJsCPmmpMqV1VqMX2DwtbvckAt7ygUEueXJs6dDF1FS97U7LdWKk3TQbfuGymgRV6cDH8KdWHJqdLsmdyBTGUD79kD27iyozttYuB9eF","hash":"E1QorKKEh1WLJwRQSQ1pdzQN3f8yeFsQQ8CbJjnz1ZQe"},"transaction_outcome":{"proof":[],"block_hash":"HXXBPjGp65KaFtam7Xr67B8pZVGujZMZvTmVW6Fy9tXf","id":"E1QorKKEh1WLJwRQSQ1pdzQN3f8yeFsQQ8CbJjnz1ZQe","outcome":{"logs":[],"receipt_ids":["ZsKetkrZQGVTtmXr2jALgNjzcRqpoQQsk9HdLmFafeL"],"gas_burnt":2428001493624,"tokens_burnt":"2428001493624000000000","executor_id":"test.near","status":{"SuccessReceiptId":"ZsKetkrZQGVTtmXr2jALgNjzcRqpoQQsk9HdLmFafeL"}}},"receipts_outcome":[{"proof":[],"block_hash":"H6fQCVpxBDv9y2QtmTVHoxHibJvamVsHau7fDi7AmFa2","id":"ZsKetkrZQGVTtmXr2jALgNjzcRqpoQQsk9HdLmFafeL","outcome":{"logs":[],"receipt_ids":["DgRyf1Wv3ZYLFvM8b67k2yZjdmnyUUJtRkTxAwoFi3qD"],"gas_burnt":2428001493624,"tokens_burnt":"2428001493624000000000","executor_id":"evm","status":{"Failure":{"ActionError":{"index":0,"kind":{"FunctionCallError":{"EvmError":"ArgumentParseError"}}}}}}},{"proof":[],"block_hash":"9qNVA235L9XdZ8rZLBAPRNBbiGPyNnMUfpbi9WxbRdbB","id":"DgRyf1Wv3ZYLFvM8b67k2yZjdmnyUUJtRkTxAwoFi3qD","outcome":{"logs":[],"receipt_ids":[],"gas_burnt":0,"tokens_burnt":"0","executor_id":"test.near","status":{"SuccessValue":""}}}]}';
        const error = parseRpcError(JSON.parse(errorStr).status.Failure);
        expect(error).toEqual(new ServerError('{"index":0,"kind":{"EvmError":"ArgumentParseError"}}'));
    });

    test('test getErrorTypeFromErrorMessage', () => {
        const err1 = 'account random.near does not exist while viewing';
        const err2 = 'Account random2.testnet doesn\'t exist';
        const err3 = 'access key falcon512:33voTQqbGnpngJrBqX3UZL6WXTzxpeVYeBoxPb3fy7ct4hJ5M4VkuDmUCUo49Jgwiffbgfk5797JVLQUGm5jimev14djD9EAzBPWQmqm1WQE5oHK71pDUBVo8Szs1DyEsmQGF4yG9VzTmfa79BfKE486HxsVQ5byn6nKb9vMdd1VAFP4g8MJKhSwXVpqLh5SG6E6THLxTb8Gbf6CnAE1RD7VC1Z4K67PM7vNyqbb2JdQFaDPjBm5vuNVdA31mkrt7HRt2ARMGddjVRQcZNd8eQ1imvV22WuxKcod7tKGz8NN9G3uUmahvQZXHkoQmjerFGQ9YHqhaTqn956hh95UwiRKXMNuE4ERpH3imj713MCvmYbSm8KhL3DzShzbkyRekjTNvsiHWAGWjzdBiJKrnjzUc1Qm16ZAyRr4ZhGw9zK1F7ouoKFKUQXgTpsHoeYLsDF6WGvo4QCkCuppJxS34hxjr23eLoRudx7bYwX17gb6gmdSAZE1A3DFGW2kW8qEpMc4asLFyHUzcmqCjQnCiHjwZsN9B1HxU9EBog9djCvExbsU4a16DFf1Pv3EuyiskrSWuRuKifjC92w2Kk1NFb87d2yRfbjAJCMMCKpXVAtrTDb1nPm4GBdLoRRd6NEm5fidxhwaH58f6B874ym6RJt6wBV2Q1LEgSzAGrZBktsu1sWt8ueZkyHRS7WSLuHQtKeVLZn8MjXWb1yrCzJBeVJS8VVKJ3iEJRZS77568aruyZEMu1fe8jq5MXDG1LacHkaCX4vYpfXLRd8dZcASYyQZ6EoFxoYdoturAnJXZo3mqbH4WMALcgo45tTncCXBxhXdhxNMLF9pWnyAm2ajRxsWHoYg6rzBMnoQjRPpQZ3GragsLLHsFVmDvw2sPsdnHoc1h31YVBVV9TzXfTAigYwcamUuoGZbSHmwiamzdUYu838hJiFJCNnVFAQ3VrMEvzt6R28SPj32WhzZpKBLDWcoRkymSJBm1WmmzbEsufHNcHBFARuSpinF7yK1hV6KSCbsdEkV5Ps3TqTe5KcRcPQF5viL9tY8iFh3k6uB4ZvqsdGmpahJNpc62WnMDLnWcNoZDKqAFiJo3yiW1MRCteM95ZNbdPqJPGU87BkP5MMQVUG6PzDEhowqshhAYABWH8U3mhXcjsPz8iGRauasDxCnZi1tzRp8oPSeVMZVPbDeKcvqsBW3Le49xh14esotN3Eq1YJYD does not exist while viewing';
        const err4 = 'wasm execution failed with error: FunctionCallError(CompilationError(CodeDoesNotExist { account_id: "random.testnet" }))';
        const err5 = '[-32000] Server error: Invalid transaction: Transaction nonce 1 must be larger than nonce of the used access key 1';
        expect(getErrorTypeFromErrorMessage(err1)).toEqual('AccountDoesNotExist');
        expect(getErrorTypeFromErrorMessage(err2)).toEqual('AccountDoesNotExist');
        expect(getErrorTypeFromErrorMessage(err3)).toEqual('AccessKeyDoesNotExist');
        expect(getErrorTypeFromErrorMessage(err4)).toEqual('CodeDoesNotExist');
        expect(getErrorTypeFromErrorMessage(err5)).toEqual('InvalidNonce');
        expect(getErrorTypeFromErrorMessage('random string')).toEqual('UntypedError');
        expect(getErrorTypeFromErrorMessage(undefined)).toEqual('UntypedError');
        expect(getErrorTypeFromErrorMessage('')).toEqual('UntypedError');
    });

    test('test NotEnoughBalance message uses human readable values', () => {
        const error = parseRpcError({
            NotEnoughBalance: {
                balance: '1000000000000000000000000',
                cost: '10000000000000000000000000',
                signer_id: 'test.near'
            }
        });

        expect(error.message).toEqual('Sender test.near does not have enough balance 1 for operation costing 10');
    });

    test('test TriesToStake message uses human readable values', () => {
        const error = parseRpcError({
            TriesToStake: {
                account_id: 'test.near',
                balance: '9000000000000000000000000',
                locked: '1000000000000000000000000',
                stake: '10000000000000000000000000',
            }
        });

        expect(error.message).toEqual('Account test.near tried to stake 10, but has staked 1 and only has 9');
    });
});
