#!/bin/bash

set -e

# Configuration
CHAIN_ID="xion-testnet-2"
NODE="https://rpc.xion-testnet-2.burnt.com:443"
GAS_PRICE="0.025uxion"
GAS_ADJUSTMENT="1.3"
BINARY="./artifacts/tipping_profiles.wasm"

# Usage information
show_usage() {
  echo "Usage:"
  echo "  ./deploy.sh deploy <wallet-name>        # Deploy a new contract"
  echo "  ./deploy.sh use <wallet-name> [address] # Use an existing contract"
  exit 1
}

# Check command line arguments
if [ "$#" -lt 2 ]; then
  show_usage
fi

MODE=$1
WALLET=$2
CONTRACT_ADDRESS=$3

# Process based on mode
case $MODE in
  deploy)
    echo "Deploying new tipping profiles contract with wallet: $WALLET"
    
    # Step 1: Optimize contract
    echo "Optimizing contract..."
    docker run --rm -v "$(pwd)":/code \
      --mount type=volume,source="$(basename "$(pwd)")_cache",target=/target \
      --mount type=volume,source=registry_cache,target=/usr/local/cargo/registry \
      cosmwasm/optimizer:0.16.0
    
    if [ ! -f "$BINARY" ]; then
      echo "Error: Contract binary not found at $BINARY"
      echo "Please check if the optimization was successful"
      exit 1
    fi
    
    # Step 2: Upload contract to blockchain
    echo "Uploading contract to blockchain..."
    RES=$(xiond tx wasm store $BINARY \
      --chain-id $CHAIN_ID \
      --gas-adjustment $GAS_ADJUSTMENT \
      --gas-prices $GAS_PRICE \
      --gas auto \
      -y --output json \
      --node $NODE \
      --from $WALLET)
      
    TXHASH=$(echo $RES | jq -r '.txhash')
    echo "Upload transaction hash: $TXHASH"
    
    echo "Waiting for transaction to be included in a block..."
    sleep 10

    # Step 3: Get the code ID
    CODE_ID=$(xiond query tx $TXHASH \
      --node $NODE \
      --output json | jq -r '.events[-1].attributes[1].value')
    echo "Code ID: $CODE_ID"

    # Step 4: Instantiate the contract
    MSG="{\"admin\":\"$(xiond keys show -a $WALLET)\"}"
    INIT_RES=$(xiond tx wasm instantiate $CODE_ID "$MSG" \
      --from $WALLET \
      --label "tipping-profiles" \
      --gas-prices $GAS_PRICE \
      --gas auto \
      --gas-adjustment $GAS_ADJUSTMENT \
      -y --no-admin \
      --chain-id $CHAIN_ID \
      --node $NODE \
      --output json)

    INIT_TXHASH=$(echo $INIT_RES | jq -r '.txhash')
    echo "Instantiate transaction hash: $INIT_TXHASH"

    echo "Waiting for transaction to be included in a block..."
    sleep 10

    # Step 5: Get the contract address
    CONTRACT=$(xiond query tx $INIT_TXHASH \
      --node $NODE \
      --output json | jq -r '.events[] | select(.type == "instantiate") | .attributes[] | select(.key == "_contract_address") | .value')
    echo "Contract address: $CONTRACT"
    
    echo $CONTRACT > contract_address.txt
    echo "Contract address saved to contract_address.txt"
    
    echo "Deployment complete!"
    echo "Entering interactive mode with the new contract..."
    ;;
    
  use)
    echo "Using existing contract with wallet: $WALLET"
    
    if [ -n "$CONTRACT_ADDRESS" ]; then
      CONTRACT=$CONTRACT_ADDRESS
    else
      if [ -f "contract_address.txt" ]; then
        CONTRACT=$(cat contract_address.txt)
      fi
    fi

    if [ -z "$CONTRACT" ]; then
      echo "Contract address not found. Please enter it manually:"
      read CONTRACT
      echo $CONTRACT > contract_address.txt
    fi
    ;;
    
  *)
    echo "Invalid mode: $MODE"
    show_usage
    ;;
esac

echo "Using contract address: $CONTRACT"
echo ""

echo "You can set these environment variables in your shell:"
echo "export WALLET=$WALLET"
echo "export CONTRACT=$CONTRACT"
echo "export CHAIN_ID=$CHAIN_ID"
echo "export NODE=$NODE"
echo "export GAS_PRICE=$GAS_PRICE"
echo "export GAS_ADJUSTMENT=$GAS_ADJUSTMENT"
echo ""

# Define functions for common operations
register_profile() {
  username=$1
  name=$2
  bio=$3
  profile_picture=$4
  banner_image=$5
  twitter=$6
  website=$7

  JSON="{\"register_profile\":{\"username\":\"$username\",\"name\":\"$name\""
  if [ -n "$bio" ]; then
    JSON="$JSON,\"bio\":\"$bio\""
  fi
  if [ -n "$profile_picture" ]; then
    JSON="$JSON,\"profile_picture\":\"$profile_picture\""
  fi
  if [ -n "$banner_image" ]; then
    JSON="$JSON,\"banner_image\":\"$banner_image\""
  fi
  if [ -n "$twitter" ]; then
    JSON="$JSON,\"twitter\":\"$twitter\""
  fi
  if [ -n "$website" ]; then
    JSON="$JSON,\"website\":\"$website\""
  fi
  JSON="$JSON}}"
  
  echo "Registering profile with username: $username"
  xiond tx wasm execute $CONTRACT "$JSON" \
    --from $WALLET --gas-prices $GAS_PRICE --gas auto --gas-adjustment $GAS_ADJUSTMENT -y --node $NODE --chain-id $CHAIN_ID
}

update_profile() {
  username=$1
  name=$2
  bio=$3
  profile_picture=$4
  banner_image=$5
  twitter=$6
  website=$7

  JSON="{\"update_profile\":{\"username\":\"$username\""
  if [ -n "$name" ]; then
    JSON="$JSON,\"name\":\"$name\""
  fi
  if [ -n "$bio" ]; then
    JSON="$JSON,\"bio\":\"$bio\""
  fi
  if [ -n "$profile_picture" ]; then
    JSON="$JSON,\"profile_picture\":\"$profile_picture\""
  fi
  if [ -n "$banner_image" ]; then
    JSON="$JSON,\"banner_image\":\"$banner_image\""
  fi
  if [ -n "$twitter" ]; then
    JSON="$JSON,\"twitter\":\"$twitter\""
  fi
  if [ -n "$website" ]; then
    JSON="$JSON,\"website\":\"$website\""
  fi
  JSON="$JSON}}"
  
  echo "Updating profile with username: $username"
  xiond tx wasm execute $CONTRACT "$JSON" \
    --from $WALLET --gas-prices $GAS_PRICE --gas auto --gas-adjustment $GAS_ADJUSTMENT -y --node $NODE --chain-id $CHAIN_ID
}

record_tip() {
  to_username=$1
  amount=$2
  message=$3
  
  JSON="{\"record_tip\":{\"to_username\":\"$to_username\",\"amount\":\"$amount\""
  if [ -n "$message" ]; then
    JSON="$JSON,\"message\":\"$message\""
  fi
  JSON="$JSON}}"
  
  echo "Recording tip to user: $to_username"
  xiond tx wasm execute $CONTRACT "$JSON" \
    --from $WALLET --gas-prices $GAS_PRICE --gas auto --gas-adjustment $GAS_ADJUSTMENT -y --node $NODE --chain-id $CHAIN_ID
}

add_admin() {
  admin=$1
  
  echo "Adding admin: $admin"
  xiond tx wasm execute $CONTRACT "{\"add_admin\":{\"admin\":\"$admin\"}}" \
    --from $WALLET --gas-prices $GAS_PRICE --gas auto --gas-adjustment $GAS_ADJUSTMENT -y --node $NODE --chain-id $CHAIN_ID
}

remove_admin() {
  admin=$1
  
  echo "Removing admin: $admin"
  xiond tx wasm execute $CONTRACT "{\"remove_admin\":{\"admin\":\"$admin\"}}" \
    --from $WALLET --gas-prices $GAS_PRICE --gas auto --gas-adjustment $GAS_ADJUSTMENT -y --node $NODE --chain-id $CHAIN_ID
}

get_profile() {
  username=$1
  
  echo "Querying profile with username: $username"
  xiond query wasm contract-state smart $CONTRACT "{\"get_profile\":{\"username\":\"$username\"}}" --output json --node $NODE
}

get_profile_by_wallet() {
  wallet=$1
  
  echo "Querying profile with wallet address: $wallet"
  xiond query wasm contract-state smart $CONTRACT "{\"get_profile_by_wallet\":{\"wallet\":\"$wallet\"}}" --output json --node $NODE
}

list_profiles() {
  limit=${1:-30}
  start_after=${2:-null}
  
  if [ "$start_after" = "null" ]; then
    QUERY="{\"list_profiles\":{\"limit\":$limit}}"
  else
    QUERY="{\"list_profiles\":{\"limit\":$limit,\"start_after\":\"$start_after\"}}"
  fi
  
  echo "Listing profiles (limit: $limit, start_after: $start_after)..."
  xiond query wasm contract-state smart $CONTRACT "$QUERY" --output json --node $NODE
}

get_tips_sent() {
  username=$1
  limit=${2:-30}
  
  QUERY="{\"get_tips_sent\":{\"username\":\"$username\",\"limit\":$limit}}"
  
  echo "Querying tips sent by user: $username (limit: $limit)..."
  xiond query wasm contract-state smart $CONTRACT "$QUERY" --output json --node $NODE
}

get_tips_received() {
  username=$1
  limit=${2:-30}
  
  QUERY="{\"get_tips_received\":{\"username\":\"$username\",\"limit\":$limit}}"
  
  echo "Querying tips received by user: $username (limit: $limit)..."
  xiond query wasm contract-state smart $CONTRACT "$QUERY" --output json --node $NODE
}

get_user_stats() {
  username=$1
  
  echo "Getting stats for user: $username"
  xiond query wasm contract-state smart $CONTRACT "{\"get_user_stats\":{\"username\":\"$username\"}}" --output json --node $NODE
}

is_admin() {
  address=$1
  
  echo "Checking if $address is an admin"
  xiond query wasm contract-state smart $CONTRACT "{\"is_admin\":{\"address\":\"$address\"}}" --output json --node $NODE
}

is_username_available() {
  username=$1
  
  echo "Checking if username '$username' is available"
  xiond query wasm contract-state smart $CONTRACT "{\"is_username_available\":{\"username\":\"$username\"}}" --output json --node $NODE
}

# Show contract usage examples
show_examples() {
  echo ""
  echo "TIPPING PROFILES CONTRACT - USAGE EXAMPLES"
  echo "=========================================="
  echo ""
  echo "Register a profile:"
  echo "xiond tx wasm execute $CONTRACT '{\"register_profile\":{\"username\":\"satoshi\",\"name\":\"Satoshi Nakamoto\",\"bio\":\"Creator of Bitcoin\",\"twitter\":\"satoshi\"}}' --from $WALLET --gas-prices $GAS_PRICE --gas auto --gas-adjustment $GAS_ADJUSTMENT -y --node $NODE --chain-id $CHAIN_ID"
  echo ""
  echo "Update a profile:"
  echo "xiond tx wasm execute $CONTRACT '{\"update_profile\":{\"username\":\"satoshi\",\"bio\":\"Bitcoin creator\"}}' --from $WALLET --gas-prices $GAS_PRICE --gas auto --gas-adjustment $GAS_ADJUSTMENT -y --node $NODE --chain-id $CHAIN_ID"
  echo ""
  echo "Record a tip:"
  echo "xiond tx wasm execute $CONTRACT '{\"record_tip\":{\"to_username\":\"vbuterin\",\"amount\":\"10uxion\",\"message\":\"Great work on Eth2.0!\"}}' --from $WALLET --gas-prices $GAS_PRICE --gas auto --gas-adjustment $GAS_ADJUSTMENT -y --node $NODE --chain-id $CHAIN_ID"
  echo ""
  echo "Query a profile:"
  echo "xiond query wasm contract-state smart $CONTRACT '{\"get_profile\":{\"username\":\"satoshi\"}}' --output json --node $NODE"
}

# Menu system
show_menu() {
  echo ""
  echo "Tipping Profiles Contract Commands"
  echo "=================================="
  echo ""
  echo "PROFILE MANAGEMENT:"
  echo "1) Register a profile"
  echo "2) Update a profile"
  echo "3) Get a profile by username"
  echo "4) Get a profile by wallet address"
  echo "5) List all profiles"
  echo "6) Check if username is available"
  echo ""
  echo "TIPPING OPERATIONS:"
  echo "7) Record a tip"
  echo "8) Get tips sent by a user"
  echo "9) Get tips received by a user"
  echo "10) Get user stats"
  echo ""
  echo "ADMIN OPERATIONS:"
  echo "11) Add admin"
  echo "12) Remove admin"
  echo "13) Check if address is admin"
  echo ""
  echo "OTHER:"
  echo "14) Show usage examples"
  echo "15) Exit"
  echo ""
  echo "Enter your choice: "
}

# Print welcome message and examples if just deployed
if [ "$MODE" = "deploy" ]; then
  show_examples
fi

# Main execution loop
while true; do
  show_menu
  read choice
  
  case $choice in
    1)
      echo "Enter username (3-30 chars, letters, numbers, underscore, and hyphen only):"
      read username
      echo "Enter display name:"
      read name
      echo "Enter bio (optional):"
      read bio
      echo "Enter profile picture URL (optional):"
      read profile_picture
      echo "Enter banner image URL (optional):"
      read banner_image
      echo "Enter Twitter handle (optional):"
      read twitter
      echo "Enter website URL (optional):"
      read website
      register_profile "$username" "$name" "$bio" "$profile_picture" "$banner_image" "$twitter" "$website"
      ;;
    2)
      echo "Enter username to update:"
      read username
      echo "Enter new display name (or press enter to keep current):"
      read name
      echo "Enter new bio (or press enter to keep current):"
      read bio
      echo "Enter new profile picture URL (or press enter to keep current):"
      read profile_picture
      echo "Enter new banner image URL (or press enter to keep current):"
      read banner_image
      echo "Enter new Twitter handle (or press enter to keep current):"
      read twitter
      echo "Enter new website URL (or press enter to keep current):"
      read website
      update_profile "$username" "$name" "$bio" "$profile_picture" "$banner_image" "$twitter" "$website"
      ;;
    3)
      echo "Enter username to query:"
      read username
      get_profile "$username"
      ;;
    4)
      echo "Enter wallet address to query:"
      read wallet
      get_profile_by_wallet "$wallet"
      ;;
    5)
      echo "Enter limit (or press enter for default 30):"
      read limit
      limit=${limit:-30}
      echo "Enter start_after username (or press enter for none):"
      read start_after
      start_after=${start_after:-null}
      list_profiles $limit "$start_after"
      ;;
    6)
      echo "Enter username to check availability:"
      read username
      is_username_available "$username"
      ;;
    7)
      echo "Enter recipient username:"
      read to_username
      echo "Enter amount (e.g., 10uxion):"
      read amount
      echo "Enter message (optional):"
      read message
      record_tip "$to_username" "$amount" "$message"
      ;;
    8)
      echo "Enter username to get sent tips:"
      read username
      echo "Enter limit (or press enter for default 30):"
      read limit
      limit=${limit:-30}
      get_tips_sent "$username" $limit
      ;;
    9)
      echo "Enter username to get received tips:"
      read username
      echo "Enter limit (or press enter for default 30):"
      read limit
      limit=${limit:-30}
      get_tips_received "$username" $limit
      ;;
    10)
      echo "Enter username to get stats:"
      read username
      get_user_stats "$username"
      ;;
    11)
      echo "Enter address to add as admin:"
      read admin
      add_admin "$admin"
      ;;
    12)
      echo "Enter admin address to remove:"
      read admin
      remove_admin "$admin"
      ;;
    13)
      echo "Enter address to check if admin:"
      read address
      is_admin "$address"
      ;;
    14)
      show_examples
      ;;
    15)
      echo "Exiting..."
      exit 0
      ;;
    *)
      echo "Invalid choice. Please try again."
      ;;
  esac
done 