import type { Token } from "../types"

const supportedTokensPriceFeeds: Token[] = [
    { id: 1, name: "LINK", address: "0xc59E3633BAAC79493d908e63626716e204A45EdF",mAddress:"0xDe9660bf486Bcb9921A4a6C87443B45D52639849", amount: 1 },
    { id: 2, name: "ETH", address: "0x694AA1769357215DE4FAC081bf1f309aDC325306",mAddress:"0x686f670889750c611D2BFff89951b687ed5f92A6", amount: 1 },
    { id: 3, name: "BTC", address: "0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43",mAddress:"0xB9990a0E50B7c355Ade30c5470fb50dE106385e9", amount: 1 },
]

export {
    supportedTokensPriceFeeds
}