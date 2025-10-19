// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {ERC20} from "../lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "../lib/openzeppelin-contracts/contracts/access/Ownable.sol";

// PushBricks ERC20 Token
contract PushBricksToken is ERC20, Ownable {
    uint256 public constant REWARD_PER_REVIEW = 5 * 10**18; // 5 PB tokens per review
    uint256 public constant INITIAL_SUPPLY = 1000000 * 10**18; // 1 million PB tokens
    
    // Track total reviews to prevent spam
    mapping(address => uint256) public userReviewCount;
    
    event TokensRewarded(address indexed user, uint256 amount, string reason);

    constructor(address initialOwner) ERC20("PushBricks", "PB") Ownable(initialOwner) {
        _mint(initialOwner, INITIAL_SUPPLY);
    }

    // Mint new tokens (only owner can call)
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    // Reward tokens for reviews (only owner can call)
    function rewardForReview(address reviewer) external onlyOwner {
        userReviewCount[reviewer]++;
        _mint(reviewer, REWARD_PER_REVIEW);
        emit TokensRewarded(reviewer, REWARD_PER_REVIEW, "Property Review");
    }

    // Get user's review count
    function getUserReviewCount(address user) external view returns (uint256) {
        return userReviewCount[user];
    }

    // Burn tokens (only owner can call)
    function burn(uint256 amount) external onlyOwner {
        _burn(msg.sender, amount);
    }
}
