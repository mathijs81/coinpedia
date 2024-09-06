export const hookAddress = '0x86ad5532b8cb1020628bae30e208331fc4c819b2';
export const schemaId = '0x1a5';
export const fullSchemaId = 'onchain_evm_84532_0x1a5';

// Kind of a giant hack, but it works:
// we deployed a very light copy of the sign protocol ISP that just makes sure
// to collect 0.01 ETH and forward the attestation and then the hook lets it through
// because we whitelisted the UserAttester contract.
export const userAttesterContract =
  '0x3D764af37c638B8f696C5852Db41b167b98c2556';
