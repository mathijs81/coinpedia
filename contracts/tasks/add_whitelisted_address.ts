import { HardhatRuntimeEnvironment } from "hardhat/types/runtime";

export default async function deploy_hook(
    params: any,
    hre: HardhatRuntimeEnvironment,
  ): Promise<void> {
    const {hook, whitelisted} = params;
    const ethers = hre.ethers;
    const [account] = await ethers.getSigners();

    const hookContract = await ethers.getContractAt("OwnerCheckHook", hook);
    console.log(await hookContract.setWhitelist(whitelisted, true));
  }