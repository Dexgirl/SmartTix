/* SPDX-License-Identifier: MIT */
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract CheckIn is AccessControl {
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");

    IERC721 public immutable ticket;
    mapping(uint256 => bool) public checkedIn;

    event CheckedIn(address indexed holder, uint256 indexed tokenId, address indexed verifier, uint256 timestamp);

    constructor(address ticketAddress) {
        ticket = IERC721(ticketAddress);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(VERIFIER_ROLE, msg.sender);
    }

    function checkIn(uint256 tokenId) external onlyRole(VERIFIER_ROLE) {
        require(!checkedIn[tokenId], "Already checked in");
        address owner = ticket.ownerOf(tokenId);
        checkedIn[tokenId] = true;
        emit CheckedIn(owner, tokenId, msg.sender, block.timestamp);
    }
}