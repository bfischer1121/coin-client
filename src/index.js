const CoinClient = require('./CoinClient.js');
const TwitterClient = require('./TwitterClient.js');
const TVInterface = require('./TVInterface');

module.exports = {
  CoinClient,
  TwitterClient,
  TVInterface: new TVInterface(CoinClient)
};