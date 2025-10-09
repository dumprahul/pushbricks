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

// Generic quote for a value on a specific origin chain/token
// Token is represented as an opaque string to support both EVM and non‑EVM chains
struct ChainQuote {
    string chainNamespace; // e.g. "eip155", "solana"
    string chainId;        // chain identifier string
    string tokenId;        // token identifier (ERC20 address hex for EVM or ticker/symbol/mint for others)
    uint256 amount;        // amount in token smallest unit
}

// Group of pricing quotes for a listing per action mode
struct ListingPricing {
    ChainQuote[] buyQuotes;   // acceptable quotes to buy the property
    ChainQuote[] rentQuotes;  // acceptable quotes per rent period unit
    ChainQuote[] leaseQuotes; // acceptable quotes per lease term unit
}


