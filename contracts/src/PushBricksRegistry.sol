// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {Ownable} from "../lib/openzeppelin-contracts/contracts/access/Ownable.sol";
import {PropertyNFT} from "./PropertyNFT.sol";
import {PropertyPricing} from "./UniversalTypes.sol";

// Registry maintains property listing metadata, accepted multi-chain quotes, and ownership token
contract PushBricksRegistry is Ownable {
    PropertyNFT public immutable propertyNft;

    struct Listing {
        address lister;            // property owner/lister
        PropertyPricing pricing;   // simple pricing configuration
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
        PropertyPricing calldata pricing
    ) external returns (uint256 tokenId) {
        tokenId = propertyNft.mint(to, uri);
        tokenIdToListing[tokenId].lister = to;
        _setPricing(tokenId, pricing);
        tokenIdToListing[tokenId].active = true;
        emit ListingCreated(tokenId, to);
    }

    function updateListingPricing(uint256 tokenId, PropertyPricing calldata pricing) external {
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

    // Get all NFTs owned by a specific wallet address
    function getUserNFTs(address user) external view returns (uint256[] memory) {
        uint256 totalSupply = propertyNft.totalSupply();
        uint256[] memory tempTokens = new uint256[](totalSupply);
        uint256 count = 0;

        // Iterate through all tokens to find ones owned by the user
        for (uint256 i = 1; i <= totalSupply; i++) {
            if (propertyNft.ownerOf(i) == user) {
                tempTokens[count] = i;
                count++;
            }
        }

        // Create result array with correct size
        uint256[] memory userTokens = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            userTokens[i] = tempTokens[i];
        }

        return userTokens;
    }

    // Get count of NFTs owned by a specific wallet address
    function getUserNFTCount(address user) external view returns (uint256) {
        uint256 totalSupply = propertyNft.totalSupply();
        uint256 count = 0;

        for (uint256 i = 1; i <= totalSupply; i++) {
            if (propertyNft.ownerOf(i) == user) {
                count++;
            }
        }

        return count;
    }

    // Get detailed NFT information for a user (tokenId, metadata URI, pricing, listing status)
    function getUserNFTDetails(address user) external view returns (
        uint256[] memory tokenIds,
        string[] memory metadataURIs,
        PropertyPricing[] memory pricings,
        bool[] memory activeStatuses
    ) {
        uint256 totalSupply = propertyNft.totalSupply();
        uint256[] memory tempTokenIds = new uint256[](totalSupply);
        string[] memory tempURIs = new string[](totalSupply);
        PropertyPricing[] memory tempPricings = new PropertyPricing[](totalSupply);
        bool[] memory tempStatuses = new bool[](totalSupply);
        uint256 count = 0;

        for (uint256 i = 1; i <= totalSupply; i++) {
            if (propertyNft.ownerOf(i) == user) {
                tempTokenIds[count] = i;
                tempURIs[count] = propertyNft.tokenURI(i);
                tempPricings[count] = tokenIdToListing[i].pricing;
                tempStatuses[count] = tokenIdToListing[i].active;
                count++;
            }
        }

        // Create result arrays with correct size
        tokenIds = new uint256[](count);
        metadataURIs = new string[](count);
        pricings = new PropertyPricing[](count);
        activeStatuses = new bool[](count);

        for (uint256 i = 0; i < count; i++) {
            tokenIds[i] = tempTokenIds[i];
            metadataURIs[i] = tempURIs[i];
            pricings[i] = tempPricings[i];
            activeStatuses[i] = tempStatuses[i];
        }
    }

    // Internal helper sets simple pricing values
    function _setPricing(uint256 tokenId, PropertyPricing calldata pricing) internal {
        tokenIdToListing[tokenId].pricing.priceInPC = pricing.priceInPC;
        tokenIdToListing[tokenId].pricing.priceInStablecoin = pricing.priceInStablecoin;
    }
}


