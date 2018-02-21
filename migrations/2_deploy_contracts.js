var V4UL7 = artifacts.require("./V4UL7.sol");
var V4UL7Sale = artifacts.require("./V4UL7Sale.sol");

module.exports = function(deployer , network , accounts) {

	var owner = accounts[0];
	var wallet = accounts[1];

	deployer.deploy(V4UL7).then(function(){
		V4UL7.deployed().then(function(tokenInstance) {
			console.log('----------------------------------');
			console.log('Token Instance' , tokenInstance.address);
			console.log('----------------------------------');
			
			deployer.deploy(V4UL7Sale , tokenInstance.address , wallet).then(function(){
				V4UL7Sale.deployed().then(async function(saleInstance) {
					
					console.log('----------------------------------');
					console.log('Sale Instance' , saleInstance.address);
					console.log('----------------------------------');
					
					/* transfer tokens to sale contract */
					console.log('--------------------------------------------------------------');
					var maxTokenForSale = await saleInstance.maxTokenForSale.call();
					console.log('maxTokenForSale: ' + maxTokenForSale.toNumber());
						
					console.log('Transferring to :' +  saleInstance.address , maxTokenForSale.toNumber());	
					var transaction = await tokenInstance.transfer(saleInstance.address , maxTokenForSale);
					console.log('Transfer Txn :' +  transaction.tx);

					// check balance of address to be null
					var balanceOf = await tokenInstance.balanceOf.call(saleInstance.address);
					console.log('Balance of Sale ' + balanceOf.toNumber());
					console.log('--------------------------------------------------------------');

					// check balance of address
					var balanceOf = await tokenInstance.balanceOf.call(owner);
					console.log('Balance of Owner ' + balanceOf.toNumber());
					console.log('--------------------------------------------------------------');

				});
			});
		});	
	});
};
