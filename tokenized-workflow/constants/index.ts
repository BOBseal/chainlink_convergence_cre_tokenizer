import type { Token } from "../types"

const supportedTokensPriceFeeds: Token[] = [
    { id: 1, name: "SNX", address: "0xc0F82A46033b8BdBA4Bb0B0e28Bc2006F64355bC", amount: 1 },
    { id: 2, name: "LINK", address: "0xc59E3633BAAC79493d908e63626716e204A45EdF", amount: 1 },
    { id: 3, name: "DAI", address: "0x14866185B1962B63C3Ea9E03Bc1da838bab34C19", amount: 1 },
    { id: 4, name: "ETH", address: "0x694AA1769357215DE4FAC081bf1f309aDC325306", amount: 1 },
    { id: 5, name: "BTC", address: "0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43", amount: 1 },
]

export {
    supportedTokensPriceFeeds
}