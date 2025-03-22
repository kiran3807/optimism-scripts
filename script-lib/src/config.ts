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
    privateKeyToAccount, PrivateKeyAccount
} from "viem/accounts";
import dotenv from "dotenv";

dotenv.config();

const SEPOLIA_RPC = process.env.SEPOLIA_RPC;
const OPTIMISM_SEPOLIA_RPC = process.env.OPTIMISM_SEPOLIA_RPC;
const OPTIMISM_LOCAL_RPC = process.env.OPTIMISM_LOCAL_RPC;

const PRIVATE_KEY_SEPOLIA = process.env.PRIVATE_KEY_SEPOLIA;
const PRIVATE_KEY_LOCAL = process.env.PRIVATE_KEY_LOCAL;

export const accountSepolia: PrivateKeyAccount = privateKeyToAccount(`0x${PRIVATE_KEY_SEPOLIA}`);
export const accountLocal: PrivateKeyAccount = privateKeyToAccount(`0x${PRIVATE_KEY_LOCAL}`);

export const GREETER_CONTRACT_SEPOLIA = process.env.GREETER_CONTRACT_SEPOLIA;
export const GREETER_CONTRACT_LOCAL = process.env.GREETER_CONTRACT_LOCAL;

export const t = createPublicClient({
    chain: optimismSepolia,
    transport: http("https://sepolia.optimism.io"),
})


const optimismLocal = defineChain({
    ...chainConfig,
    id: 31337,
    name: 'OP Anvil Local',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: {
      default: {
        http: [OPTIMISM_LOCAL_RPC as string],
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
        blockCreated: 4286263,
      }
    },
  });

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
export const OptimismLocal = {

    provider : createPublicClient({
        chain: optimismLocal,
        transport: http(OPTIMISM_LOCAL_RPC),
    }).extend(publicActionsL2()),

    wallet : createWalletClient({
        account: accountLocal,
        chain: optimismLocal,
        transport: http(OPTIMISM_LOCAL_RPC),
    }).extend(walletActionsL2()),
    
    getL2TransactionHashes : getL2TransactionHashes
}

export type L1Interactor = typeof EthSepolia;
export type L2Interactor = typeof OptimismSepolia | typeof OptimismLocal;