pragma solidity ^0.4.18;

import "zeppelin-solidity/contracts/token/ERC20/StandardToken.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";

/**
 * @title V4UL7
 * @dev ERC20 Token, where all tokens are pre-assigned to the creator.
 * Note they can later distribute these tokens as they wish using `transfer`
 */
contract V4UL7 is Ownable, StandardToken {

	string public constant name = "V4UL7";
	string public constant symbol = "V4L7";
	uint8 public constant decimals = 18;

	uint256 public constant INITIAL_SUPPLY = 1000000000 * (10 ** uint256(decimals));

	/**
	 * @dev Constructor that gives msg.sender all of existing tokens.
	 */
	function V4UL7() public {
		totalSupply_ = INITIAL_SUPPLY;
		balances[msg.sender] = INITIAL_SUPPLY;
		Transfer(0x0, msg.sender, INITIAL_SUPPLY);
	}

	/**
	* @dev if ether is sent to this address, send it back.
	*/
	function () public {
		revert();
	}
}

