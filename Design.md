# Introduction

The contracts in this repository form the basis of our ICO framework. Project is built using Truffle framework and unit tested for all its functionality. All major behavior are derived from zeppelin-solidity library. This document describes the way they interact and the projected paths for extensibility.

# Overview

There are two main components in this ICO framework: the V4UL7Sale contract and the V4UL7 contract. V4UL7.sol contains the token contract and V4UL7Sale.sol contains the Sale contract In a typical deployment the CrowdSale contract is only active for the duration of the ICO and the Token contract is active for the remainder of the lifetime of the blockchain. The CrowdSale contract is [`V4UL7Sale`](contracts/V4UL7Sale.sol) and the Token contract is [`V4UL7`](contracts/V4UL7.sol). However, the majority of the functionality they provide is implemented in other contracts they inherit from.

The `V4UL7Sale` contract inherits from openzeppelin Ownable contract.
Contract implements the functionality of crowdsale.  Max cap for the token is  300000000 V4U7. Crowdsale does not have time limit but it is dependent on token cap. Crowdsale includes investing and configuration functions in addition to restricted functions for owner.

The `V4UL7` contract is a very simple contract. it inherits from the [`StandardToken`](zeppelin-solidity/contracts/token/ERC20/StandardToken.sol) contract and the [`Ownable`](zeppelin-solidity/contracts/ownership/Ownable.sol) contract. Those two are the core contracts that offer basic functionality for the token in compliance with the ERC20 standard. Additionally, it implements Ownable contract which provides mechanism to control methods by owner.

There are two contracts that require configuration according to the characteristics desired of the ICO. The first one is the `V4UL7Sale` for CrowdSale and the second one is the `V4UL7` for Token contract. In the former it is necessary to customize the constructor to pass reference of token contract and wallet for receiving funds, while in the latter it is necessary to set the name and symbol of the token.

# Design

## `V4UL7`

This contract inherits most of its functionality from several other contracts. An important objective when writing token contracts that we had in mind is encapsulating all the functionality we could. This allows easy extension of different implementations of the ERC20 standard token. Token contract inherits the major functionality from [`StandardToken`](zeppelin-solidity/contracts/token/ERC20/StandardToken.sol). Symbol of token is V4L7. Decimal points are 18. Total supply of V4UL7 Token is 1000000000 tokens.
## `V4UL7Sale`

This contract inherits only Ownable contract. An important objective of this contract is to allow people to buy tokens against ether they send. This contract accepts the address of the token contract as parameter. Total number of tokens available for sale are 300000000. All tokens are transferred to the sale contract on start of crowdsale.

Contract also implements several owner controlled method which lets owner to change the wallet address where the funds will be transferred. It also includes the method for withdrawal of ethers sent to wallet configured.

Contract includes two important method for crowdsale to function. ‘buy’ method has ability to calculate the tokens based on ether sent and current round, calculated tokens are sent to sender address. Another important method is ‘transferManual’ this is owner controlled method which lets owner to transfer tokens manually when transaction is submitted on other blockchains like bitcoin/litecoin. 

Crowdsale is consisting of 4 different rounds, it does not depend on time period. Rounds are determined by number of tokens sold. Each round has different limit and different price. Tokens sold in initial rounds are cheaper compared to later rounds. Here is classification of price.

0 to 25000000 tokens are sold for 0.000200 ether each.
25000000 to 65000000 tokens are sold for 0.000250 ether each.
65000000 to 165000000 tokens are sold for 0.000350 ether each.
165000000 to 300000000 tokens are sold for 0.000375 ether each.

Crowdsale stops accepting payment as soon as all tokens are sold. Owner has ability to close the sale at any point in time and transfer all remaining tokens to wallet address. Extra ethers sent during last sale is returned to the buyer. Crowdsale contains default payable method which internally triggers ‘buy’ method so that ethers can be sent to sale contract address. 
