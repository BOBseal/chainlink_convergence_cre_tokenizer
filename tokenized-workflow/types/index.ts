import { NetworkInfo } from "@chainlink/cre-sdk"


type EvmConfig = {
      vaultAddress: string;
      chainSelectorName: string;
      gasLimit: string;
   }
   
type Config = {
     schedule: string;
     apiUrl: string;
     evms: EvmConfig[]
   };
   
type HexString = `0x${string}`
   
type SetupData = {
      config: Config;
      evmConfig: EvmConfig;
      network: NetworkInfo
   }
   
type MappedReadOnchain<T> = {
      [Property in keyof T]: T[Property]
   };
   
type MarketResolvedStats = {
      status: boolean;
   }
   
type Token = {
      id: number;
      name: string;
      address: string;
      amount: number;
   }
   
type TokenPrices = (string|bigint)[][]



export type {
    EvmConfig,
    Config,
    SetupData,
    MappedReadOnchain,
    MarketResolvedStats,
    Token,
    TokenPrices,
    HexString
}