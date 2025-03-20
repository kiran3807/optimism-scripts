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

Create a .env file and populate it with PUBLIC_KEY and PRIVATE_KEY variables

Then cd into optimism-scripts/contracts

Create another .env file and populate it with RPC_URL=https://sepolia.optimism.io and PRIVATE_KEY

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


