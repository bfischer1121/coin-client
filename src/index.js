require('@babel/polyfill');

const { CoinClient } = require('./CoinClient.js');
const { TwitterClient } = require('./TwitterClient.js');
const { TVInterface } = require('./TVInterface');

module.exports = {
  CoinClient    : CoinClient,
  TwitterClient : TwitterClient,
  TVInterface   : new TVInterface(CoinClient)
};