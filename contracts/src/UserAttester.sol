// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;
import { ISP } from '@ethsign/sign-protocol-evm/src/interfaces/ISP.sol';
import { Attestation } from '@ethsign/sign-protocol-evm/src/models/Attestation.sol';
import { Schema } from '@ethsign/sign-protocol-evm/src/models/Schema.sol';
import { Ownable } from '@openzeppelin/contracts/access/Ownable.sol';

/**
 * contract to allow users that are not owners to attest metadata.
 *
 * Kind of a big hack, we want to keep using the NVM sign.global SDK so we just direct
 * all those calls to this contract address.
 *
 * Currently this is just a simple contract that requires payment of a little bit of ether.
 *
 * Future improvements could make it so that a non-owner attestation first becomes a 'proposal'
 * and that after a certain time if it's not objected to by other users it is accepted and becomes
 * a real attestation.
 * Besides ETH payment it could also be possible to stake the token that the data is about for a little
 * while. This would align the incentive of correct metadata with having a stake in the token.
 */
contract UserAttester is Ownable(msg.sender) {
  uint256 public paymentRequired = 0.001 ether;

  function setPaymentRequired(uint256 amount) external onlyOwner {
    paymentRequired = amount;
  }

  function attest(
    Attestation calldata attestation,
    uint256, // resolverFeesETH
    string calldata indexingKey,
    bytes calldata delegateSignature,
    bytes calldata extraData
  ) external payable returns (uint64 attestationId) {
    require(msg.value >= paymentRequired, 'UserAttester: insufficient payment');
    // call attest on the ISP contract ==  '0x4e4af2a21ebf62850fD99Eb6253E1eFBb56098cD'
    // (see https://docs.sign.global/for-builders/index-1/index/address-book)
    ISP isp = ISP(0x4e4af2a21ebf62850fD99Eb6253E1eFBb56098cD);
    // Copy attestation and set attester to this contract
    Attestation memory new_attestation = attestation;
    new_attestation.attester = address(this);
    attestationId = isp.attest(new_attestation, indexingKey, delegateSignature, extraData);
    return attestationId;
  }

  function withdraw() external onlyOwner {
    payable(owner()).transfer(address(this).balance);
  }

  function getSchema(uint64 schemaId) external view returns (Schema memory) {
    ISP isp = ISP(0x4e4af2a21ebf62850fD99Eb6253E1eFBb56098cD);
    return isp.getSchema(schemaId);
  }
}
