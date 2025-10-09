// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {Ownable} from "../lib/openzeppelin-contracts/contracts/access/Ownable.sol";
import {IERC721} from "../lib/openzeppelin-contracts/contracts/token/ERC721/IERC721.sol";
import {ReentrancyGuard} from "../lib/openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";
import {IUEAFactory, UniversalAccountId, ChainQuote, ListingPricing} from "./UniversalTypes.sol";
import {PushBricksRegistry} from "./PushBricksRegistry.sol";

// Market contract executes cross-chain aware intents by classifying caller origin via IUEAFactory
contract PushBricksMarket is Ownable, ReentrancyGuard {
    IUEAFactory public immutable factory;
    PushBricksRegistry public immutable registry;

    // Per-property per-chain counters for actions
    mapping(uint256 => mapping(bytes32 => uint256)) private buyCountByChain;   // tokenId => chainKey => count
    mapping(uint256 => mapping(bytes32 => uint256)) private rentCountByChain;  // tokenId => chainKey => count
    mapping(uint256 => mapping(bytes32 => uint256)) private leaseCountByChain; // tokenId => chainKey => count

    mapping(uint256 => uint256) private totalBuyCount;   // tokenId => total
    mapping(uint256 => uint256) private totalRentCount;  // tokenId => total
    mapping(uint256 => uint256) private totalLeaseCount; // tokenId => total

    event BuyExecuted(uint256 indexed tokenId, address indexed caller, string chainNamespace, string chainId);
    event RentExecuted(uint256 indexed tokenId, address indexed caller, string chainNamespace, string chainId);
    event LeaseExecuted(uint256 indexed tokenId, address indexed caller, string chainNamespace, string chainId);
    event ActionCountIncremented(
        uint256 indexed tokenId,
        string action, // "buy" | "rent" | "lease"
        string chainNamespace,
        string chainId,
        uint256 newCount
    );

    constructor(address initialOwner, IUEAFactory factory_, PushBricksRegistry registry_) Ownable(initialOwner) {
        factory = factory_;
        registry = registry_;
    }

    function _origin() internal view returns (UniversalAccountId memory account, bool isUEA) {
        (account, isUEA) = factory.getOriginForUEA(msg.sender);
    }

    function _chainKey(string memory ns, string memory id) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(ns, id));
    }

    function _ensureActive(uint256 tokenId) internal view {
        (address lister, , bool active) = _listingHead(tokenId);
        require(active, "Inactive listing");
        require(lister != address(0), "No listing");
    }

    // Lightweight head read to avoid copying dynamic arrays in ListingPricing
    function _listingHead(uint256 tokenId) internal view returns (address lister, ListingPricing memory pricing, bool active) {
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
        (UniversalAccountId memory origin, ) = _origin();
        bytes32 key = _chainKey(origin.chainNamespace, origin.chainId);
        uint256 newCount = ++buyCountByChain[tokenId][key];
        ++totalBuyCount[tokenId];
        emit BuyExecuted(tokenId, msg.sender, origin.chainNamespace, origin.chainId);
        emit ActionCountIncremented(tokenId, "buy", origin.chainNamespace, origin.chainId, newCount);
        _payoutToOwner(tokenId);
    }

    function rent(uint256 tokenId) external payable nonReentrant {
        _ensureActive(tokenId);
        (UniversalAccountId memory origin, ) = _origin();
        bytes32 key = _chainKey(origin.chainNamespace, origin.chainId);
        uint256 newCount = ++rentCountByChain[tokenId][key];
        ++totalRentCount[tokenId];
        emit RentExecuted(tokenId, msg.sender, origin.chainNamespace, origin.chainId);
        emit ActionCountIncremented(tokenId, "rent", origin.chainNamespace, origin.chainId, newCount);
        _payoutToOwner(tokenId);
    }

    function lease(uint256 tokenId) external payable nonReentrant {
        _ensureActive(tokenId);
        (UniversalAccountId memory origin, ) = _origin();
        bytes32 key = _chainKey(origin.chainNamespace, origin.chainId);
        uint256 newCount = ++leaseCountByChain[tokenId][key];
        ++totalLeaseCount[tokenId];
        emit LeaseExecuted(tokenId, msg.sender, origin.chainNamespace, origin.chainId);
        emit ActionCountIncremented(tokenId, "lease", origin.chainNamespace, origin.chainId, newCount);
        _payoutToOwner(tokenId);
    }

    // -------- Views --------
    function getBuyCount(uint256 tokenId, string calldata ns, string calldata id) external view returns (uint256) {
        return buyCountByChain[tokenId][_chainKey(ns, id)];
    }

    function getRentCount(uint256 tokenId, string calldata ns, string calldata id) external view returns (uint256) {
        return rentCountByChain[tokenId][_chainKey(ns, id)];
    }

    function getLeaseCount(uint256 tokenId, string calldata ns, string calldata id) external view returns (uint256) {
        return leaseCountByChain[tokenId][_chainKey(ns, id)];
    }

    function getTotalBuyCount(uint256 tokenId) external view returns (uint256) {
        return totalBuyCount[tokenId];
    }

    function getTotalRentCount(uint256 tokenId) external view returns (uint256) {
        return totalRentCount[tokenId];
    }

    function getTotalLeaseCount(uint256 tokenId) external view returns (uint256) {
        return totalLeaseCount[tokenId];
    }
}


