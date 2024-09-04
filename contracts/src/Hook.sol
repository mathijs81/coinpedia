// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ISPHook} from "@ethsign/sign-protocol-evm/src/interfaces/ISPHook.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Attestation} from "@ethsign/sign-protocol-evm/src/models/Attestation.sol";
import {ISP} from "@ethsign/sign-protocol-evm/src/interfaces/ISP.sol";

/**
 * Hook to make sure that attestations are done by whitelisted contracts or 
 * the owner of the ERC20 token that the attestation is about
 */
contract OwnerCheckHook is ISPHook, Ownable {
    ISP public spInstance;
    mapping(address attester => bool allowed) public whitelist;
    error UnauthorizedAttester();

    constructor() Ownable(_msgSender()) {}

    function setWhitelist(address attester, bool allowed) external onlyOwner {
        whitelist[attester] = allowed;
    }

    function setSPInstance(address instance) external onlyOwner {
        spInstance = ISP(instance);
    }

    function _checkAttester(address attester, address token) internal view {
        // check if token is an ownable contract
        
        address coinOwner = address(0);

        // Note: we skip the Ownable check if the 'token' address is not a contract.
        // This normally doesn't make sense, but for the hackathon we want to be able
        // to attest metadata for base (production) coins on base-sepolia and if we don't
        // skip this check we can't demonstrate the lit/ape.store integration
        if (token.code.length > 0) {
            try Ownable(token).owner() returns (address owner) {
                coinOwner = owner;
            } catch {
                // it's probably not an ownable contract.
            }
        }
        if (attester != coinOwner && attester != owner() && !whitelist[attester]) {
             revert UnauthorizedAttester();
        }
    }

    function extractTokenAddress(uint64 attestationId) internal view returns (address) {
        Attestation memory attestation = spInstance.getAttestation(attestationId);
        (address tokenAddress) = abi.decode(attestation.data, (address));
        return tokenAddress;
    }

    function didReceiveAttestation(
        address attester,
        uint64,
        uint64 attestationId,
        bytes calldata
    ) external payable {
        _checkAttester(attester, extractTokenAddress(attestationId));
    }

    function didReceiveAttestation(
        address attester,
        uint64,
        uint64 attestationId,
        IERC20,
        uint256,
        bytes calldata
    ) external view {
        _checkAttester(attester, extractTokenAddress(attestationId));
    }

    function didReceiveRevocation(
        address,
        uint64,
        uint64,
        bytes calldata
    ) external payable {
        revert("not supported");
    }

    function didReceiveRevocation(
        address,
        uint64,
        uint64,
        IERC20,
        uint256,
        bytes calldata
    ) external pure {
        revert("not supported");
    }
}