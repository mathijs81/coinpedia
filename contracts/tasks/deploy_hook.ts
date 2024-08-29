import { HardhatRuntimeEnvironment } from "hardhat/types/runtime";

export default async function deploy_hook(
    params: any,
    hre: HardhatRuntimeEnvironment,
  ): Promise<void> {
  
    const ethers = hre.ethers;
    const [account] = await ethers.getSigners();
  
    const Hook = await ethers.getContractFactory("OwnerCheckHook");
    const hook = await Hook.deploy();
    await hook.deployed();
    console.log(`Hook deployed to: ${hook.address}`);
  }