var HDWalletProvider = require("truffle-hdwallet-provider");
var mnemonic = "tilt tell identify lock twenty notice voice clock opinion wreck uncle hurdle crush aim lab";

module.exports = {
	networks: {
		development: {
			host: "localhost",
			port: 8545,
			network_id: "*"
		},
		ropsten: {
			provider: function() {
				return new HDWalletProvider(mnemonic, "https://ropsten.infura.io/AmbDCnH7o4e8izb0VyxN" , 6)
			},
			network_id: 3,
			gas: 4612388,
			gasPrice: 100000000000
		} 
	}
};