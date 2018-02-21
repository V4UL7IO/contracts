pragma solidity ^0.4.18;

import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";

import "./V4UL7.sol";
import "./Timestamped.sol";


/**
* @title V4UL7Sale
* @dev This is ICO Contract. 
* This class accepts the token address as argument to talk with contract.
* Once contract is deployed, funds are transferred to ICO smart contract address and then distributed with investor.
* Sending funds to this ensures that no more than desired tokens are sold.
*/
contract V4UL7Sale is Ownable, Timestamped {
	using SafeMath for uint256;

	// token
	V4UL7 public token;

	// reference addresses
	address public tokenAddress;

	// ether to usd price 
	uint256 public ethToUsd = 1000;

	// usd to wei price
	uint256 public usdToWei = 1 ether / ethToUsd;

	// timestamp when sale starts
	uint256 public startingTimestamp  = 1514764800;

	// timestamp when sale end
	uint256 public endingTimestamp  = 1514764800 + 1 years;

	// amount of token to be sold on sale
	uint256 public maxTokenForSale = 300000000 * 1E18;

	// amount of token sold so far
	uint256 public totalTokenSold;

	// amount of ether raised in sale
	uint256 public totalEtherRaised;

	// ether raised per wallet
	mapping(address => uint256) public etherRaisedPerWallet;

	// walle which will receive the ether funding
	address public wallet;

	// is contract close and ended
	bool public isClose = false;

	// is contract paused
	bool public isPaused = false;
	
	// wallet changed
	event WalletChange(address _wallet, uint256 _timestamp);

	// status changed
	event PausedChange(bool _isPaused, uint256 _timestamp);

	// token purchsae event
	event TokenPurchase(address indexed _purchaser, address indexed _beneficiary, uint256 _value, uint256 _amount, uint256 _timestamp);

	// manual transfer by admin for external purchase
	event TransferManual(address indexed _from, address indexed _to, uint256 _value, string _message);

	struct RoundStruct {
		uint256 number;
		uint256 numTokensFrom;
		uint256 numTokensTo;
		uint256 price;
	}

	RoundStruct[4] public rounds;


	/**
	* @dev Constructor that initializes token contract with token address in parameter
	*/
	function V4UL7Sale(address _token, address _wallet) public {
		// set token
		token = V4UL7(_token);

		// set wallet
		wallet = _wallet;

		// setup rounds
		rounds[0] = RoundStruct(0,            0,   25000000E18, 0.000200 ether);
		rounds[1] = RoundStruct(1,  25000000E18,   65000000E18, 0.000250 ether);
		rounds[2] = RoundStruct(2,  65000000E18,  165000000E18, 0.000350 ether);
		rounds[3] = RoundStruct(3, 165000000E18,  300000000E18, 0.000375 ether);
	}

	/**
	 * @dev Function that validates if the purchase is valid by verifying the parameters
	 *
	 * @param value Amount of ethers sent
	 * @param amount Total number of tokens user is trying to buy.
	 *
	 * @return checks various conditions and returns the bool result indicating validity.
	 */
	function isValidPurchase(uint256 value, uint256 amount) public constant returns (bool) {
		// check if timestamp is falling in the range
		bool validTimestamp = startingTimestamp <= block.timestamp && block.timestamp <= endingTimestamp;

		// check if value of the ether is valid
		bool validValue = value != 0;

		// check if the tokens available in contract for sale
		bool validAmount = maxTokenForSale.sub(totalTokenSold) >= amount && amount > 0;

		// validate if all conditions are met
		return validTimestamp && validValue && validAmount && !isClose && !isPaused;
	}

	/**
	 * @dev Function that returns the round by number
	 *
	 * @return returns the round properties
	 */
	function fetchRound(uint256 _number) public constant returns (uint256 number, uint256 numTokensFrom, uint256 numTokensTo, uint256 price) {
		RoundStruct memory round = rounds[_number];
		
		number = round.number;
		numTokensFrom = round.numTokensFrom;
		numTokensTo = round.numTokensTo;
		price = round.price;
	}

	/**
	 * @dev Function that returns the current round
	 *
	 * @return checks various conditions and returns the current round.
	 */
	function getCurrentRound() public constant returns (RoundStruct) {
		for(uint256 i = 0 ; i < rounds.length ; i ++) {
			if(rounds[i].numTokensFrom <= totalTokenSold && totalTokenSold < rounds[i].numTokensTo) {
				return rounds[i];
			}
		}
	}

	/**
	 * @dev Function that returns the current round properties
	 *
	 * @return checks various conditions and returns the current round.
	 */
	function fetchCurrentRound() public constant returns (uint256 number, uint256 numTokensFrom, uint256 numTokensTo, uint256 price) {
		RoundStruct memory round = getCurrentRound();
		
		number = round.number;
		numTokensFrom = round.numTokensFrom;
		numTokensTo = round.numTokensTo;
		price = round.price;
	}

	/**
	 * @dev Function that returns the estimate token round by sending amount
	 *
	 * @param amount Amount of tokens expected
	 *
	 * @return checks various conditions and returns the estimate token round.
	 */
	function getEstimatedRound(uint256 amount) public constant returns (RoundStruct) {
		for(uint256 i = 0 ; i < rounds.length ; i ++) {
			if(rounds[i].numTokensFrom > (totalTokenSold + amount)) {
				return rounds[i - 1];
			}
		}

		return rounds[rounds.length - 1];
	}


	/**
	 * @dev Function that returns the estimate token round by sending amount
	 *
	 * @param amount Amount of tokens expected
	 *
	 * @return checks various conditions and returns the estimate token round.
	 */
	function fetchEstimatedRound(uint256 amount) public constant returns (uint256 number, uint256 numTokensFrom, uint256 numTokensTo, uint256 price) {
		RoundStruct memory round = getEstimatedRound(amount);
		
		number = round.number;
		numTokensFrom = round.numTokensFrom;
		numTokensTo = round.numTokensTo;
		price = round.price;
	}

	/**
	 * @dev Function that returns the maximum token round by sending amount
	 *
	 * @param amount Amount of tokens expected
	 *
	 * @return checks various conditions and returns the maximum token round.
	 */
	function getMaximumRound(uint256 amount) public constant returns (RoundStruct) {
		for(uint256 i = 0 ; i < rounds.length ; i ++) {
			if((totalTokenSold + amount) <= rounds[i].numTokensTo) {
				return rounds[i];
			}
		}
	}

	/**
	 * @dev Function that returns the maximum token round by sending amount
	 *
	 * @param amount Amount of tokens expected
	 *
	 * @return checks various conditions and returns the maximum token round.
	 */
	function fetchMaximumRound(uint256 amount) public constant returns (uint256 number, uint256 numTokensFrom, uint256 numTokensTo, uint256 price) {
		RoundStruct memory round = getMaximumRound(amount);
		
		number = round.number;
		numTokensFrom = round.numTokensFrom;
		numTokensTo = round.numTokensTo;
		price = round.price;
	}

	/**
	 * @dev Function that calculates the tokens which should be given to user by iterating over rounds
	 *
	 * @param value Amount of ethers sent
	 *
	 * @return checks various conditions and returns the token amount.
	 */
	function calculate(uint256 value) public constant returns (uint256 , uint256) {
		// assume we are sending no tokens	
		uint256 totalAmount = 0;

		// interate until we have some value left for buying
		while(value > 0) {
			
			// get current round by passing queue value also 
			RoundStruct memory estimatedRound = getEstimatedRound(totalAmount);
			
			// find tokens left in current round.
			uint256 tokensLeft = estimatedRound.numTokensTo.sub(totalTokenSold.add(totalAmount));

			// derive tokens can be bought in current round with round price 
			uint256 tokensBuys = value.mul(1E18).div(estimatedRound.price);

			// check if it is last round and still value left
			if(estimatedRound.number == rounds[rounds.length - 1].number) {
				// its last round 

				// no tokens left in round and still got value 
				if(tokensLeft == 0 && value > 0) {
					return (totalAmount , value);
				}
			}

			// if tokens left > tokens buy 
			if(tokensLeft >= tokensBuys) {
				totalAmount = totalAmount.add(tokensBuys);
				value = 0;
				return (totalAmount , value);
			} else {
				uint256 tokensLeftValue = tokensLeft.mul(estimatedRound.price).div(1E18);
				totalAmount = totalAmount.add(tokensLeft);
				value = value.sub(tokensLeftValue);
			}
		}

		return (0 , value);
	}
	
	/**
	 * @dev Default fallback method which will be called when any ethers are sent to contract
	 */
	function() public payable {
		buy(msg.sender);
	}

	/**
	 * @dev Function that is called either externally or by default payable method
	 *
	 * @param beneficiary who should receive tokens
	 */
	function buy(address beneficiary) public payable {
		require(beneficiary != address(0));

		// value sent by buyer
		uint256 value = msg.value;

		// calculate token amount from the ethers sent
		var (amount, leftValue) = calculate(value);

		// if there is any left value then return 
		if(leftValue > 0) {
			value = value.sub(leftValue);
			msg.sender.transfer(leftValue);
		}

		// validate the purchase
		require(isValidPurchase(value , amount));

		// update the state to log the sold tokens and raised ethers.
		totalTokenSold = totalTokenSold.add(amount);
		totalEtherRaised = totalEtherRaised.add(value);
		etherRaisedPerWallet[msg.sender] = etherRaisedPerWallet[msg.sender].add(value);

		// transfer tokens from contract balance to beneficiary account.
		token.transfer(beneficiary, amount);
		
		// log event for token purchase
		TokenPurchase(msg.sender, beneficiary, value, amount, now);
	}

	/**
	* @dev transmit token for a specified address. 
	* This is owner only method and should be called using web3.js if someone is trying to buy token using bitcoin or any other altcoin.
	* 
	* @param _to The address to transmit to.
	* @param _value The amount to be transferred.
	* @param _message message to log after transfer.
	*/
	function transferManual(address _to, uint256 _value, string _message) onlyOwner public returns (bool) {
		require(_to != address(0));

		// transfer tokens manually from contract balance
		token.transfer(_to , _value);
		TransferManual(msg.sender, _to, _value, _message);

		// update global variables
		totalTokenSold = totalTokenSold.add(_value);
		return true;
	}

	/**
	* @dev Method called by owner to change the wallet address
	*/
	function setWallet(address _wallet) onlyOwner public {
		wallet = _wallet;
		WalletChange(_wallet , now);
	}

	/**
	* @dev Method called by owner of contract to withdraw funds
	*/
	function withdraw() onlyOwner public {
		wallet.transfer(this.balance);
	}

	/**
	* @dev close contract 
	* This will send remaining token balance to owner
	* This will distribute available funds across team members
	*/	
	function close() onlyOwner public {
		// send remaining tokens back to owner.
		uint256 tokens = token.balanceOf(this); 
		token.transfer(owner , tokens);

		// withdraw funds 
		withdraw();

		// mark the flag to indicate closure of the contract
		isClose = true;
	}

	/**
	* @dev pause contract 
	* This will mark contract as paused
	*/	
	function pause() onlyOwner public {
		// mark the flag to indicate pause of the contract
		isPaused = true;
		PausedChange(isPaused , now);
	}

	/**
	* @dev resume contract 
	* This will mark contract as resumed
	*/	
	function resume() onlyOwner public {
		// mark the flag to indicate resume of the contract
		isPaused = false;
		PausedChange(isPaused , now);
	}
}