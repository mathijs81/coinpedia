import { HardhatRuntimeEnvironment } from "hardhat/types/runtime";

export default async function deploy_token(
    params: any,
    hre: HardhatRuntimeEnvironment,
  ): Promise<void> {
    await hre.run("compile");
  
    const ethers = hre.ethers;
    const [account] = await ethers.getSigners();
  
    const Token = await ethers.getContractFactory("Token");
    const token = await Token.deploy();
    await token.deployed();
    console.log(`Token deployed to: ${token.address}`);
  }