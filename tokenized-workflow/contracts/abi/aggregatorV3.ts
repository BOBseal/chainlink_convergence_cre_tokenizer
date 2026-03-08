import { parseAbi } from "viem"

const aggregatorV3Interface=[
  "function decimals() external view returns (uint8)",
  "function description() external view returns (string)",
  "function getRoundData(uint80 _roundId) external view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)",
  "function latestRoundData() external view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)",
  "function version() external view returns (uint256)",
]

export default parseAbi(aggregatorV3Interface)