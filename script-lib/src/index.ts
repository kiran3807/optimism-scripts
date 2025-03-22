import {  
    parseEther, decodeEventLog
} from "viem";
import { 
    getTransactionCount 
} from 'viem/actions'
import { 
    PrivateKeyAccount, Address 
} from "viem/accounts";

import { 
    OptimismLocal, OptimismSepolia, EthSepolia, 
    accountLocal, accountSepolia, L1Interactor, L2Interactor,
    GREETER_CONTRACT_LOCAL, GREETER_CONTRACT_SEPOLIA, t
} from './config.js';
import { GREETER_ABI } from "./constants.js";
import { optopia } from "viem/chains";

/*
    Relevant documentation:
    
    https://docs.optimism.io/app-developers/tutorials/bridging/cross-dom-bridge-eth
*/


async function getWrappedEthereum(
    account: PrivateKeyAccount, 
    ethTestnet: L1Interactor, 
    optimism: L2Interactor
) {
    
    const depositArgs = await optimism.provider.buildDepositTransaction({
        mint: parseEther('0.0001'),
        to: account.address,
    });

    const depositHash = await ethTestnet.wallet.depositTransaction(depositArgs);
    console.log(`Deposit transaction hash on L1: ${depositHash}`);

    const depositReceipt = await ethTestnet.provider.waitForTransactionReceipt({ hash: depositHash });
    console.log('L1 transaction confirmed:', depositReceipt);

    const [l2Hash] = optimism.getL2TransactionHashes(depositReceipt);
    const l2Receipt = await optimism.provider.waitForTransactionReceipt({
        hash: l2Hash,
    }); 
    console.log('L2 transaction confirmed:', l2Receipt);
    console.log('Deposit completed successfully!');

    return l2Receipt;
}

async function invokeGreeter(contractAddress: Address, contractAbi: any, account:PrivateKeyAccount, optimism: L2Interactor) {

    try {
        // View and Pure function invocation

        const message = await optimism.provider.readContract({
          address: contractAddress,
          abi: contractAbi,
          functionName: 'getMessage',
          args: []
        });
        console.log("Contract Message:", message);

        //state changing functions 

        const onChainNonce = await optimism.provider.getTransactionCount({
            address : account.address
        });

        const setNumberTxHash = await optimism.wallet.writeContract({
            address: contractAddress,
            abi: contractAbi,
            functionName: 'setNumber',
            account,
            args:[13],
            nonce : onChainNonce
        });

        const setNumberReceipt = await optimism.provider.waitForTransactionReceipt({
            hash: setNumberTxHash,
            timeout : 500_000
        });
        console.log('set number receipt: ', setNumberReceipt);

        const incrementTxHash = await optimism.wallet.writeContract({
            address: contractAddress,
            abi: contractAbi,
            functionName: 'increment',
            args: []
        });

        const incrementReceipt = await optimism.provider.waitForTransactionReceipt({
            hash: incrementTxHash,
            timeout : 500_000
        });
        console.log('increment reciept: ', incrementReceipt);

        const logs = incrementReceipt.logs.filter(
            log => log.address.toLowerCase() === contractAddress.toLowerCase()
        );
        if(logs) {
            for(const log of logs) {
                const decodedLog = decodeEventLog({
                    abi : contractAbi,
                    eventName: "NumberIncremented",
                    topics: log.topics,
                    data: log.data
                });
                console.log("Contract event name: ", decodedLog.eventName);
                console.log("Contract event value: ", decodedLog.args);
            }
        }
        console.log("Invocation done");

      } catch (error) {
        console.error("Achtung!", error);
      }
}


// const l1Balance = await EthSepolia.provider.getBalance({ address: accountSepolia.address });
// console.log(`Ethereum testnet Balance: ${formatEther(l1Balance)} ETH`);

// const reciept = await getWrappedEthereum(accountSepolia, EthSepolia, OptimismSepolia);


// await invokeGreeter(GREETER_CONTRACT_LOCAL as Address, GREETER_ABI, accountLocal, OptimismLocal);

await invokeGreeter(GREETER_CONTRACT_SEPOLIA as Address, GREETER_ABI, accountSepolia, OptimismSepolia);
