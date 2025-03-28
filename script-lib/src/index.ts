import {  
    parseEther, decodeEventLog, Hex
} from "viem";
import { 
    PrivateKeyAccount, Address 
} from "viem/accounts";

import { 
    OptimismAnvil, OptimismSepolia, EthSepolia, 
    accountAnvil, accountSepolia, L1Interactor, L2Interactor,
    GREETER_CONTRACT_ANVIL, GREETER_CONTRACT_SEPOLIA,
    OptimismKurtosis, accountKurtosis, EthKurtosis
} from './config.js';
import { GREETER_ABI, GREETER_BYTE_CODE } from "./constants.js";

/*
    Relevant documentation:
    
    https://docs.optimism.io/app-developers/tutorials/bridging/cross-dom-bridge-eth
*/
/*
    TODO:

    Include the simulate contract before actually sending a transaction

    Deploy MultiCall3 as part of the startup.sh as it would seem it does not come prepackaged 
    within Kurtosis

    Implement an example of using multicall3 on Anvil
*/

async function getOptimismEthers(
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
            args:[17],
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

async function deployContract(bytecode: string, contractABI: any, optimism: L2Interactor): Promise<Address> {
    const txHash = await optimism.wallet.deployContract({
        abi : contractABI,
        bytecode: bytecode as Hex,
        args: [],
    });
    console.log(`contract deployed, transaction hash: ${txHash}`);
    const deploymentReceipt = await optimism.provider.waitForTransactionReceipt({
        hash: txHash,
        timeout : 500_000
    });
    console.log("contract deployment receipt");
    console.log(deploymentReceipt);

    return deploymentReceipt.contractAddress as Hex;
}


const l1Balance = await EthKurtosis.provider.getBalance({ address: accountKurtosis.address });
console.log("L1 balance: ",l1Balance);

console.log("Sending minting transaction");
const reciept = await getOptimismEthers(accountKurtosis, EthKurtosis, OptimismKurtosis);
console.log(reciept);
const l2Balance = await OptimismKurtosis.provider.getBalance({ address: accountKurtosis.address });
console.log("L2 balance: ", l2Balance);


// await invokeGreeter(GREETER_CONTRACT_ANVIL as Address, GREETER_ABI, accountAnvil, OptimismAnvil);
// await invokeGreeter(GREETER_CONTRACT_SEPOLIA as Address, GREETER_ABI, accountSepolia, OptimismSepolia);


// const GREETER_CONTRACT_KURTOSIS = await deployContract(GREETER_BYTE_CODE, GREETER_ABI, OptimismKurtosis);
// await invokeGreeter(GREETER_CONTRACT_KURTOSIS as Address, GREETER_ABI, accountKurtosis, OptimismKurtosis);