# Chainlink Convergence CRE Tokenizer

<div style="text-align:center" align="center">
    <a href="https://chain.link" target="_blank">
        <img src="https://raw.githubusercontent.com/smartcontractkit/chainlink/develop/docs/logo-chainlink-blue.svg" width="225" alt="Chainlink logo">
    </a>

[![License](https://img.shields.io/badge/license-MIT-blue)](https://github.com/smartcontractkit/cre-templates/blob/main/LICENSE)
[![CRE Home](https://img.shields.io/static/v1?label=CRE&message=Home&color=blue)](https://chain.link/chainlink-runtime-environment)
[![CRE Documentation](https://img.shields.io/static/v1?label=CRE&message=Docs&color=blue)](https://docs.chain.link/cre)

</div>

## Overview

The Chainlink Convergence CRE Tokenizer is an automated workflow for collateral tokenization using the Chainlink Runtime Environment (CRE). This system enables users to deposit collateral assets, receive share tokens in return, and manage redemptions through smart contracts.

The workflow runs on a cron schedule and executes multiple handlers to manage the entire lifecycle of tokenized collateral:
- Deploy tokenizer contracts
- Deposit collateral (ERC20 and ERC1155 tokens)
- Redeem collateral
- Manage share token distributions

---

## Prerequisites & Important Notes

### ⚠️ Demo Parameters

**This is a DEMO deployment with the following characteristics:**

- **Hardcoded Parameters**: Demo uses hardcoded wallet addresses and token amounts for testing
- **Mock Tokens**: All tokens used are mock ERC20 deployments on **Ethereum Sepolia Testnet**
- **Test User Address**: `0xd574dcdC64f0a6aF81C5940cAB60d96929798E66` (hardcoded in `main.ts`)
- **Test Vault Address**: `0xd6513a2ee1297a59B857cc3c79523b4C64e4EfCa` (configured in `config.staging.json`)

VAULT DEPLOYMENT AND INTERACTIONS : [BLOCKSCOUT](https://eth-sepolia.blockscout.com/address/0xd6513a2ee1297a59B857cc3c79523b4C64e4EfCa?tab=internal_txns)

### 🔧 Production Setup Required

Before running in production, you must:

1. **Deploy Vault Contracts**: Deploy vault contracts for your specific use case with your wallet
2. **Update Configuration**: Modify `config.staging.json` or `config.production.json` with your:
   - Vault contract addresses
   - User/receiver addresses
   - Supported token addresses and price feeds
   - Custom gas limits and RPC endpoints
3. **Update Handler Functions**: Modify the handler functions in `tokenized-workflow/main.ts` to use dynamic parameters instead of hardcoded values
4. **Configure Secrets**: Add your private keys and sensitive data to `.env` or `secrets.yaml`

---

## Detailed Setup Guide

### Step 1: Install CRE CLI

Install the [CRE CLI](https://docs.chain.link/cre) - this is the core tool for running workflows.

```bash
# Follow installation instructions at https://docs.chain.link/cre
cre --version  # Verify installation
```

### Step 2: Install Dependencies

If **Bun** is not already installed, follow the instructions at: [https://bun.com/docs/installation](https://bun.com/docs/installation)

Install project dependencies:

```bash
# From project root
bun install --cwd ./tokenized-workflow
```

### Step 3: Configure Environment Variables

Create or update the `.env` file in the **project root**:

```bash
# For local simulation (can be a dummy key)
CRE_ETH_PRIVATE_KEY=0000000000000000000000000000000000000000000000000000000000000001

# For testnet/mainnet (must be a real, funded wallet)
# CRE_ETH_PRIVATE_KEY=your_actual_private_key_here
```

**Important**: For actual blockchain interactions, ensure your private key belongs to a funded wallet on the target network.

### Step 4: Configure RPC Endpoints

Update [project.yaml](project.yaml) with RPC endpoints for the chains you'll interact with:

```yaml
rpcs:
  - chain-name: ethereum-testnet-sepolia
    url: https://sepolia.infura.io/v3/YOUR_INFURA_KEY
```

**Supported Chains for Local Simulation**:
- Ethereum (`ethereum-testnet-sepolia`, `ethereum-mainnet`)
- Base (`ethereum-testnet-sepolia-base-1`, `ethereum-mainnet-base-1`)
- Avalanche (`avalanche-testnet-fuji`, `avalanche-mainnet`)
- Polygon (`polygon-testnet-amoy`, `polygon-mainnet`)
- BNB Chain (`binance-smart-chain-testnet`, `binance-smart-chain-mainnet`)
- Arbitrum (`ethereum-testnet-sepolia-arbitrum-1`, `ethereum-mainnet-arbitrum-1`)
- Optimism (`ethereum-testnet-sepolia-optimism-1`, `ethereum-mainnet-optimism-1`)

Refer to [chain-selectors](https://github.com/smartcontractkit/chain-selectors/blob/main/selectors.yml) for complete chain name references.

### Step 5: (Optional) Deploy Your Contracts

To use custom vault contracts instead of the demo contracts:

clone from here : [REPO] (https://github.com:BOBseal/chainlink_cre_unified_shares.git)

### Step 6: Configure Workflow Settings

Update the workflow configuration in [tokenized-workflow/config.staging.json](tokenized-workflow/config.staging.json):

```json
{
  "schedule": "*/30 * * * * *",
  "apiUrl": "http://localhost:5000/api/",
  "evms": [
    {
      "vaultAddress": "0xYOUR_VAULT_ADDRESS",
      "chainSelectorName": "ethereum-testnet-sepolia",
      "gasLimit": 2000000
    }
  ]
}
```

**Configuration Parameters**:
- `schedule`: Cron expression (e.g., `"*/30 * * * * *"` = every 30 seconds)
- `apiUrl`: Backend API URL for dynamic data
- `vaultAddress`: Your deployed vault contract address
- `chainSelectorName`: Target blockchain for execution
- `gasLimit`: Maximum gas for transactions

### Step 7: Run the Workflow

#### Option 1: Simple Simulation
```bash
# Run from project root
cre workflow simulate tokenized-workflow --broadcast
```

#### Option 2: Execute with All Triggers (Recommended)
```bash

chmod +x ./run.sh
# Runs all 5 cron triggers sequentially with logging
./run.sh

# or use the alternative script
chmod +x ./run.sh
./run_workflow_with_triggers.sh
```

The script will:
- Execute the workflow 5 times (once for each cron trigger)
- Display real-time output in console
- Save complete execution logs to `workflow_execution_YYYYMMDD_HHMMSS.log`

#### View Execution Logs
```bash
# List all execution logs
ls -lh workflow_execution_*.log

# View latest log
tail -f workflow_execution_*.log
```

---

## Workflow Flow & Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                  CRE Tokenizer Workflow                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Cron Trigger (30s interval)                   │  │
│  └──────────────┬───────────────────────────────────────┘  │
│                 │                                            │
│         ┌───────▼────────────────────────┐                  │
│         │  Initialize Workflow Runtime    │                  │
│         │  - Load Config                  │                  │
│         │  - Setup EVM Clients            │                  │
│         │  - Initialize Price Feeds       │                  │
│         └───────┬────────────────────────┘                  │
│                 │                                            │
│    ┌────────────┴────────────────┐                          │
│    │                             │                          │
│    ▼                             ▼                          │
│ ┌─────────────────┐      ┌──────────────────┐             │
│ │ Handler Chain 1 │      │ Handler Chain 2  │             │
│ │ Deploy Tokenizer│      │ Deposit Collateral│             │
│ └────────┬────────┘      └────────┬─────────┘             │
│          │                        │                        │
│          ▼                        ▼                        │
│ ┌─────────────────┐      ┌──────────────────┐             │
│ │ Handler Chain 3 │      │ Handler Chain 4  │             │
│ │ Redeem Collateral│      │ Deposit ERC1155  │             │
│ └────────┬────────┘      └────────┬─────────┘             │
│          │                        │                        │
│          │              ┌─────────┴──────────┐             │
│          │              │                    │             │
│          └──────────────┼────────────────────┤             │
│                         ▼                    │             │
│                 ┌─────────────────┐         │             │
│                 │ Handler Chain 5 │         │             │
│                 │ Withdraw ERC1155 │◄────────┘             │
│                 └────────┬────────┘                        │
│                          │                                 │
│                          ▼                                 │
│                 ┌──────────────────┐                      │
│                 │  Execute TX      │                      │
│                 │  - Call Contract │                      │
│                 │  - Broadcast TX  │                      │
│                 │  - Log Results   │                      │
│                 └──────────────────┘                      │
│                                                            │
└─────────────────────────────────────────────────────────────┘
```

### Detailed Handler Flows

#### 1. Deploy Tokenizer Handler
```
onDeployTokenizer()
    │
    ├─ Setup network and EVM client
    ├─ Validate supported tokens & price feeds
    ├─ Call: handleDeployCollaterals()
    │   ├─ Deploy Tokenizer Factory
    │   ├─ Create vault for collateral
    │   └─ Emit deployment event
    │
    └─ Return: TX Hash or error
```

#### 2. Deposit Collaterals Handler (ERC20)
```
onDepositCollaterals()
    │
    ├─ Fetch token prices from Chainlink price feeds
    ├─ Approve collateral tokens to vault
    ├─ Call: handleDepositCollaterals()
    │   ├─ Transfer ERC20 tokens from user to vault
    │   ├─ Calculate share token amount based on collateral value
    │   ├─ Mint share tokens to user
    │   └─ Log deposit amount and shares
    │
    └─ Return: TX Hash or error
```

#### 3. Redeem Collaterals Handler
```
onRedeemCollaterals()
    │
    ├─ Fetch current token prices
    ├─ Call: handleRedeemCollaterals()
    │   ├─ Burn share tokens from user
    │   ├─ Calculate collateral amount to return
    │   ├─ Transfer collateral back to user
    │   └─ Log redemption details
    │
    └─ Return: TX Hash or error
```

#### 4. Deposit ERC1155 Handler
```
onDeposit1155()
    │
    ├─ Setup ERC1155 token collection
    ├─ Call: handleDeposit1155()
    │   ├─ Approve ERC1155 tokens via setApprovalForAll
    │   ├─ Transfer NFT/semi-fungible tokens to vault
    │   ├─ Calculate valuation based on Chainlink data
    │   ├─ Issue corresponding share tokens
    │   └─ Log token IDs and amounts
    │
    └─ Return: TX Hash or error
```

#### 5. Withdraw ERC1155 Handler
```
onWithdraw1155()
    │
    ├─ Get current share token balance
    ├─ Call: handleRedeem1155()
    │   ├─ Burn share tokens
    │   ├─ Transfer original ERC1155 tokens back
    │   ├─ Return to designated receiver
    │   └─ Log withdrawal confirmation
    │
    └─ Return: TX Hash or error
```

### Data Flow During Execution

```
┌──────────────┐
│ Config Files │
└───────┬──────┘
        │
        ├─ config.staging.json     (Schedule, vault address, gas limit)
        ├─ config.production.json   (Production settings)
        │
        ▼
┌──────────────────┐
│  Runtime Setup   │
├──────────────────┤
│ • Network config │
│ • EVM Client     │
│ • Price feeds    │
│ • Contract ABIs  │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────┐
│  Handler Execution Loop  │
├──────────────────────────┤
│ 1. Deploy Tokenizer      │
│ 2. Deposit Collateral    │
│ 3. Redeem Collateral     │
│ 4. Deposit ERC1155       │
│ 5. Withdraw ERC1155      │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│   Blockchain Network     │
├──────────────────────────┤
│ Ethereum Sepolia Testnet │
│                          │
│ • Vault Contract         │
│ • ERC20 Tokens           │
│ • ERC1155 Tokens         │
│ • Price Feed Contracts   │
└──────────────────────────┘
```

---

## Project Structure

```
.
├── project.yaml                      # CRE project configuration
├── README.md                         # This file
├── run.sh                            # Execute workflow with all triggers
├── run_workflow_with_triggers.sh     # Alternative execution script
│
└── tokenized-workflow/
    ├── main.ts                       # Workflow entry point & handler definitions
    ├── package.json                  # Dependencies
    ├── tsconfig.json                 # TypeScript configuration
    ├── workflow.yaml                 # Workflow-specific settings
    ├── config.staging.json           # Staging environment config
    ├── config.production.json        # Production environment config
    │
    ├── actions/
    │   ├── read.ts                   # Read operations (fetch prices, balances)
    │   └── write.ts                  # Write operations (deposits, withdrawals)
    │
    ├── constants/
    │   └── index.ts                  # Constants & supported token configs
    │
    ├── contracts/
    │   ├── index.ts                  # Contract imports
    │   └── abi/
    │       ├── tokenizerFactory.ts   # Factory ABI
    │       ├── vault.ts              # Vault ABI
    │       ├── vaultCore.ts          # Vault core logic ABI
    │       ├── erc1155Shares.ts      # ERC1155 shares ABI
    │       ├── collateralBase.ts     # Collateral base ABI
    │       ├── aggregatorV3.ts       # Chainlink price feed ABI
    │       ├── iReceiver.ts          # Receiver interface ABI
    │       ├── receiverTemplate.ts   # Receiver template ABI
    │       └── alternative1155Vault.ts  # Alternative ERC1155 vault ABI
    │
    ├── helper/
    │   ├── index.ts                  # Helper utilities
    │   └── agent.ts                  # Agent setup utilities
    │
    └── types/
        └── index.ts                  # TypeScript types & interfaces
```

---

## Key Features

✅ **Automated Collateral Management**: Cron-based scheduling for regular operations  
✅ **Multi-Token Support**: Handles ERC20 and ERC1155 tokens  
✅ **Price Oracle Integration**: Uses Chainlink price feeds for accurate valuations  
✅ **Share Token System**: Issues share tokens representing user's collateral  
✅ **Broadcast Transactions**: Executes transactions on actual blockchain  
✅ **Comprehensive Logging**: Logs all execution to console and files  
✅ **Error Handling**: Graceful error handling with detailed messages  

---

## Troubleshooting

### "Workflow simulate command failed"
- Verify CRE CLI is installed: `cre --version`
- Check RPC endpoints are valid in `project.yaml`
- Ensure `.env` file exists with private key

### "Transaction out of gas"
- Increase `gasLimit` in config files
- Check current gas prices on target network

### "Invalid contract address"
- Verify vault addresses in config files are checksummed Ethereum addresses
- Ensure contracts are deployed on the specified network

### "Price feed not available"
- Check supported tokens in [tokenized-workflow/constants/index.ts](tokenized-workflow/constants/index.ts)
- Verify Chainlink price feeds are available for your tokens on the network

---

## Next Steps

1. Deploy your vault contracts to Sepolia testnet
2. Update addresses in `config.staging.json`
3. Modify handler functions to use dynamic parameters
4. Test with `./run.sh`
5. Review logs in `workflow_execution_*.log`
6. Deploy to production when ready

For more information, visit [Chainlink CRE Documentation](https://docs.chain.link/cre).
