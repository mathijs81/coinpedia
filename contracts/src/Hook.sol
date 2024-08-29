// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ISPHook} from "@ethsign/sign-protocol-evm/src/interfaces/ISPHook.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * Hook to make sure that attestations are done by whitelisted contracts or 
 * TODO: the owner of the ERC20 token that the attestation is about
 */
contract OwnerCheckHook is ISPHook, Ownable {
    mapping(address attester => bool allowed) public whitelist;
    error UnauthorizedAttester();

    constructor() Ownable(_msgSender()) {}

    function setWhitelist(address attester, bool allowed) external onlyOwner {
        whitelist[attester] = allowed;
    }

    function _checkAttester(address attester, address token) internal view {
        // check if token is an ownable contract
        
        // address coinOwner = IERC20(token).owner();
        // if (attester != coinOwner && attester != owner() && !whitelist[attester]) {
        //     revert UnauthorizedAttester();
        // }

        if (attester != owner() && !whitelist[attester]) {
            revert UnauthorizedAttester();
        }
    }

    function extractTokenAddress(uint64 attestationId) internal pure returns (address) {
        // TODO: look up attestation, extract token address
        return address(0);
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
        address attester,
        uint64,
        uint64,
        bytes calldata
    ) external payable {
        revert("not supported");
    }

    function didReceiveRevocation(
        address attester,
        uint64,
        uint64,
        IERC20,
        uint256,
        bytes calldata
    ) external view {
        revert("not supported");
    }
}