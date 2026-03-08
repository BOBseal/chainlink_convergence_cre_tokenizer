import { CronCapability, handler, Runner, type Runtime, EVMClient } from "@chainlink/cre-sdk";
import { handleDepositCollaterals, handleRedeemCollaterals, handleDeposit1155, handleRedeem1155, handleDeployCollaterals} from "./actions/write"
import { Config } from "./types";
import { supportedTokensPriceFeeds } from "./constants";
import { fetchTokensPrices } from "./actions/read"
import { setup } from "./helper";

const USER = "0xd574dcdC64f0a6aF81C5940cAB60d96929798E66"

// ------------------------------------ HANDLER FUNCTIONS ------------------------------

const onDeployTokenizer = (runtime: Runtime<Config>): string => {
    // get user collaterals
    const { network } = setup(runtime)
    const evmClient = new EVMClient(network.chainSelector.selector)
    // for production, this workflow needs to be triggered by external server when user wants to deposit collaterals
    // needs a http triggers capability implemented here to trigger deposit collaterals function

    try {
      // below is for testing - ERC20 deposit
      const deployHash = handleDeployCollaterals(
        runtime, 
        supportedTokensPriceFeeds, // test collaterals
        USER, // test user,
        "TestShareToken",
        "TSHARE"
      )
      
      runtime.log(`Tokenizer DEPLOYED: ${deployHash}`)
      return deployHash 
    } catch (error) {
      runtime.log(`Tokenizer Deploy FAILED: ${error}`)
      return "" 
    }
}

const onDepositCollaterals = (runtime: Runtime<Config>): string => {
    // get user collaterals
    const { network } = setup(runtime)
    const evmClient = new EVMClient(network.chainSelector.selector)
    // for production, this workflow needs to be triggered by external server when user wants to deposit collaterals
    // needs a http triggers capability implemented here to trigger deposit collaterals function

    try {
      // below is for testing - ERC20 deposit
      const depositCollateralsHash = handleDepositCollaterals(
        runtime, 
        supportedTokensPriceFeeds, // test collaterals
        USER // test user
      )
      
      runtime.log(`COLLATERALS DEPOSITED: ${depositCollateralsHash}`)
      return depositCollateralsHash 
    } catch (error) {
      runtime.log(`COLLATERALS DEPOSIT FAILED: ${error}`)
      return "" 
    }
}

const onRedeemCollaterals = (runtime: Runtime<Config>): string  => {
    // for production, this workflow needs to be triggered by external server when user wants to redeem collaterals
    // needs a http triggers capability implemented here to trigger redeem collaterals function

    try {
      // below is for testing - ERC20 redeem
      const redeemTxHash = handleRedeemCollaterals(
         runtime,
         supportedTokensPriceFeeds,
         USER
      ) 
      runtime.log(`COLLATERALS REDEEMED: ${redeemTxHash}`)
      return redeemTxHash
      
    } catch (error) {
      runtime.log(`COLLATERALS REDEMPTION FAILED: ${error}`)
      return ""
    }
}

// IMPORTANT !!!
// WRITE A `HANDLER` function to test your function AND PASS the HANDLER function into the handler function below

const initWorkflow = (config: Config) => {
  // initialize a cron capability
  const cron = new CronCapability();

  return [
    handler(
      cron.trigger(
        { schedule: config.schedule }
      ), 
      onDeployTokenizer
    ),
    handler(
      cron.trigger(
        { schedule: config.schedule }
      ), 
      onDepositCollaterals
    ),
    handler(
      cron.trigger({
        schedule: config.schedule
      }),
      onRedeemCollaterals
    )
  ];
};

export async function main() {
  const runner = await Runner.newRunner<Config>();
  await runner.run(initWorkflow);
}
