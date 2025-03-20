import { 
    createPublicClient, createWalletClient, 
    http, formatEther, parseEther, decodeEventLog
} from "viem";
import { optimismSepolia, sepolia } from "viem/chains";
import { 
    publicActionsL2, walletActionsL2, publicActionsL1,
    walletActionsL1, getL2TransactionHashes 
} from "viem/op-stack";
import { privateKeyToAccount, PrivateKeyAccount, Address } from "viem/accounts";
import dotenv from "dotenv";

import { GREETER_ABI } from "./constants.js";

/*
    Relevant documentation:
    
    https://docs.optimism.io/app-developers/tutorials/bridging/cross-dom-bridge-eth
*/

dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const PUBLIC_KEY = process.env.PUBLIC_KEY || "";
const GREETER_CONTRACT = "0x97daE37258eD466A0430BeA56Ea49A495e481871";
const SEPOLIA_RPC = "https://ethereum-sepolia-rpc.publicnode.com";
const OPTIMISM_RPC = "https://sepolia.optimism.io";


const account: PrivateKeyAccount = privateKeyToAccount(`0x${PRIVATE_KEY}`);

const EthTestnet = {
    
    provider : createPublicClient({
        chain: sepolia,
        transport: http(SEPOLIA_RPC),
    }).extend(publicActionsL1()),

    wallet : createWalletClient({
        account : account,
        chain: sepolia,
        transport: http(SEPOLIA_RPC),
    }).extend(walletActionsL1())
}

const Optimism = {

    provider : createPublicClient({
        chain: optimismSepolia,
        transport: http(OPTIMISM_RPC),
    }).extend(publicActionsL2()),

    wallet : createWalletClient({
        account: account,
        chain: optimismSepolia,
        transport: http(OPTIMISM_RPC),
    }).extend(walletActionsL2()),
    
    getL2TransactionHashes : getL2TransactionHashes
}

type L1Interactor = typeof EthTestnet;
type L2Interactor = typeof Optimism;

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

        const setNumberTxHash = await optimism.wallet.writeContract({
            address: contractAddress,
            abi: contractAbi,
            functionName: 'setNumber',
            account,
            args:[13]
        });

        const setNumberReceipt = await Optimism.provider.waitForTransactionReceipt({
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

        const incrementReceipt = await Optimism.provider.waitForTransactionReceipt({
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


// const l1Balance = await EthTestNet.provider.getBalance({ address: account.address });
// console.log(`Ethereum testnet Balance: ${formatEther(l1Balance)} ETH`);

// const reciept = await getWrappedEthereum(account, EthTestnet, Optimism);

await invokeGreeter(GREETER_CONTRACT, GREETER_ABI, account, Optimism);
