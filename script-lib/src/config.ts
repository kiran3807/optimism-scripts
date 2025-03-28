import { 
    createPublicClient, createWalletClient, 
    http, defineChain
} from "viem";
import { 
    optimismSepolia, sepolia 
} from "viem/chains";
import { 
    publicActionsL2, walletActionsL2, publicActionsL1,
    walletActionsL1, getL2TransactionHashes, chainConfig
} from "viem/op-stack";
import { 
    privateKeyToAccount, PrivateKeyAccount, Address
} from "viem/accounts";
import dotenv from "dotenv";

dotenv.config();
const envLoaded = dotenv.config({ path: './.kurtosis-env' });

if (envLoaded.error) {
    throw Error("Failed to load kurtosis env", envLoaded.error);
}

const SEPOLIA_RPC = process.env.SEPOLIA_RPC;

const OPTIMISM_SEPOLIA_RPC = process.env.OPTIMISM_SEPOLIA_RPC;
const OPTIMISM_ANVIL_RPC = process.env.OPTIMISM_ANVIL_RPC;

const PRIVATE_KEY_SEPOLIA = process.env.PRIVATE_KEY_SEPOLIA;
const PRIVATE_KEY_ANVIL = process.env.PRIVATE_KEY_ANVIL;

export const accountSepolia: PrivateKeyAccount = privateKeyToAccount(`0x${PRIVATE_KEY_SEPOLIA}`);
export const accountAnvil: PrivateKeyAccount = privateKeyToAccount(`0x${PRIVATE_KEY_ANVIL}`);

export const GREETER_CONTRACT_SEPOLIA = process.env.GREETER_CONTRACT_SEPOLIA;
export const GREETER_CONTRACT_ANVIL = process.env.GREETER_CONTRACT_ANVIL;


export const KURTOSIS_PUBLIC_KEY = process.env.KURTOSIS_PUBLIC_KEY;
export const KURTOSIS_PRIVATE_KEY = process.env.KURTOSIS_PRIVATE_KEY;

const OPTIMISM_KURTOSIS_L2_RPC = process.env.OPTIMISM_KURTOSIS_L2_RPC || "";
const OPTIMISM_KURTOSIS_L1_RPC = process.env.OPTIMISM_KURTOSIS_L1_RPC || "";

const OPTIMISM_KURTOSIS_L1_CHAIN_ID = process.env.OPTIMISM_KURTOSIS_L1_CHAIN_ID || "";
const OPTIMISM_KURTOSIS_L2_CHAIN_ID = process.env.OPTIMISM_KURTOSIS_L2_CHAIN_ID || "";

const OPTIMISM_KURTOSIS_DISPUTEGAMEFACTORY = process.env.OPTIMISM_KURTOSIS_DISPUTEGAMEFACTORY;
const OPTIMISM_KURTOSIS_PORTAL = process.env.OPTIMISM_KURTOSIS_PORTAL;
const OPTIMISM_KURTOSIS_L1STANDARDBRIDGE = process.env.OPTIMISM_KURTOSIS_L1STANDARDBRIDGE;

export const accountKurtosis: PrivateKeyAccount = privateKeyToAccount(`0x${KURTOSIS_PRIVATE_KEY}`);

/*
    TODO : 
    Figure out where the hash of l2OutputOracle is situated
*/

const optimismKurtosis = defineChain({
    ...chainConfig.contracts,
    id: parseInt(OPTIMISM_KURTOSIS_L2_CHAIN_ID),
    name: 'OP Kurtosis',
    nativeCurrency: { name: 'Kurtosis Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: {
      default: {
        http: [`${OPTIMISM_KURTOSIS_L2_RPC}`],
      },
    },
    blockExplorers: {
      default: {
        name: '',
        url: '',
        apiUrl: '',
      },
    },
    contracts: {
        ...chainConfig.contracts,
        disputeGameFactory: {
            [OPTIMISM_KURTOSIS_L1_CHAIN_ID]: {
                address: OPTIMISM_KURTOSIS_DISPUTEGAMEFACTORY as Address,
            },
        },
        l2OutputOracle: {
            [OPTIMISM_KURTOSIS_L1_CHAIN_ID]: {
                address: '0x',
            },
        },
        multicall3: {
            address: '0x',
            blockCreated: 1620204,
        },
        portal: {
            [OPTIMISM_KURTOSIS_L1_CHAIN_ID]: {
                address: OPTIMISM_KURTOSIS_PORTAL as Address,
            },
        },
        l1StandardBridge: {
            [OPTIMISM_KURTOSIS_L1_CHAIN_ID]: {
                address: OPTIMISM_KURTOSIS_L1STANDARDBRIDGE as Address,
            },
        },
    },
    testnet: true,
    OPTIMISM_KURTOSIS_L1_CHAIN_ID,
});


const optimismAnvil = defineChain({
    ...chainConfig,
    id: 31337,
    name: 'OP Anvil Local',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: {
      default: {
        http: [OPTIMISM_ANVIL_RPC as string],
      },
    },
    blockExplorers: {
      default: {
        name: '',
        url: '',
        apiUrl: '',
      },
    },
    contracts: {
      ...chainConfig.contracts,
      multicall3: {
        address: '0xca11bde05977b3631167028862be2a173976ca11',
        blockCreated: 0,
      }
    },
});

const ethKurtosis = defineChain({
    id: parseInt(OPTIMISM_KURTOSIS_L1_CHAIN_ID),
    name: 'Eth Kurtosis',
    nativeCurrency: { name: 'Kurtosis L1 Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: {
      default: {
        http: [OPTIMISM_KURTOSIS_L1_RPC],
      },
    },
    blockExplorers: {
      default: {
        name: '',
        apiUrl: '',
        url: '',
      },
    },
    contracts: {
      multicall3: {
        address: '0x',
        blockCreated: 0,
      },
      ensRegistry: { address: '0x' },
      ensUniversalResolver: {
        address: '0x',
        blockCreated: 0,
      },
    },
    testnet: true,
})


export const EthSepolia = {
    
    provider : createPublicClient({
        chain: sepolia,
        transport: http(SEPOLIA_RPC),
    }).extend(publicActionsL1()),

    wallet : createWalletClient({
        account : accountSepolia,
        chain: sepolia,
        transport: http(SEPOLIA_RPC),
    }).extend(walletActionsL1())
}

export const EthKurtosis = {
    provider : createPublicClient({
        chain: ethKurtosis,
        transport: http(OPTIMISM_KURTOSIS_L1_RPC),
    }).extend(publicActionsL1()),

    wallet : createWalletClient({
        account : accountKurtosis,
        chain: ethKurtosis,
        transport: http(OPTIMISM_KURTOSIS_L1_RPC),
    }).extend(walletActionsL1())
}

export const OptimismSepolia = {

    provider : createPublicClient({
        chain: optimismSepolia,
        transport: http(OPTIMISM_SEPOLIA_RPC),
    }).extend(publicActionsL2()),

    wallet : createWalletClient({
        account: accountSepolia,
        chain: optimismSepolia,
        transport: http(OPTIMISM_SEPOLIA_RPC),
    }).extend(walletActionsL2()),
    
    getL2TransactionHashes : getL2TransactionHashes
}

// We clone optimism mainnet in our local anvil
export const OptimismAnvil = {

    provider : createPublicClient({
        chain: optimismAnvil,
        transport: http(OPTIMISM_ANVIL_RPC),
    }).extend(publicActionsL2()),

    wallet : createWalletClient({
        account: accountAnvil,
        chain: optimismAnvil,
        transport: http(OPTIMISM_ANVIL_RPC),
    }).extend(walletActionsL2()),
    
    getL2TransactionHashes : getL2TransactionHashes
}

export const OptimismKurtosis = {
    
    provider : createPublicClient({
        chain: optimismKurtosis,
        transport: http(OPTIMISM_KURTOSIS_L2_RPC),
    }).extend(publicActionsL2()),

    wallet : createWalletClient({
        account: accountKurtosis,
        chain: optimismKurtosis,
        transport: http(OPTIMISM_KURTOSIS_L2_RPC),
    }).extend(walletActionsL2()),
    
    getL2TransactionHashes : getL2TransactionHashes
}


export type L1Interactor = typeof EthSepolia | typeof EthKurtosis;
export type L2Interactor = typeof OptimismSepolia | typeof OptimismAnvil | typeof OptimismKurtosis;