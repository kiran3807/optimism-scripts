# optimism-scripts
An exploration of basic functions and utilities to operate on Optimism blockchain

# Installation:

## Prerequisites:

First install, Node, npm, jq and Foundry.

### Foundry installation:

curl -L https://foundry.paradigm.xyz | bash
source ~/.bashrc 
foundryup

foundryup installs forge, cast and other tools you need.

Note: if not bash, source the zsh profile file.

## Main installation:

After cloning the repository,

cd into optimism-scripts/script-lib,

npm install

pnpm install.

Create a .env file and populate it with the following variables:

PRIVATE_KEY_SEPOLIA

PUBLIC_KEY_SEPOLIA

PRIVATE_KEY_LOCAL

PUBLIC_KEY_LOCAL

OPTIMISM_LOCAL_RPC

OPTIMISM_SEPOLIA_RPC

SEPOLIA_RPC

GREETER_CONTRACT_SEPOLIA

GREETER_CONTRACT_LOCAL

Then cd into optimism-scripts/contracts

Create another .env file and populate it with:

RPC_URL

PRIVATE_KEY. 

The RPC_URL and PRIVATE_KEY must correspond to the Optimism chain you are interacting, whether it be test, main or local

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


To extract the deployed contract's ABI:

cat ./out/Counter.sol/Counter.json | jq '.abi'


