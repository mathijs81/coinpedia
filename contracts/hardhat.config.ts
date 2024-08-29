import 'dotenv/config';
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-preprocessor";
import { HardhatUserConfig, task } from "hardhat/config";

import example from "./tasks/example";
import deploy_token from "./tasks/deploy_token";
import deploy_hook from "./tasks/deploy_hook";

task("example", "Example task").setAction(example);
task("deploy_token", "Deploy token").setAction(deploy_token);
task("deploy_hook", "Deploy hook").setAction(deploy_hook);

const config = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  paths: {
    sources: "./src", // Use ./src rather than ./contracts as Hardhat expects
    cache: "./cache_hardhat", // Use a different cache for Hardhat than Foundry
  },
  networks: {
    baseSepolia: {
      url: "https://sepolia.base.org",
      accounts: [process.env.TESTNET_PRIVATE_KEY]
    }
  }
};

export default config;
