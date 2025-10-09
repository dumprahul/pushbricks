// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {Ownable} from "../lib/openzeppelin-contracts/contracts/access/Ownable.sol";
import {PropertyNFT} from "./PropertyNFT.sol";
import {UniversalAccountId, ChainQuote, ListingPricing} from "./UniversalTypes.sol";

// Registry maintains property listing metadata, accepted multi-chain quotes, and ownership token
contract PushBricksRegistry is Ownable {
    PropertyNFT public immutable propertyNft;

    struct Listing {
        address lister;            // property owner/lister
        ListingPricing pricing;    // multi-chain pricing configuration
        bool active;               // listing active flag
    }

    // tokenId => listing
    mapping(uint256 => Listing) private tokenIdToListing;

    event ListingCreated(uint256 indexed tokenId, address indexed lister);
    event ListingUpdated(uint256 indexed tokenId);
    event ListingStatusChanged(uint256 indexed tokenId, bool active);

    constructor(address initialOwner, PropertyNFT nft) Ownable(initialOwner) {
        propertyNft = nft;
    }

    function createListing(
        address to,
        string calldata uri,
        ListingPricing calldata pricing
    ) external returns (uint256 tokenId) {
        tokenId = propertyNft.mint(to, uri);
        tokenIdToListing[tokenId].lister = to;
        _setPricing(tokenId, pricing);
        tokenIdToListing[tokenId].active = true;
        emit ListingCreated(tokenId, to);
    }

    function updateListingPricing(uint256 tokenId, ListingPricing calldata pricing) external {
        require(msg.sender == tokenIdToListing[tokenId].lister, "Not lister");
        _setPricing(tokenId, pricing);
        emit ListingUpdated(tokenId);
    }

    function setListingActive(uint256 tokenId, bool active) external {
        require(msg.sender == tokenIdToListing[tokenId].lister, "Not lister");
        tokenIdToListing[tokenId].active = active;
        emit ListingStatusChanged(tokenId, active);
    }

    function getListing(uint256 tokenId) external view returns (Listing memory) {
        return tokenIdToListing[tokenId];
    }

    // Internal helper copies dynamic arrays to storage
    function _setPricing(uint256 tokenId, ListingPricing calldata pricing) internal {
        delete tokenIdToListing[tokenId].pricing.buyQuotes;
        delete tokenIdToListing[tokenId].pricing.rentQuotes;
        delete tokenIdToListing[tokenId].pricing.leaseQuotes;

        for (uint256 i = 0; i < pricing.buyQuotes.length; i++) {
            tokenIdToListing[tokenId].pricing.buyQuotes.push(pricing.buyQuotes[i]);
        }
        for (uint256 i = 0; i < pricing.rentQuotes.length; i++) {
            tokenIdToListing[tokenId].pricing.rentQuotes.push(pricing.rentQuotes[i]);
        }
        for (uint256 i = 0; i < pricing.leaseQuotes.length; i++) {
            tokenIdToListing[tokenId].pricing.leaseQuotes.push(pricing.leaseQuotes[i]);
        }
    }
}


