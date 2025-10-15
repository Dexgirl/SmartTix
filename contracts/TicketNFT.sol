/* SPDX-License-Identifier: MIT */
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract TicketNFT is ERC721URIStorage, AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    uint256 public nextTokenId;
    string public baseTokenURI;

    constructor(string memory _name, string memory _symbol, string memory initialBaseURI)
        ERC721(_name, _symbol)
    {
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        baseTokenURI = initialBaseURI;
    }

    function setBaseURI(string calldata newBase) external onlyRole(ADMIN_ROLE) {
        baseTokenURI = newBase;
    }

    function mintTo(address to, string calldata tokenURISuffix)
        external
        onlyRole(MINTER_ROLE)
        returns (uint256 tokenId)
    {
        tokenId = ++nextTokenId;
        _safeMint(to, tokenId);
        if (bytes(tokenURISuffix).length > 0) {
            _setTokenURI(tokenId, tokenURISuffix);
        }
    }

    function _baseURI() internal view override returns (string memory) {
        return baseTokenURI;
    }

    // IMPORTANT: override the correct parents
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}