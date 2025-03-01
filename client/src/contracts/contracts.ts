// Contract addresses from our deployed contracts on Base Sepolia
export const CONTRACT_ADDRESSES = {
  XAOToken: '0xAca8714208D513A7Ab1Aca45AE1dF0708B90eb5f',    // Base Sepolia deployment
  XAOStaking: '0x075426dDE2341d56E1b37edfa975d8AcA2c87CBD',  // Base Sepolia deployment
  XAOGovernance: '0x5879b7801Be8E2837c14D6329e1f669Cc5017145', // Base Sepolia deployment
  XAOTreasury: '0x9561C133DD8580860B6b7E504bC5Aa500f0f06a7',  // Base Sepolia deployment
  EventFactory: '0x9Dd2ab99cb845802274693DBf03f209D9f4Aade8',  // Base Sepolia deployment
  ArtistFactory: '0x98b474B4faf1ee5Afa166F751d8fe6834747051B', // Base Sepolia deployment
};

export type ContractName = keyof typeof CONTRACT_ADDRESSES;
