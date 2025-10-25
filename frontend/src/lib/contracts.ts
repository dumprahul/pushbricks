import PushBricksRegistryABI from '../../abi/PushBricksRegistry.sol/PushBricksRegistry.json';

export const CONTRACT_ADDRESSES = {
  PUSH_BRICKS_REGISTRY: '0x64D22254C797Fdf76486CCdb1163C956A8977aF0',
  PROPERTY_NFT: '0x3125BB25506fbbb4466796533d908Eab1e132532', 
} as const;

// Contract ABIs
export const CONTRACT_ABIS = {
  PUSH_BRICKS_REGISTRY: PushBricksRegistryABI.abi,
} as const;

// Contract configuration
export const CONTRACT_CONFIG = {
  PUSH_BRICKS_REGISTRY: {
    address: CONTRACT_ADDRESSES.PUSH_BRICKS_REGISTRY,
    abi: CONTRACT_ABIS.PUSH_BRICKS_REGISTRY,
  },
} as const;

// Types for contract interactions
export interface PropertyPricing {
  priceInPC: bigint;
  priceInStablecoin: bigint;
}

export interface Listing {
  lister: string;
  pricing: PropertyPricing;
  active: boolean;
}

export interface CreateListingParams {
  to: string;
  uri: string;
  pricing: PropertyPricing;
}

export interface UpdatePricingParams {
  tokenId: bigint;
  pricing: PropertyPricing;
}

export interface SetListingActiveParams {
  tokenId: bigint;
  active: boolean;
}
