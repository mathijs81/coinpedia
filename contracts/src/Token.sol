// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {ERC20} from "solmate/src/tokens/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract Token is ERC20("Token", "TOK", 18), Ownable(msg.sender) {
    constructor() {
        _mint(msg.sender, 10**6 * 10**18);
    }
}
