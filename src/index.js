import CoinClient from './CoinClient.js';
import TwitterClient from './TwitterClient.js';
import _TVInterface from './TVInterface';

const TVInterface = new _TVInterface(CoinClient);

export default {
  CoinClient,
  TwitterClient,
  TVInterface
};