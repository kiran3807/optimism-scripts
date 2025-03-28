#!/bin/bash

set -e  # Exit on any error

SCRIPT_LIB_KURTOSIS_ENV="./script-lib/.kurtosis-env"

# Load environment variables
if [ -f .env ]; then
  source .env
else
  echo ".env file not found"
  exit 1
fi

# Check required variables
if [ -z "$KURTOSIS_LOCAL_ARTEFACTS" ] || [ -z "$KURTOSIS_LOCAL_ENCLAVE" ] || [ -z "$KURTOSIS_PUBLIC_KEY" ] || [ -z "$KURTOSIS_PUBLIC_KEY" ]; then
  echo "Missing required environment variables."
  exit 1
fi

echo "Removing old artefacts"
rm -rf ./${KURTOSIS_LOCAL_ARTEFACTS}

if [ -f $SCRIPT_LIB_KURTOSIS_ENV ]; then
    rm $SCRIPT_LIB_KURTOSIS_ENV
fi

kurtosis files download ${KURTOSIS_LOCAL_ENCLAVE} op-deployer-configs ${KURTOSIS_LOCAL_ARTEFACTS}

ROLLUP_ARTEFACT=$(ls ${KURTOSIS_LOCAL_ARTEFACTS} | grep "rollup")
STATE_ARTEFACT="state.json"

echo "Settin the environment variables in $SCRIPT_LIB_KURTOSIS_ENV"

OPTIMISM_KURTOSIS_L1_CHAIN_ID=$(jq -r '.l1_chain_id' ${KURTOSIS_LOCAL_ARTEFACTS}/${ROLLUP_ARTEFACT})
OPTIMISM_KURTOSIS_L2_CHAIN_ID=$(jq -r '.l2_chain_id' ${KURTOSIS_LOCAL_ARTEFACTS}/${ROLLUP_ARTEFACT})

OPTIMISM_KURTOSIS_L1_RPC="http://"$(kurtosis enclave inspect ${KURTOSIS_LOCAL_ENCLAVE} | awk '/el-1-geth-teku/ {count=6} count > 0 { print; count-- }' | awk '$1 ~ /rpc/' | awk -F'-> ' '{print $2}')
OPTIMISM_KURTOSIS_L2_RPC=$(kurtosis enclave inspect ${KURTOSIS_LOCAL_ENCLAVE} | awk '/op-el-1-op-geth-op-node-op-kurtosis/ {count=6} count > 0 { print; count-- }' | awk '$1 ~ /rpc/' | awk -F'-> ' '{print $2}')

OPTIMISM_KURTOSIS_DISPUTEGAMEFACTORY=$(jq -r '.opChainDeployments[0].disputeGameFactoryProxyAddress' ${KURTOSIS_LOCAL_ARTEFACTS}/${STATE_ARTEFACT})
OPTIMISM_KURTOSIS_PORTAL=$(jq -r '.opChainDeployments[0].optimismPortalProxyAddress' ${KURTOSIS_LOCAL_ARTEFACTS}/${STATE_ARTEFACT})
OPTIMISM_KURTOSIS_L1STANDARDBRIDGE=$(jq -r '.opChainDeployments[0].l1StandardBridgeProxyAddress' ${KURTOSIS_LOCAL_ARTEFACTS}/${STATE_ARTEFACT})

env_variables=("KURTOSIS_PUBLIC_KEY" "KURTOSIS_PRIVATE_KEY" "KURTOSIS_LOCAL_ENCLAVE" "OPTIMISM_KURTOSIS_L1_CHAIN_ID" "OPTIMISM_KURTOSIS_L2_CHAIN_ID" "OPTIMISM_KURTOSIS_L1_RPC" "OPTIMISM_KURTOSIS_L2_RPC" "OPTIMISM_KURTOSIS_DISPUTEGAMEFACTORY" "OPTIMISM_KURTOSIS_PORTAL" "OPTIMISM_KURTOSIS_L1STANDARDBRIDGE")

# creating the kurtosis env file
touch $SCRIPT_LIB_KURTOSIS_ENV
for variable in "${env_variables[@]}"; do
    echo -e "\n" >> $SCRIPT_LIB_KURTOSIS_ENV
    echo $variable=${!variable} >> $SCRIPT_LIB_KURTOSIS_ENV
    echo $variable=${!variable}
done



echo "Minting Optimism Ether on L2 from L1 for account ${KURTOSIS_PUBLIC_KEY} of value 0.1"
cast send $OPTIMISM_KURTOSIS_L1STANDARDBRIDGE "depositETH(uint32,bytes)" 100000 "0x" --value 0.01ether --rpc-url $OPTIMISM_KURTOSIS_L1_RPC --private-key $KURTOSIS_PRIVATE_KEY

echo -e "\n Waiting 30s for the mint transaction being confirmed on the L2"
sleep 30

echo "Checking on L2 balance"
balance=$(cast balance $KURTOSIS_PUBLIC_KEY --rpc-url $OPTIMISM_KURTOSIS_L2_RPC)

if [ $? -eq 0 ] && [ "$balance" -gt 0 ]; then
    echo "L2 Eth successfully minted, new balance: $balance" 
    echo "for account: $KURTOSIS_PUBLIC_KEY"
else
    echo "Minting failed."
fi