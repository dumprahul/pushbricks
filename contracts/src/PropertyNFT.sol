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

    // Allow registry to mint properties for property owners
    function mintForListing(address to, string calldata uri) external returns (uint256 tokenId) {
        // Only allow the registry contract to call this function
        // We'll need to set the registry address after deployment
        require(msg.sender == owner() || isRegistry[msg.sender], "Only registry can mint for listings");
        tokenId = ++nextTokenId;
        _safeMint(to, tokenId);
        tokenIdToURI[tokenId] = uri;
        totalSupply++;
        emit PropertyMinted(tokenId, to, uri);
    }

    // Mapping to track authorized registry contracts
    mapping(address => bool) public isRegistry;

    // Owner can authorize registry contracts
    function setRegistry(address registry, bool authorized) external onlyOwner {
        isRegistry[registry] = authorized;
    }

    // Owner can authorize market contracts
    mapping(address => bool) public isMarket;

    // Owner can authorize market contracts to transfer NFTs
    function setMarket(address market, bool authorized) external onlyOwner {
        isMarket[market] = authorized;
    }

    // Allow market to transfer NFTs for property sales
    function transferForSale(address from, address to, uint256 tokenId) external {
        require(isMarket[msg.sender], "Only authorized market can transfer for sales");
        _safeTransfer(from, to, tokenId, "");
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


