// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {Ownable} from "../lib/openzeppelin-contracts/contracts/access/Ownable.sol";
import {IERC721} from "../lib/openzeppelin-contracts/contracts/token/ERC721/IERC721.sol";
import {ReentrancyGuard} from "../lib/openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";
import {IUEAFactory, UniversalAccountId, PropertyPricing} from "./UniversalTypes.sol";
import {PushBricksRegistry} from "./PushBricksRegistry.sol";

// Market contract executes cross-chain aware intents by classifying caller origin via IUEAFactory
contract PushBricksMarket is Ownable, ReentrancyGuard {
    PushBricksRegistry public immutable registry;

    // Per-property per-chain counters for buy actions
    mapping(uint256 => mapping(bytes32 => uint256)) private buyCountByChain;   // tokenId => chainKey => count
    mapping(uint256 => uint256) private totalBuyCount;   // tokenId => total

    event BuyExecuted(uint256 indexed tokenId, address indexed caller, string chainNamespace, string chainId);
    event BuyCountIncremented(
        uint256 indexed tokenId,
        string chainNamespace,
        string chainId,
        uint256 newCount
    );

    constructor(address initialOwner, PushBricksRegistry registry_) Ownable(initialOwner) {
        registry = registry_;
    }

    function _origin() internal view returns (UniversalAccountId memory account, bool isUEA) {
        (account, isUEA) = IUEAFactory(0x00000000000000000000000000000000000000eA).getOriginForUEA(msg.sender);
    }

    function _chainKey(string memory ns, string memory id) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(ns, id));
    }

    function _validateChain(UniversalAccountId memory origin, bool isUEA) internal pure {
        if (!isUEA) {
            // If it's a native Push Chain EOA (isUEA = false) - valid
            return;
        } else {
            bytes32 chainHash = keccak256(abi.encodePacked(origin.chainNamespace, origin.chainId));

            if (chainHash == keccak256(abi.encodePacked("solana","EtWTRABZaYq6iMfeYKouRu166VU2xqa1"))) {
                // Valid Solana chain
                return;
            } else if (chainHash == keccak256(abi.encodePacked("eip155","11155111"))) {
                // Valid Ethereum Sepolia chain
                return;
            } else {
                revert("Invalid chain");
            }
        }
    }

    function _ensureActive(uint256 tokenId) internal view {
        (address lister, , bool active) = _listingHead(tokenId);
        require(active, "Inactive listing");
        require(lister != address(0), "No listing");
    }

    // Lightweight head read for simple pricing
    function _listingHead(uint256 tokenId) internal view returns (address lister, PropertyPricing memory pricing, bool active) {
        PushBricksRegistry.Listing memory l = registry.getListing(tokenId);
        return (l.lister, l.pricing, l.active);
    }

    function _payoutToOwner(uint256 tokenId) internal {
        address owner = IERC721(address(registry.propertyNft())).ownerOf(tokenId);
        if (msg.value == 0) return; // no value sent; nothing to forward
        (bool ok, ) = payable(owner).call{value: msg.value}("");
        require(ok, "Payout failed");
    }

    function buy(uint256 tokenId) external payable nonReentrant {
        _ensureActive(tokenId);
        (UniversalAccountId memory origin, bool isUEA) = _origin();
        _validateChain(origin, isUEA);
        
        // Get current owner before transfer
        address currentOwner = IERC721(address(registry.propertyNft())).ownerOf(tokenId);
        
        // Send payment to current owner
        _payoutToOwner(tokenId);
        
        // Transfer NFT ownership from current owner to buyer
        registry.propertyNft().transferForSale(currentOwner, msg.sender, tokenId);
        
        // Update analytics
        bytes32 key = _chainKey(origin.chainNamespace, origin.chainId);
        uint256 newCount = ++buyCountByChain[tokenId][key];
        ++totalBuyCount[tokenId];
        
        // Emit events
        emit BuyExecuted(tokenId, msg.sender, origin.chainNamespace, origin.chainId);
        emit BuyCountIncremented(tokenId, origin.chainNamespace, origin.chainId, newCount);
    }


    // -------- Views --------
    function getBuyCount(uint256 tokenId, string calldata ns, string calldata id) external view returns (uint256) {
        return buyCountByChain[tokenId][_chainKey(ns, id)];
    }

    function getTotalBuyCount(uint256 tokenId) external view returns (uint256) {
        return totalBuyCount[tokenId];
    }
}


