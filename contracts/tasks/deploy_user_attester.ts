import { HardhatRuntimeEnvironment } from "hardhat/types/runtime";

export default async function deploy_hook(
    params: any,
    hre: HardhatRuntimeEnvironment,
  ): Promise<void> {
    await hre.run("compile");
  
    const ethers = hre.ethers;
    const [account] = await ethers.getSigners();
  
    const UserAttester = await ethers.getContractFactory("UserAttester");
    const userAttester = await UserAttester.deploy();
    await userAttester.deployed();
    console.log(`User attester deployed to: ${userAttester.address}`);
  }