import { HardhatRuntimeEnvironment } from "hardhat/types/runtime";

// see https://docs.sign.global/for-builders/index-1/index/address-book
const baseSepoliaSignProtocol = '0x4e4af2a21ebf62850fD99Eb6253E1eFBb56098cD';

export default async function deploy_hook(
    params: any,
    hre: HardhatRuntimeEnvironment,
  ): Promise<void> {
    await hre.run("compile");
  
    const ethers = hre.ethers;
    const [account] = await ethers.getSigners();
  
    const Hook = await ethers.getContractFactory("OwnerCheckHook");
    const hook = await Hook.deploy();
    await hook.deployed();
    console.log(`Hook deployed to: ${hook.address}`);
    await hook.setSPInstance(baseSepoliaSignProtocol)
  }