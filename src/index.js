import '@babel/polyfill';

import CoinClient from './CoinClient.js';
import TwitterClient from './TwitterClient.js';
import TVInterface from './TVInterface';

module.exports = {
  CoinClient    : CoinClient,
  TwitterClient : TwitterClient,
  TVInterface   : new TVInterface(CoinClient)
};