"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("@babel/polyfill");

var _CoinClient = _interopRequireDefault(require("./CoinClient.js"));

var _TwitterClient = _interopRequireDefault(require("./TwitterClient.js"));

var _TVInterface2 = _interopRequireDefault(require("./TVInterface"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TVInterface = new _TVInterface2.default(_CoinClient.default);
var _default = {
  CoinClient: _CoinClient.default,
  TwitterClient: _TwitterClient.default,
  TVInterface: TVInterface
};
exports.default = _default;