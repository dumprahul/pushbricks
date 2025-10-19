// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {ERC721} from "../lib/openzeppelin-contracts/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "../lib/openzeppelin-contracts/contracts/access/Ownable.sol";

// Minimal metadata storage: off-chain pointer (IPFS/Arweave) with hash integrity
contract PropertyNFT is ERC721, Ownable {
    // tokenId => metadata URI
    mapping(uint256 => string) private tokenIdToURI;

    // Next token id counter
    uint256 private nextTokenId;

    // Total supply counter
    uint256 public totalSupply;

    event PropertyMinted(uint256 indexed tokenId, address indexed to, string uri);
    event PropertyURIUpdated(uint256 indexed tokenId, string uri);

    constructor(address initialOwner) ERC721("PushBricks", "PB") Ownable(initialOwner) {}

    function mint(address to, string calldata uri) external onlyOwner returns (uint256 tokenId) {
        tokenId = ++nextTokenId;
        _safeMint(to, tokenId);
        tokenIdToURI[tokenId] = uri;
        totalSupply++;
        emit PropertyMinted(tokenId, to, uri);
    }

    function setTokenURI(uint256 tokenId, string calldata uri) external onlyOwner {
        require(_ownerOf(tokenId) != address(0), "Nonexistent token");
        tokenIdToURI[tokenId] = uri;
        emit PropertyURIUpdated(tokenId, uri);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        return tokenIdToURI[tokenId];
    }
}


