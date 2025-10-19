// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {Ownable} from "../lib/openzeppelin-contracts/contracts/access/Ownable.sol";
import {IUEAFactory, UniversalAccountId} from "./UniversalTypes.sol";
import {PushBricksToken} from "./PushBricksToken.sol";
import {PropertyNFT} from "./PropertyNFT.sol";

// Property Review System with Token Rewards
contract PropertyReviewSystem is Ownable {
    PushBricksToken public immutable pbToken;
    PropertyNFT public immutable propertyNFT;

    struct Review {
        address reviewer;
        uint256 tokenId;
        uint256 rating; // 1-5 stars
        string comment;
        uint256 timestamp;
        string chainNamespace;
        string chainId;
    }

    // tokenId => array of reviews
    mapping(uint256 => Review[]) private propertyReviews;
    
    // user => tokenId => has reviewed (to prevent multiple reviews per user per property)
    mapping(address => mapping(uint256 => bool)) private userHasReviewed;
    
    // tokenId => average rating
    mapping(uint256 => uint256) private averageRatings;
    
    // tokenId => total review count
    mapping(uint256 => uint256) private reviewCounts;

    event ReviewSubmitted(
        uint256 indexed tokenId,
        address indexed reviewer,
        uint256 rating,
        string comment,
        string chainNamespace,
        string chainId,
        uint256 timestamp
    );

    event TokensRewarded(
        address indexed reviewer,
        uint256 tokenAmount,
        uint256 indexed tokenId
    );

    constructor(address initialOwner, PushBricksToken _pbToken, PropertyNFT _propertyNFT) Ownable(initialOwner) {
        pbToken = _pbToken;
        propertyNFT = _propertyNFT;
    }

    // Get user's origin chain information
    function _origin() internal view returns (UniversalAccountId memory account, bool isUEA) {
        (account, isUEA) = IUEAFactory(0x00000000000000000000000000000000000000eA).getOriginForUEA(msg.sender);
    }

    // Validate chain (same as in PushBricksMarket)
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

    // Submit a review for a property
    function submitReview(
        uint256 tokenId,
        uint256 rating,
        string calldata comment
    ) external {
        // Validate token exists
        require(propertyNFT.ownerOf(tokenId) != address(0), "Property does not exist");
        
        // Validate rating (1-5 stars)
        require(rating >= 1 && rating <= 5, "Rating must be between 1 and 5");
        
        // Check if user has already reviewed this property
        require(!userHasReviewed[msg.sender][tokenId], "You have already reviewed this property");
        
        // Get user's origin chain
        (UniversalAccountId memory origin, bool isUEA) = _origin();
        _validateChain(origin, isUEA);
        
        // Create review
        Review memory newReview = Review({
            reviewer: msg.sender,
            tokenId: tokenId,
            rating: rating,
            comment: comment,
            timestamp: block.timestamp,
            chainNamespace: origin.chainNamespace,
            chainId: origin.chainId
        });
        
        // Store review
        propertyReviews[tokenId].push(newReview);
        userHasReviewed[msg.sender][tokenId] = true;
        
        // Update statistics
        uint256 totalReviews = reviewCounts[tokenId] + 1;
        uint256 currentAverage = averageRatings[tokenId];
        averageRatings[tokenId] = ((currentAverage * reviewCounts[tokenId]) + rating) / totalReviews;
        reviewCounts[tokenId] = totalReviews;
        
        // Reward tokens for review
        pbToken.rewardForReview(msg.sender);
        
        // Emit events
        emit ReviewSubmitted(
            tokenId,
            msg.sender,
            rating,
            comment,
            origin.chainNamespace,
            origin.chainId,
            block.timestamp
        );
        
        emit TokensRewarded(msg.sender, 5 * 10**18, tokenId);
    }

    // Get all reviews for a property
    function getPropertyReviews(uint256 tokenId) external view returns (Review[] memory) {
        return propertyReviews[tokenId];
    }

    // Get average rating for a property
    function getAverageRating(uint256 tokenId) external view returns (uint256) {
        return averageRatings[tokenId];
    }

    // Get total review count for a property
    function getReviewCount(uint256 tokenId) external view returns (uint256) {
        return reviewCounts[tokenId];
    }

    // Check if user has reviewed a property
    function hasUserReviewed(address user, uint256 tokenId) external view returns (bool) {
        return userHasReviewed[user][tokenId];
    }

    // Get user's total review count across all properties
    function getUserTotalReviews(address user) external view returns (uint256) {
        uint256 totalSupply = propertyNFT.totalSupply();
        uint256 count = 0;
        
        for (uint256 i = 1; i <= totalSupply; i++) {
            if (userHasReviewed[user][i]) {
                count++;
            }
        }
        
        return count;
    }

    // Get user's reviews across all properties
    function getUserReviews(address user) external view returns (
        uint256[] memory tokenIds,
        uint256[] memory ratings,
        string[] memory comments,
        uint256[] memory timestamps
    ) {
        uint256 totalSupply = propertyNFT.totalSupply();
        uint256[] memory tempTokenIds = new uint256[](totalSupply);
        uint256[] memory tempRatings = new uint256[](totalSupply);
        string[] memory tempComments = new string[](totalSupply);
        uint256[] memory tempTimestamps = new uint256[](totalSupply);
        uint256 count = 0;
        
        for (uint256 i = 1; i <= totalSupply; i++) {
            if (userHasReviewed[user][i]) {
                // Find the user's review for this property
                Review[] memory reviews = propertyReviews[i];
                for (uint256 j = 0; j < reviews.length; j++) {
                    if (reviews[j].reviewer == user) {
                        tempTokenIds[count] = i;
                        tempRatings[count] = reviews[j].rating;
                        tempComments[count] = reviews[j].comment;
                        tempTimestamps[count] = reviews[j].timestamp;
                        count++;
                        break;
                    }
                }
            }
        }
        
        // Create result arrays with correct size
        tokenIds = new uint256[](count);
        ratings = new uint256[](count);
        comments = new string[](count);
        timestamps = new uint256[](count);
        
        for (uint256 i = 0; i < count; i++) {
            tokenIds[i] = tempTokenIds[i];
            ratings[i] = tempRatings[i];
            comments[i] = tempComments[i];
            timestamps[i] = tempTimestamps[i];
        }
    }
}
