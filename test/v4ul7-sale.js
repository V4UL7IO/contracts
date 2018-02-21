'use strict';
var assert_throw = require('./helpers/utils').assert_throw;
var promisify = require('./helpers/utils').promisify;
var getBalance = require('./helpers/utils').getBalance;

var V4UL7 = artifacts.require('./V4UL7.sol');
var V4UL7Sale = artifacts.require('./V4UL7Sale.sol');
  		
var tokenInstance;
var saleInstance;

var owner, wallet;

const getRound = (result) => {

	var round = {};
	round.number = result[0].toNumber();
	round.numTokensFrom = result[1].toNumber();
	round.numTokensTo = result[2].toNumber();
	round.price = result[3].toNumber();

	return round;
};	

contract('V4UL7 Sale' , (accounts) => {
	owner = accounts[0];
	wallet = accounts[9];

	beforeEach(async () => {
		tokenInstance = await V4UL7.new({from: owner});
		saleInstance = await V4UL7Sale.new(tokenInstance.address , wallet , {from: owner});

		var maxTokenForSale = await saleInstance.maxTokenForSale.call();
		await tokenInstance.transfer(saleInstance.address , maxTokenForSale);

		var balance = await tokenInstance.balanceOf(saleInstance.address);
	});

	it('should match name' , async () => {
		var name = await tokenInstance.name.call();
		assert.equal(name , 'V4UL7' , 'name does not match');		
	});

	it('should match symbol' , async () => {
		var symbol = await tokenInstance.symbol.call();
		assert.equal(symbol , 'V4L7' , 'symbol does not match');		
	});

	it('should match decimals' , async () => {
		var decimals = await tokenInstance.decimals.call();
		assert.equal(decimals , 18 , 'decimals does not match');		
	});

	it('owner should have full balance' , async () => {
		var balance = await tokenInstance.balanceOf.call(owner);
		var maxTokenForSale = await saleInstance.maxTokenForSale.call();

		assert.equal(balance.toNumber() + maxTokenForSale.toNumber() , 1000000000 * 1E18 , 'owner balance does not match');		
	});

	it('should match sale token address' , async () => {
		var token = await saleInstance.token.call();
		assert.equal(token , tokenInstance.address , 'token address does not match');		
	});

	it('should match sale maxTokenForSale' , async () => {
		var maxTokenForSale = await saleInstance.maxTokenForSale.call();
		assert.equal(maxTokenForSale , 300000000 * 1E18 , 'maxTokenForSale does not match');
	});

	it('should match wallet address' , async () => {
		var wallet_ = await saleInstance.wallet.call();
		assert.equal(wallet_ , wallet , 'wallet address does not match');		
	});

	it('should transfer tokens from owner and return back' , async () => {
		var account1 = owner;
		var account2 = accounts[1];
		var unit = 1E5;

		var balanceBeforeSender = await tokenInstance.balanceOf.call(account1);
		var balanceBeforeReceiver = await tokenInstance.balanceOf.call(account2);

		await tokenInstance.transfer(account2 , unit , {from: account1});

		var balanceAfterSender = await tokenInstance.balanceOf.call(account1);
		var balanceAfterReceiver = await tokenInstance.balanceOf.call(account2);		

		assert.equal(balanceBeforeSender.toNumber() , balanceAfterSender.toNumber() + unit , 'sender balance should be decreased');
		assert.equal(balanceBeforeReceiver.toNumber() , balanceAfterReceiver.toNumber() - unit , 'receiver balance should be increased');

		var account1 = accounts[1];
		var account2 = owner;

		var balanceBeforeSender = await tokenInstance.balanceOf.call(account1);
		var balanceBeforeReceiver = await tokenInstance.balanceOf.call(account2);

		await tokenInstance.transfer(account2 , unit , {from: account1});

		var balanceAfterSender = await tokenInstance.balanceOf.call(account1);
		var balanceAfterReceiver = await tokenInstance.balanceOf.call(account2);		

		assert.equal(balanceBeforeSender.toNumber() , balanceAfterSender.toNumber() + unit , 'sender balance should be decreased');
		assert.equal(balanceBeforeReceiver.toNumber() , balanceAfterReceiver.toNumber() - unit , 'receiver balance should be increased');
	});

	it('should transfer tokens from sale contract manually' , async () => {
		var account = accounts[1];
		var unit = 1E5;

		var balanceBeforeSender = await tokenInstance.balanceOf.call(saleInstance.address);
		var balanceBeforeReceiver = await tokenInstance.balanceOf.call(account);

		await saleInstance.transferManual(account , unit , "some message" , {from: owner});

		var balanceAfterSender = await tokenInstance.balanceOf.call(saleInstance.address);
		var balanceAfterReceiver = await tokenInstance.balanceOf.call(account);		

		assert.equal(balanceBeforeSender.toNumber() , balanceAfterSender.toNumber() + unit , 'sale balance should be decreased');
		assert.equal(balanceBeforeReceiver.toNumber() , balanceAfterReceiver.toNumber() - unit , 'account balance should be increased');
	});

	it('should return rounds' , async () => {
		var account = accounts[2];

		var result = await saleInstance.fetchRound.call(0);
		var round = getRound(result);

		assert.equal(round.number, 0 , 'round should match');		
		assert.equal(round.numTokensFrom, 0 , 'numTokensFrom should match');		
		assert.equal(round.numTokensTo, 25000000E18 , 'numTokensTo should match');		
		assert.equal(round.price, 0.000200 * 1E18 , 'price should match');

		
		var result = await saleInstance.fetchRound.call(1);
		var round = getRound(result);

		assert.equal(round.number, 1 , 'round should match');		
		assert.equal(round.numTokensFrom, 25000000E18 , 'numTokensFrom should match');		
		assert.equal(round.numTokensTo, 65000000E18 , 'numTokensTo should match');		
		assert.equal(round.price, 0.000250 * 1E18 , 'price should match');

		
		var result = await saleInstance.fetchRound.call(2);
		var round = getRound(result);

		assert.equal(round.number, 2 , 'round should match');		
		assert.equal(round.numTokensFrom, 65000000E18 , 'numTokensFrom should match');		
		assert.equal(round.numTokensTo, 165000000E18 , 'numTokensTo should match');		
		assert.equal(round.price, 0.000350 * 1E18 , 'price should match');

		
		var result = await saleInstance.fetchRound.call(3);
		var round = getRound(result);

		assert.equal(round.number, 3 , 'round should match');		
		assert.equal(round.numTokensFrom, 165000000E18 , 'numTokensFrom should match');		
		assert.equal(round.numTokensTo, 300000000E18 , 'numTokensTo should match');		
		assert.equal(round.price, 0.000375 * 1E18 , 'price should match');
	});	

	it('should return current round' , async () => {
		var account = accounts[2];

		var result = await saleInstance.fetchCurrentRound.call();
		var round = getRound(result);
		
		assert.equal(round.number, 0 , 'round should match');		
		assert.equal(round.numTokensFrom, 0 , 'numTokensFrom should match');		
		assert.equal(round.numTokensTo, 25000000E18 , 'numTokensTo should match');		
		assert.equal(round.price, 0.000200 * 1E18 , 'price should match');		
	});


	it('should buy tokens from sale contract' , async () => {
		var account = accounts[2];

		var balanceBefore = await tokenInstance.balanceOf.call(account);
		await saleInstance.buy(account , {from: account, value: 1E5});
		var balanceAfter = await tokenInstance.balanceOf.call(account);
		
		assert.equal(balanceBefore.toNumber() + 5000E5, balanceAfter.toNumber() , 'balance should be increased');
	});	

	it('should buy tokens from fallback address' , async () => {
		var account = accounts[2];

		var balanceBefore = await tokenInstance.balanceOf.call(account);
		await saleInstance.sendTransaction({from: account , value: 1E5});
		var balanceAfter = await tokenInstance.balanceOf.call(account);
		
		assert.equal(balanceBefore.toNumber() + 5000E5, balanceAfter.toNumber() , 'balance should be increased');		
	});	

	it('should transfer token from owner to account address' , async () => {
		var account = accounts[6];
		
		var balanceBefore = await tokenInstance.balanceOf.call(account);
		await tokenInstance.transfer(account , 1000E18 , {from: owner});
		var balanceAfter = await tokenInstance.balanceOf.call(account);

		assert.equal(balanceBefore.toNumber() + 1000E18, balanceAfter.toNumber() , 'balance should be increased for account address');		
	});	

	it('should transfer token from owner to contract address' , async () => {
		var contract = saleInstance.address;
		
		var balanceBefore = await tokenInstance.balanceOf.call(contract);
		await tokenInstance.transfer(contract , 1000E18 , {from: owner});
		var balanceAfter = await tokenInstance.balanceOf.call(contract);

		assert.equal(balanceBefore.toNumber() + 1000E18, balanceAfter.toNumber() , 'balance should be increased for contract address');		
	});	

	it('should refund left token upon closure' , async () => {
		var account = accounts[2];
		await saleInstance.sendTransaction({from: account , value: 15E18});

		var saleBalanceBefore = await tokenInstance.balanceOf(saleInstance.address);
		var ownerBalanceBefore = await tokenInstance.balanceOf(owner);

		await saleInstance.close();		

		var saleBalanceAfter = await tokenInstance.balanceOf(saleInstance.address);
		var ownerBalanceAfter = await tokenInstance.balanceOf(owner);

		assert.equal(saleBalanceAfter.toNumber(), 0, 'sale balance should be zero');		
		assert.equal(ownerBalanceAfter.toNumber(), ownerBalanceBefore.toNumber() + saleBalanceBefore.toNumber(), 'owner balance should be increased');		
	});	

	it('should close sale contract' , async () => {
		var saleBalanceBefore = await tokenInstance.balanceOf(saleInstance.address);
		var ownerBalanceBefore = await tokenInstance.balanceOf(owner);

		await saleInstance.close();		

		var saleBalanceAfter = await tokenInstance.balanceOf(saleInstance.address);
		var ownerBalanceAfter = await tokenInstance.balanceOf(owner);

		assert.equal(saleBalanceAfter.toNumber(), 0, 'sale balance should be zero');		
		assert.equal(ownerBalanceAfter.toNumber(), ownerBalanceBefore.toNumber() + saleBalanceBefore.toNumber(), 'owner balance should be increased');		
	});	

	it('should allow owner to change wallet address' , async () => {
		var walletBefore = await saleInstance.wallet.call();
		
		await saleInstance.setWallet(owner , {from: owner});
		var walletAfter = await saleInstance.wallet.call();		
		assert.equal(walletAfter, owner, 'wallet address should be changed');				

		await saleInstance.setWallet(walletBefore , {from: owner});
		var walletRestore = await saleInstance.wallet.call();		
		assert.equal(walletRestore, walletBefore, 'wallet address should be restored');				
	});

	it('should allow owner to withdraw' , async () => {
		await saleInstance.sendTransaction({from: owner , value: 1E18});

		var walletBalanceBefore = await getBalance(wallet);
		var saleBalanceBefore = await getBalance(saleInstance.address);
		
		assert.equal(saleBalanceBefore.toNumber(), 1E18, 'sale balance should be there');

		await saleInstance.withdraw({from: owner});

		var walletBalanceAfter = await getBalance(wallet);
		var saleBalanceAfter = await getBalance(saleInstance.address);

		assert.equal(saleBalanceAfter.toNumber(), 0, 'sale balance should be zero');
		assert.equal(walletBalanceAfter.toNumber(), walletBalanceBefore.toNumber() + saleBalanceBefore.toNumber(), 'sale wallet balance should be increased');
	});
});