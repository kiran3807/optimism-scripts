# optimism-scripts
An exploration of basic functions and utilities to operate on Optimism blockchain

# Installation:

## Prerequisites:

install :

Node, npm, jq and Foundry.
docker/orbstack and Kurtosis

### Foundry installation:

curl -L https://foundry.paradigm.xyz | bash
source ~/.bashrc 
foundryup

foundryup installs forge, cast and other tools you need.

Note: if not bash, source the zsh profile file.

If you are a Mac user, highly recommend install orbstack, it is faster with relatively
smaller memory footprint compared to docker desktop.

## Main installation:

After cloning the repository, within the root directory:

kurtosis clean -a (cleans any previous kurtosis enclaves and services)

kurtosis run github.com/ethpandaops/optimism-package \
    --args-file https://raw.githubusercontent.com/ethpandaops/optimism-package/main/network_params.yaml \
    --enclave op-devnet

bash setup.sh ( extracts the kurtosis specific data into the specific environment files)

cd into optimism-scripts/script-lib,

npm install

pnpm install.

Create a .env file and populate it with the following variables:

PRIVATE_KEY_SEPOLIA

PUBLIC_KEY_SEPOLIA

PRIVATE_KEY_ANVIL

PUBLIC_KEY_ANVIL

OPTIMISM_ANVIL_RPC

OPTIMISM_SEPOLIA_RPC

SEPOLIA_RPC

GREETER_CONTRACT_SEPOLIA

GREETER_CONTRACT_ANVIL

Then cd into optimism-scripts/contracts

Create another .env file and populate it with:

RPC_URL

PRIVATE_KEY. 

The RPC_URL and PRIVATE_KEY must correspond to the Optimism chain you are interacting, whether it be test, main or local

### In case you are not using Kurtosis

In another terminal instance, run the following command to setup a local mainnet fork of Optimism node:

anvil --fork-url https://mainnet.optimism.io --chain-id 31337

# Usage:

## For contract invocation flow:

cd optimism-scripts/script-lib

npm start

For converting ethereum into wrapped ethereum, simply uncomment the function in 

optimism-scripts/script-lib/src/index.ts

## For contract deployment flow:

cd optimism-scripts/contracts

forge build

forge test

source .env

forge script script/Counter.s.sol --rpc-url $RPC_URL --private-key $PRIVATE_KEY --broadcast

alternativly there is a programmatic way to deployed pre-compiled contracts, as demonstrated script-lib


To extract the deployed contract's ABI:

cat ./out/Counter.sol/Counter.json | jq '.abi'


