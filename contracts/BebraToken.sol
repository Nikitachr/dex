pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract BebraToken is ERC20 {

    constructor() ERC20("Bebra Token", "BEBRA") {
        _mint(msg.sender, 1000000 * 10**18);
    }

    function mint(uint256 amount) public payable {
        uint256 amountWithDecimals = amount * 10**18;
        _mint(msg.sender, amountWithDecimals);
    }

    receive() external payable {}

    fallback() external payable {}
}
