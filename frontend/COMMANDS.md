# Smart Contract Command Reference

This document provides a reference for interacting with the TipChain smart contract deployed on the XION blockchain using the command line.

## Setup Variables

Before running commands, set up your environment variables:

```bash
# Contract and wallet configuration
export CONTRACT="your_contract_address_here"
export WALLET="your_wallet_address_here"
export NODE="https://rpc.xion-testnet-1.burnt.com"  # Use mainnet URL for production
export CHAIN_ID="xion-testnet-1"  # Use "xion-1" for mainnet
export GAS_PRICE="0.0001uxion"
export GAS_ADJUSTMENT="1.3"
```

## Profile Management

### Register a New Profile

Create a new user profile with username, name, and optional fields:

```bash
# Register a profile with required fields
xiond tx wasm execute $CONTRACT \
  '{"register_profile":{"username":"alice_creator","name":"Alice Creator"}}' \
  --from $WALLET --gas-prices $GAS_PRICE --gas auto --gas-adjustment $GAS_ADJUSTMENT -y \
  --node $NODE --chain-id $CHAIN_ID

# Register a profile with all optional fields
xiond tx wasm execute $CONTRACT \
  '{"register_profile":{"username":"bob_creator","name":"Bob Creator","bio":"Digital artist and creator","profile_picture":"https://res.cloudinary.com/f22/image/upload/v1234567/profile.jpg","banner_image":"https://res.cloudinary.com/f22/image/upload/v1234567/banner.jpg","twitter":"bobcreates","website":"https://bobcreator.com"}}' \
  --from $WALLET --gas-prices $GAS_PRICE --gas auto --gas-adjustment $GAS_ADJUSTMENT -y \
  --node $NODE --chain-id $CHAIN_ID
```

### Update an Existing Profile

Update your profile details:

```bash
# Update profile bio and website
xiond tx wasm execute $CONTRACT \
  '{"update_profile":{"username":"alice_creator","bio":"Updated bio information","website":"https://alicecreator.com"}}' \
  --from $WALLET --gas-prices $GAS_PRICE --gas auto --gas-adjustment $GAS_ADJUSTMENT -y \
  --node $NODE --chain-id $CHAIN_ID

# Update profile picture
xiond tx wasm execute $CONTRACT \
  '{"update_profile":{"username":"alice_creator","profile_picture":"https://res.cloudinary.com/f22/image/upload/v7654321/new_profile.jpg"}}' \
  --from $WALLET --gas-prices $GAS_PRICE --gas auto --gas-adjustment $GAS_ADJUSTMENT -y \
  --node $NODE --chain-id $CHAIN_ID
```

## Tipping

### Record a Tip to a Creator

Send a tip to a creator with an optional message:

```bash
# Send a tip with amount only
xiond tx wasm execute $CONTRACT \
  '{"record_tip":{"to_username":"bob_creator","amount":"5"}}' \
  --from $WALLET --gas-prices $GAS_PRICE --gas auto --gas-adjustment $GAS_ADJUSTMENT -y \
  --node $NODE --chain-id $CHAIN_ID

# Send a tip with a message
xiond tx wasm execute $CONTRACT \
  '{"record_tip":{"to_username":"alice_creator","amount":"10","message":"Love your work, keep creating!"}}' \
  --from $WALLET --gas-prices $GAS_PRICE --gas auto --gas-adjustment $GAS_ADJUSTMENT -y \
  --node $NODE --chain-id $CHAIN_ID
```

## Admin Functions

### Add an Admin

Add a new admin to the contract (must be called by an existing admin):

```bash
xiond tx wasm execute $CONTRACT \
  '{"add_admin":{"admin":"xion1new_admin_address_here"}}' \
  --from $WALLET --gas-prices $GAS_PRICE --gas auto --gas-adjustment $GAS_ADJUSTMENT -y \
  --node $NODE --chain-id $CHAIN_ID
```

### Remove an Admin

Remove an admin from the contract (must be called by an existing admin):

```bash
xiond tx wasm execute $CONTRACT \
  '{"remove_admin":{"admin":"xion1admin_address_to_remove"}}' \
  --from $WALLET --gas-prices $GAS_PRICE --gas auto --gas-adjustment $GAS_ADJUSTMENT -y \
  --node $NODE --chain-id $CHAIN_ID
```

## Query Functions

### Get Profile by Username

Query a profile using the username:

```bash
xiond query wasm contract-state smart $CONTRACT \
  '{"get_profile":{"username":"alice_creator"}}' \
  --output json --node $NODE
```

### Get Profile by Wallet Address

Query a profile using a wallet address:

```bash
xiond query wasm contract-state smart $CONTRACT \
  '{"get_profile_by_wallet":{"wallet":"xion1wallet_address_here"}}' \
  --output json --node $NODE
```

### List Profiles

List all profiles with pagination:

```bash
# List first 30 profiles
xiond query wasm contract-state smart $CONTRACT \
  '{"list_profiles":{"limit":30}}' \
  --output json --node $NODE

# List next 30 profiles after a specific username
xiond query wasm contract-state smart $CONTRACT \
  '{"list_profiles":{"limit":30,"start_after":"last_username_from_previous_query"}}' \
  --output json --node $NODE
```

### Get Tips

Query tips sent or received by a user:

```bash
# Get tips received by a user
xiond query wasm contract-state smart $CONTRACT \
  '{"get_tips_received":{"username":"alice_creator","limit":30}}' \
  --output json --node $NODE

# Get tips sent by a user
xiond query wasm contract-state smart $CONTRACT \
  '{"get_tips_sent":{"username":"bob_creator","limit":30}}' \
  --output json --node $NODE
```

### Get User Stats

Get statistics for a specific user:

```bash
xiond query wasm contract-state smart $CONTRACT \
  '{"get_user_stats":{"username":"alice_creator"}}' \
  --output json --node $NODE
```

### Check Admin Status

Check if an address is an admin:

```bash
xiond query wasm contract-state smart $CONTRACT \
  '{"is_admin":{"address":"xion1address_to_check"}}' \
  --output json --node $NODE
```

### Check Username Availability

Check if a username is available:

```bash
xiond query wasm contract-state smart $CONTRACT \
  '{"is_username_available":{"username":"desired_username"}}' \
  --output json --node $NODE
```

## Using the Functions in Shell Scripts

You can create shell functions to make these operations more convenient. Here's an example script that wraps the commands:

```bash
#!/bin/bash

# Config
export CONTRACT="your_contract_address_here"
export WALLET="your_wallet_address_here"
export NODE="https://rpc.xion-testnet-1.burnt.com"
export CHAIN_ID="xion-testnet-1"
export GAS_PRICE="0.0001uxion"
export GAS_ADJUSTMENT="1.3"

# Register profile function
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

# Record tip function
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

# Example usage:
# register_profile "alice" "Alice Creator" "I create digital art" "https://cloudinary.com/profile.jpg" "https://cloudinary.com/banner.jpg" "alice_creates" "https://alicecreator.com"
# record_tip "alice" "10" "Great work!"
```

Save this script as `tipchain.sh`, make it executable with `chmod +x tipchain.sh`, and then source it in your shell with `. ./tipchain.sh` to use the functions. 