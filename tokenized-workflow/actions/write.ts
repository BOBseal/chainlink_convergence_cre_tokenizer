import { 
    Runtime, 
    bytesToHex,
    EVMClient,
} from "@chainlink/cre-sdk"
import { setup, reportSign, reportWrite } from "../helper"
import type { Config, Token } from "../types"
import { calculateShare } from "./read"

// ------------------------------- WRITE FUNCTION S---------------------------------------

function handleDeployCollaterals(
  runtime: Runtime<Config>,
  collaterals: Token[],
  user:string,
  name:string,
  symbol:string
): string {
    const { network, evmConfig } = setup(runtime)
    const evmClient = new EVMClient(network.chainSelector.selector)
    let filteredCollaterals: string[] = []

    collaterals.forEach(col => filteredCollaterals.push(col.mAddress))

    try {
        runtime.log('signing a collateral deposit report')
        // encode according to Vault._processReport: (actionCode,name, symbol, collaterals[], owner)
        const ACTION_DEPLOY_SHARES_ERC20 = 1
        const signedReport = reportSign(runtime,
          "uint8 actionCode, string name, string symbol,address[] collaterals, address user",
          [
            ACTION_DEPLOY_SHARES_ERC20, // action code for ERC20 deploy
            name,
            symbol,                       // vaultId (unused for now)
            filteredCollaterals,     // collaterals
            user                    // user addr
          ]
        )
     runtime.log('writing a tokenizer creation report')
       
     // write a report
     const depositColResult = reportWrite(runtime, signedReport, evmConfig, evmClient, evmConfig.vaultAddress)
     const txHash = bytesToHex(depositColResult?.txHash || new Uint8Array(32))
     runtime.log(`tokenizer creation's hash ${txHash}`)
     return txHash;
    } catch (error) {
        runtime.log(`[Deploy-Tokenizer]: something went wrong on depositing collateral ${error}`)
        return ""
    }
}


function handleDepositCollaterals(
  runtime: Runtime<Config>,
  collaterals: Token[],
  user: string
): string {
    const { network, evmConfig } = setup(runtime)
    const evmClient = new EVMClient(network.chainSelector.selector)
    let filteredCollaterals: string[] = [], 
    collateralsAmounts: bigint[] = []

    collaterals.forEach(colla => collateralsAmounts.push(BigInt(colla.amount) * 10n ** 18n))
    collaterals.forEach(col => filteredCollaterals.push(col.mAddress))
    const sharesToMint = calculateShare(runtime, collaterals, evmClient)
    
    try {
        runtime.log('signing a collateral deposit report')
        // encode according to Vault._processReport: (actionCode, vaultId, user, collaterals[], amounts[], sharesToMint)
        const ACTION_MINT_SHARES_ERC20 = 0
        const signedReport = reportSign(runtime,
          "uint8 actionCode, uint256 vaultId, address user, address[] collaterals, uint256[] amounts, uint256 sharesToMint",
          [
            ACTION_MINT_SHARES_ERC20, // action code for ERC20 mint
            0,                       // vaultId (unused for now)
            user,                    // user addr
            filteredCollaterals,     // collaterals
            collateralsAmounts,      // token amounts
            sharesToMint * 10n ** 18n             // shares to mint
          ]
        )
     runtime.log('writing a collateral deposit report')
       
     // write a report
     const depositColResult = reportWrite(runtime, signedReport, evmConfig, evmClient, evmConfig.vaultAddress)
     const txHash = bytesToHex(depositColResult?.txHash || new Uint8Array(32))
     runtime.log(`collateral deposit's hash ${txHash}`)
     return txHash;
    } catch (error) {
        runtime.log(`[Deposit-Collateral]: something went wrong on depositing collateral ${error}`)
        return ""
    }
}

function handleRedeemCollaterals(
  runtime: Runtime<Config>,
  collaterals: Token[],
  user: string
): string {
    const { network, evmConfig } = setup(runtime)
    const evmClient = new EVMClient(network.chainSelector.selector)
    const sharesToBurn = calculateShare(runtime, collaterals, evmClient)

    try {
        runtime.log('signin a collateral redemption report')
        // encode for Vault._processReport: (actionCode, vaultId, user, sharesToBurn, receiver)
        const ACTION_REDEEM_SHARES_ERC20 = 2
        const signedReport = reportSign(runtime,
          "uint8 actionCode, uint256 vaultId, address user, uint256 sharesBurned, address receiver",
          [
            ACTION_REDEEM_SHARES_ERC20, // redemption action code
            0,                         // vaultId
            user,                      // user addr
            sharesToBurn * 10n ** 18n,              // shares to burn
            user                       // receiver address
          ]
        )
     runtime.log('writing a collateral redemption report')
       
     // write a report
     const redeemResult = reportWrite(runtime, signedReport, evmConfig, evmClient, evmConfig.vaultAddress)
     const txHash = bytesToHex(redeemResult?.txHash || new Uint8Array(32))
     runtime.log(`collateral redemption's hash ${txHash}`)
     return txHash;
    } catch (error) {
        runtime.log(`[Redeem-Collateral]: something went wrong on redeem collateral ${error}`)
        return ""
    }
}


// -------- ERC1155 support ------------------------------------------------

function handleDeposit1155(
  runtime: Runtime<Config>,
  collaterals: Token[],
  user: string,
): string {
    const { network, evmConfig } = setup(runtime)
    const evmClient = new EVMClient(network.chainSelector.selector)
    const filteredCollaterals: string[] = []
    const collateralsAmounts: bigint[] = []
    collaterals.forEach(c => collateralsAmounts.push(BigInt(c.amount) * 10n ** 18n))
    collaterals.forEach(c => filteredCollaterals.push(c.mAddress))
    const ACTION_MINT_SHARES_1155 = 3
    const sharesToMint = calculateShare(runtime, collaterals,evmClient);
    try {
        runtime.log('signing ERC1155 deposit report')
        const signedReport = reportSign(runtime,
          "uint8 actionCode, uint256 tokenId, address user, address[] collaterals, uint256[] amounts, uint256 sharesToMint",
          [
            ACTION_MINT_SHARES_1155,
            0,
            user,
            filteredCollaterals,
            collateralsAmounts,
            sharesToMint
          ]
        )
        runtime.log('writing ERC1155 deposit report')
        const result = reportWrite(runtime, signedReport, evmConfig, evmClient, evmConfig.vaultAddress)
        const txHash = bytesToHex(result?.txHash || new Uint8Array(32))
        runtime.log(`ERC1155 deposit tx hash ${txHash}`)
        
        return txHash
    } catch (error) {
        runtime.log(`[Deposit-ERC1155]: error ${error}`)
        return ""
    }
}

function handleRedeem1155(
  runtime: Runtime<Config>,
  user: string,
  collaterals: Token[],
  receiver: string
): string {
    const { network, evmConfig } = setup(runtime)
    const evmClient = new EVMClient(network.chainSelector.selector)
    const ACTION_REDEEM_SHARES_1155 = 5
    const toBurn = calculateShare(runtime,collaterals,evmClient)
    try {
        runtime.log('signing ERC1155 redemption report')
        const signedReport = reportSign(runtime,
          "uint8 actionCode, uint256 tokenId, address user, uint256 sharesBurned, address receiver",
          [
            ACTION_REDEEM_SHARES_1155,
            4,
            user,
            toBurn,
            receiver
          ]
        )
        runtime.log('writing ERC1155 redemption report')
        const result = reportWrite(runtime, signedReport, evmConfig, evmClient, evmConfig.vaultAddress)
        const txHash = bytesToHex(result?.txHash || new Uint8Array(32))
        runtime.log(`ERC1155 redemption tx hash ${txHash}`)
        return txHash
    } catch (error) {
        runtime.log(`[Redeem-ERC1155]: error ${error}`)
        return ""
    }
}

export {
  handleDeployCollaterals,
  handleDepositCollaterals,
  handleRedeemCollaterals,
  handleDeposit1155,
  handleRedeem1155
}