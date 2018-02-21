'use strict';
var assert_throw = require('./helpers/utils').assert_throw;
var promisify = require('./helpers/utils').promisify;
var getBalance = require('./helpers/utils').getBalance;
var makeNumber = require('./helpers/utils').makeNumber;

var V4UL7 = artifacts.require('./V4UL7.sol');
var V4UL7Sale = artifacts.require('./V4UL7Sale.sol');

var tokenInstance;
var saleInstance;

var owner, wallet;

contract('V4UL7' , (accounts) => {
	owner = accounts[0];
	wallet = accounts[9];

	beforeEach(async () => {
		tokenInstance = await V4UL7.new({from: owner});
		saleInstance = await V4UL7Sale.new(tokenInstance.address , wallet , {from: owner});

		var maxTokenForSale = await saleInstance.maxTokenForSale.call();
		await tokenInstance.transfer(saleInstance.address , maxTokenForSale);

		var balance = await tokenInstance.balanceOf(saleInstance.address);
	});

	// it('should match name' , async () => {
	// 	var name = await tokenInstance.name.call();
	// 	assert.equal(name , 'V4UL7' , 'name does not match');		
	// });

	// it('should match symbol' , async () => {
	// 	var symbol = await tokenInstance.symbol.call();
	// 	assert.equal(symbol , 'V4L7' , 'symbol does not match');		
	// });

	// it('should match decimals' , async () => {
	// 	var decimals = await tokenInstance.decimals.call();
	// 	assert.equal(decimals , 18 , 'decimals does not match');		
	// });

	// it('sale should have full balance' , async () => {
	// 	var balance = await tokenInstance.balanceOf.call(saleInstance.address);
	// 	assert.equal(balance.toNumber(), 300000000 * 1E18 , 'owner balance does not match');
	// });

	// it('should match sale token address' , async () => {
	// 	var token = await saleInstance.token.call();
	// 	assert.equal(token , tokenInstance.address , 'token address does not match');		
	// });

	// it('should match sale maxTokenForSale' , async () => {
	// 	var maxTokenForSale = await saleInstance.maxTokenForSale.call();
	// 	assert.equal(maxTokenForSale , 300000000 * 1E18 , 'maxTokenForSale does not match');
	// });

	// it('should throw an error when trying to transfer more than balance', async () => {
	// 	var balance = await tokenInstance.balanceOf.call(owner);
	// 	assert_throw(tokenInstance.transfer(accounts[1], (balance + 1)));
	// });

	// it('should prevent non-owners from transfering', async () => {
	// 	var other = accounts[2];
	// 	var owner = await tokenInstance.owner.call();
	// 	assert.isTrue(owner !== other);
	// 	assert_throw(tokenInstance.transferOwnership(other, {from: other}));
	// });

	// it('should have an owner', async () => {
	// 	tokenInstance = await V4UL7.new({from: owner});
	// 	owner = await tokenInstance.owner();
	// 	assert.isTrue(owner !== 0);
	// });

	// it('should guard ownership against stuck state', async () => {
	// 	var originalOwner = await tokenInstance.owner();
	// 	assert_throw(tokenInstance.transferOwnership(null, {from: originalOwner}));
	// });

	// it('should transfer tokens from sale contract manually' , async () => {
	// 	var account = accounts[1];
	// 	var unit = 1E5;

	// 	var balanceBeforeSender = await tokenInstance.balanceOf.call(saleInstance.address);
	// 	var balanceBeforeReceiver = await tokenInstance.balanceOf.call(account);

	// 	await saleInstance.transferManual(account , unit , "some message" , {from: owner});

	// 	var balanceAfterSender = await tokenInstance.balanceOf.call(saleInstance.address);
	// 	var balanceAfterReceiver = await tokenInstance.balanceOf.call(account);		

	// 	assert.equal(balanceBeforeSender.toNumber() , balanceAfterSender.toNumber() + unit , 'sale balance should be decreased');
	// 	assert.equal(balanceBeforeReceiver.toNumber() , balanceAfterReceiver.toNumber() - unit , 'account balance should be increased');
	// });


	// it('should be able to transfer manually', async () => {
	// 	await saleInstance.transferManual(accounts[1], 1000E3, "Manual Transfer", {from: owner});

	// 	var senderBalance = await tokenInstance.balanceOf.call(saleInstance.address);
	// 	console.log('senderBalance' , senderBalance.toNumber());

	// 	var balanceReceiver = await tokenInstance.balanceOf.call(accounts[1]);
	// 	console.log('balanceReceiver' , balanceReceiver.toNumber());
	// });

	it('should be able to buy in phases', async () => {
		var account1 = owner;
		var account2 = accounts[1];

		var round0Price = (25000000 - 0) * 0.000200 * 1E18;
		var round1Price =  (65000000 -  25000000) * 0.000250 * 1E18;
		var round2Price = (165000000 -  65000000) * 0.000350 * 1E18;
		var round3Price = (300000000 - 165000000) * 0.000375 * 1E18;

		var roundPrice = round0Price + round1Price + round2Price + round3Price;

		console.log('\n\n=========================== PHASE 1 ===========================\n\n');
		console.log('Buy using 1 Ether Rate \n');

		var balanceBefore = await tokenInstance.balanceOf.call(saleInstance.address);
		console.log('balanceBefore' , balanceBefore.toNumber());

		await saleInstance.buy(account2 , {from: account1 , value: 1E18});

		var balanceAfter = await tokenInstance.balanceOf.call(saleInstance.address);
		console.log('balanceAfter' , balanceAfter.toNumber());

		var balanceReceiver = await tokenInstance.balanceOf.call(account2);
		console.log('balanceReceiver' , balanceReceiver.toNumber());

		assert.equal(balanceReceiver.toNumber() + balanceAfter.toNumber(), 300000000E18 , 'Balance Should be Equal');

		console.log('\n\n======================================================\n\n');

		console.log('\n\n=========================== PHASE 1 to PHASE 2 ===========================\n\n');
		console.log('Buy using 25000 Ether \n');

		var balanceBefore = await tokenInstance.balanceOf.call(saleInstance.address);
		console.log('balanceBefore' , balanceBefore.toNumber());

		await saleInstance.buy(account2 , {from: account1 , value: 25000E18});

		var balanceAfter = await tokenInstance.balanceOf.call(saleInstance.address);
		console.log('balanceAfter' , balanceAfter.toNumber());

		var balanceReceiver = await tokenInstance.balanceOf.call(account2);
		console.log('balanceReceiver' , balanceReceiver.toNumber());

		assert.equal(balanceReceiver.toNumber() + balanceAfter.toNumber(), 300000000E18 , 'Balance Should be Equal');

		console.log('\n\n======================================================\n\n');

		console.log('\n\n=========================== PHASE 2  to PHASE 3 ===========================\n\n');
		console.log('Buy using 10000 Ether \n');

		var balanceBefore = await tokenInstance.balanceOf.call(saleInstance.address);
		console.log('balanceBefore' , balanceBefore.toNumber());

		await saleInstance.buy(account2 , {from: account1 , value: 10000E18});

		var balanceAfter = await tokenInstance.balanceOf.call(saleInstance.address);
		console.log('balanceAfter' , balanceAfter.toNumber());

		var balanceReceiver = await tokenInstance.balanceOf.call(account2);
		console.log('balanceReceiver' , balanceReceiver.toNumber());

		assert.equal(balanceReceiver.toNumber() + balanceAfter.toNumber(), 300000000E18 , 'Balance Should be Equal');

		console.log('\n\n======================================================\n\n');

		console.log('\n\n=========================== PHASE 3  to PHASE 4 ===========================\n\n');
		console.log('Buy using 15000 Ether \n');

		var balanceBefore = await tokenInstance.balanceOf.call(saleInstance.address);
		console.log('balanceBefore' , balanceBefore.toNumber());

		await saleInstance.buy(account2 , {from: account1 , value: 15000E18});

		var balanceAfter = await tokenInstance.balanceOf.call(saleInstance.address);
		console.log('balanceAfter' , balanceAfter.toNumber());

		var balanceReceiver = await tokenInstance.balanceOf.call(account2);
		console.log('balanceReceiver' , balanceReceiver.toNumber());

		assert.equal(balanceReceiver.toNumber() + balanceAfter.toNumber(), 300000000E18 , 'Balance Should be Equal');

		console.log('\n\n======================================================\n\n');

		console.log('\n\n=========================== PHASE 4 to PHASE 5 ===========================\n\n');
		console.log('Buy using 30000 Ether \n');

		var balanceBefore = await tokenInstance.balanceOf.call(saleInstance.address);
		console.log('balanceBefore' , balanceBefore.toNumber());

		await saleInstance.buy(account2 , {from: account1 , value: 30000E18});

		var balanceAfter = await tokenInstance.balanceOf.call(saleInstance.address);
		console.log('balanceAfter' , balanceAfter.toNumber());

		var balanceReceiver = await tokenInstance.balanceOf.call(account2);
		console.log('balanceReceiver' , balanceReceiver.toNumber());

		assert.equal(balanceReceiver.toNumber() + balanceAfter.toNumber(), 300000000E18 , 'Balance Should be Equal');

		console.log('\n\n======================================================\n\n');

		console.log('\n\n=========================== PHASE 5 to PHASE 6 ===========================\n\n');
		console.log('Buy using 50000 Ether \n');

		var balanceBefore = await tokenInstance.balanceOf.call(saleInstance.address);
		console.log('balanceBefore' , balanceBefore.toNumber());

		await saleInstance.buy(account2 , {from: account1 , value: 50000E18});

		var balanceAfter = await tokenInstance.balanceOf.call(saleInstance.address);
		console.log('balanceAfter' , balanceAfter.toNumber());

		var balanceReceiver = await tokenInstance.balanceOf.call(account2);
		console.log('balanceReceiver' , balanceReceiver.toNumber());

		assert.equal(balanceReceiver.toNumber() + balanceAfter.toNumber(), 300000000E18 , 'Balance Should be Equal');

		console.log('\n\n======================================================\n\n');

		console.log('\n\n=========================== PHASE 6 to PHASE 7 ===========================\n\n');
		console.log('Buy using 90000 Ether \n');

		var balanceBefore = await tokenInstance.balanceOf.call(saleInstance.address);
		console.log('balanceBefore' , balanceBefore.toNumber());

		await saleInstance.buy(account2 , {from: account1 , value: 90000E18});

		var balanceAfter = await tokenInstance.balanceOf.call(saleInstance.address);
		console.log('balanceAfter' , balanceAfter.toNumber());

		var balanceReceiver = await tokenInstance.balanceOf.call(account2);
		console.log('balanceReceiver' , balanceReceiver.toNumber());

		assert.equal(balanceReceiver.toNumber() + balanceAfter.toNumber(), 300000000E18 , 'Balance Should be Equal');

		console.log('\n\n======================================================\n\n');

		console.log('\n\n=========================== PHASE 7 to PHASE 8 ===========================\n\n');
		console.log('Buy using 160000 Ether \n');

		var balanceBefore = await tokenInstance.balanceOf.call(saleInstance.address);
		console.log('balanceBefore' , balanceBefore.toNumber());

		await saleInstance.buy(account2 , {from: account1 , value: 160000E18});

		var balanceAfter = await tokenInstance.balanceOf.call(saleInstance.address);
		console.log('balanceAfter' , balanceAfter.toNumber());

		var balanceReceiver = await tokenInstance.balanceOf.call(account2);
		console.log('balanceReceiver' , balanceReceiver.toNumber());

		assert.equal(balanceReceiver.toNumber() + balanceAfter.toNumber(), 300000000E18 , 'Balance Should be Equal');

		console.log('\n\n======================================================\n\n');

		console.log('\n\n=========================== PHASE 8 to PHASE 9 ===========================\n\n');
		console.log('Buy using 285000 Ether \n');

		var balanceBefore = await tokenInstance.balanceOf.call(saleInstance.address);
		console.log('balanceBefore' , balanceBefore.toNumber());

		await saleInstance.buy(account2 , {from: account1 , value: 285000E18});

		var balanceAfter = await tokenInstance.balanceOf.call(saleInstance.address);
		console.log('balanceAfter' , balanceAfter.toNumber());

		var balanceReceiver = await tokenInstance.balanceOf.call(account2);
		console.log('balanceReceiver' , balanceReceiver.toNumber());

		assert.equal(balanceReceiver.toNumber() + balanceAfter.toNumber(), 300000000E18 , 'Balance Should be Equal');

		console.log('\n\n======================================================\n\n');

		console.log('\n\n=========================== PHASE 9+ ===========================\n\n');
		console.log('Buy using 4040000 Ether \n');

		var balanceBefore = await tokenInstance.balanceOf.call(saleInstance.address);
		console.log('balanceBefore' , balanceBefore.toNumber());

		await saleInstance.buy(account2 , {from: account1 , value: 4040000E18});

		var balanceAfter = await tokenInstance.balanceOf.call(saleInstance.address);
		console.log('balanceAfter' , balanceAfter.toNumber());

		var balanceReceiver = await tokenInstance.balanceOf.call(account2);
		console.log('balanceReceiver' , balanceReceiver.toNumber());

		assert.equal(balanceReceiver.toNumber() + balanceAfter.toNumber(), 300000000E18 , 'Balance Should be Equal');

		console.log('\n\n======================================================\n\n');

	});

	// it('should be able to buy all tokens', async () => {
	// 	var account1 = accounts[1];

	// 	var saleBalanceBefore = await tokenInstance.balanceOf.call(saleInstance.address);
	// 	var acctBalanceBefore = await tokenInstance.balanceOf.call(account1);
	// 	var etherBalanceBefore = await getBalance(owner);

	// 	var round0Price = (25000000 - 0) * 0.000200 * 1E18;
	// 	var round1Price =  (65000000 -  25000000) * 0.000250 * 1E18;
	// 	var round2Price = (165000000 -  65000000) * 0.000350 * 1E18;
	// 	var round3Price = (300000000 - 165000000) * 0.000375 * 1E18;

	// 	var roundPrice = round0Price + round1Price + round2Price + round3Price;

	// 	// console.log('round0Price' ,makeNumber(round0Price));
	// 	// console.log('round1Price' ,makeNumber(round1Price));
	// 	// console.log('round2Price' ,makeNumber(round2Price));
	// 	// console.log('round3Price' ,makeNumber(round3Price));
	// 	// console.log('roundPrice' ,makeNumber(roundPrice));

	// 	await saleInstance.buy(account1 , {from: account1 , value: roundPrice});

	// 	var saleBalanceAfter = await tokenInstance.balanceOf.call(saleInstance.address);
	// 	var acctBalanceAfter = await tokenInstance.balanceOf.call(account1);

	// 	assert.equal(saleBalanceBefore.toNumber() , 300000000E18 , 'saleBalanceBefore should match');
	// 	assert.equal(saleBalanceAfter.toNumber() , 0 , 'saleBalanceAfter should match');

	// 	assert.equal(acctBalanceBefore.toNumber() , 0 , 'acctBalanceBefore should match');
	// 	assert.equal(acctBalanceAfter.toNumber() , 300000000E18 , 'acctBalanceAfter should match');
	// });
});