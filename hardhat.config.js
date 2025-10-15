require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.28",
  networks: {
    localhost: { url: "http://127.0.0.1:8545" },
    monadTestnet: {
      url: process.env.MONAD_RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 10143
    }
  }
};