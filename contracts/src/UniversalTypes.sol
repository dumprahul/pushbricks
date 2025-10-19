// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

// Core universal account origin identity used on Push Chain
struct UniversalAccountId {
    string chainNamespace; // e.g. "eip155", "solana"
    string chainId; // e.g. "11155111" for Sepolia, or a Solana genesis hash
    bytes owner; // raw owner identifier for the origin chain
}

// Interface for Push Chain Universal External Account factory resolver
interface IUEAFactory {
    function getOriginForUEA(address addr) external view returns (UniversalAccountId memory account, bool isUEA);
}

// Simple pricing structure for property listings
struct PropertyPricing {
    uint256 priceInPC;        // Price in Push Chain native token (wei)
    uint256 priceInStablecoin; // Price in stablecoin (smallest unit)
}


