"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Client2 = _interopRequireDefault(require("./Client.js"));

var _lodash = _interopRequireDefault(require("lodash"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } } function _next(value) { step("next", value); } function _throw(err) { step("throw", err); } _next(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var CoinClient =
/*#__PURE__*/
function (_Client) {
  _inherits(CoinClient, _Client);

  function CoinClient() {
    _classCallCheck(this, CoinClient);

    return _possibleConstructorReturn(this, _getPrototypeOf(CoinClient).apply(this, arguments));
  }

  _createClass(CoinClient, [{
    key: "parseSymbolId",
    value: function parseSymbolId(symbolId) {
      var symbolTypes = {
        'SPOT': 'SPOT',
        'FTS': 'FUTURES',
        'OPT': 'OPTION'
      };
      var parts = symbolId.split('_'),
          typeCodes = Object.keys(symbolTypes),
          typeIndex = parts.findIndex(function (p) {
        return typeCodes.indexOf(p) > -1;
      });

      if (!typeIndex) {
        throw "Invalid symbol: ".concat(symbolId);
      }

      var symbol = {
        remoteId: symbolId,
        exchangeId: parts.slice(0, typeIndex).join('_'),
        baseAssetId: parts[typeIndex + 1],
        quoteAssetId: parts[typeIndex + 2],
        symbolType: symbolTypes[parts[typeIndex]],
        pairPrefix: parts.slice(0, typeIndex + 1).join('_') + '_',
        pairSuffix: parts.length > typeIndex + 3 ? '_' + parts.slice(typeIndex + 3).join('_') : ''
      };
      var dateStr = parts[typeIndex + 3],
          date = dateStr ? new Date("20".concat(dateStr.substr(0, 2), "-").concat(dateStr.substr(2, 2), "-").concat(dateStr.substr(4, 2))) : null;

      if (symbol.symbolType === 'FUTURES') {
        symbol.future = {
          deliveryAt: date
        };
      }

      if (symbol.symbolType === 'OPTION') {
        symbol.option = {
          isCall: parts[typeIndex + 5] === 'C',
          strikePrice: +parts[typeIndex + 4],
          contractUnit: null,
          exerciseStyle: null,
          expirationAt: date
        };
      }

      return symbol;
    }
  }, {
    key: "getPriceIndicators",
    value: function () {
      var _getPriceIndicators = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee(symbolId) {
        var symbol, price, btcRate, usdRate, btcPrice, usdPrice, supply;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                symbol = this.parseSymbolId(symbolId);
                _context.next = 3;
                return this.getSymbolPrice(symbolId);

              case 3:
                price = _context.sent;
                _context.next = 6;
                return this.getExchangeRate(symbol.quoteAssetId, 'BTC', symbolId);

              case 6:
                btcRate = _context.sent;
                _context.next = 9;
                return this.getExchangeRate(symbol.quoteAssetId, 'USDT', symbolId);

              case 9:
                usdRate = _context.sent;
                btcPrice = price && btcRate ? price * btcRate : null;
                usdPrice = price && usdRate ? price * usdRate : null;
                _context.next = 14;
                return this.getCurrency(symbol.baseAssetId);

              case 14:
                _context.t1 = _context.sent;

                if (_context.t1) {
                  _context.next = 17;
                  break;
                }

                _context.t1 = {};

              case 17:
                _context.t0 = _context.t1.supply;

                if (_context.t0) {
                  _context.next = 20;
                  break;
                }

                _context.t0 = {};

              case 20:
                supply = _context.t0;
                return _context.abrupt("return", {
                  'symbol': symbolId,
                  'type': 'General',
                  'version': 2,
                  'updatedAt': new Date(),
                  'price:base': price,
                  'price:btc': btcPrice,
                  'price:usd': usdPrice,
                  'supply:circulating': supply.circulating || null,
                  'supply:total': supply.total || null,
                  'supply:max': supply.max || null,
                  'marketCap:circulating:btc': btcPrice && supply.circulating ? btcPrice * supply.circulating : null,
                  'marketCap:circulating:usd': usdPrice && supply.circulating ? usdPrice * supply.circulating : null,
                  'marketCap:total:btc': btcPrice && supply.total ? btcPrice * supply.total : null,
                  'marketCap:total:usd': usdPrice && supply.total ? usdPrice * supply.total : null
                });

              case 22:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      return function getPriceIndicators(_x) {
        return _getPriceIndicators.apply(this, arguments);
      };
    }()
  }, {
    key: "getCurrency",
    value: function () {
      var _getCurrency = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee2(assetId) {
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return this._getCurrenciesBySymbol();

              case 2:
                _context2.t0 = assetId;
                return _context2.abrupt("return", _context2.sent[_context2.t0]);

              case 4:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      return function getCurrency(_x2) {
        return _getCurrency.apply(this, arguments);
      };
    }()
  }, {
    key: "getSymbolPrice",
    value: function () {
      var _getSymbolPrice = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee3(symbolId) {
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return this._getPricesBySymbol();

              case 2:
                _context3.t0 = symbolId;
                return _context3.abrupt("return", _context3.sent[_context3.t0]);

              case 4:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      return function getSymbolPrice(_x3) {
        return _getSymbolPrice.apply(this, arguments);
      };
    }()
  }, {
    key: "getExchangeRate",
    value: function () {
      var _getExchangeRate = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee4(baseAssetId, quoteAssetId, symbolId) {
        var info, multiplier;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                info = this.parseSymbolId(symbolId);

                if (!(baseAssetId === quoteAssetId)) {
                  _context4.next = 3;
                  break;
                }

                return _context4.abrupt("return", 1.0);

              case 3:
                _context4.next = 5;
                return this.getSymbolPrice(info.pairPrefix + "".concat(baseAssetId, "_").concat(quoteAssetId) + info.pairSuffix);

              case 5:
                multiplier = _context4.sent;

                if (!multiplier) {
                  _context4.next = 8;
                  break;
                }

                return _context4.abrupt("return", multiplier);

              case 8:
                _context4.next = 10;
                return this.getSymbolPrice(info.pairPrefix + "".concat(quoteAssetId, "_").concat(baseAssetId) + info.pairSuffix);

              case 10:
                multiplier = _context4.sent;

                if (!multiplier) {
                  _context4.next = 13;
                  break;
                }

                return _context4.abrupt("return", 1 / multiplier);

              case 13:
                return _context4.abrupt("return", quoteAssetId === 'USDT' ? this.getExchangeRate(baseAssetId, 'USD', symbolId) : null);

              case 14:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      return function getExchangeRate(_x4, _x5, _x6) {
        return _getExchangeRate.apply(this, arguments);
      };
    }()
  }, {
    key: "_getPricesBySymbol",
    value: function () {
      var _getPricesBySymbol2 = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee6() {
        var _this = this;

        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                if (!this._pricesBySymbol) {
                  this._pricesBySymbol = _asyncToGenerator(
                  /*#__PURE__*/
                  regeneratorRuntime.mark(function _callee5() {
                    var prices, indicators, i, updatePrice;
                    return regeneratorRuntime.wrap(function _callee5$(_context5) {
                      while (1) {
                        switch (_context5.prev = _context5.next) {
                          case 0:
                            prices = {};
                            _context5.t0 = _this;
                            _context5.next = 4;
                            return _this.api.getIndicators();

                          case 4:
                            _context5.t1 = _context5.sent.general;
                            indicators = _context5.t0.parseCSV.call(_context5.t0, _context5.t1);

                            for (i = 0; i < indicators.length; i++) {
                              prices[indicators[i].symbol] = indicators[i]['price:base'];
                            }

                            updatePrice = function updatePrice(symbolId, price) {
                              return prices[symbolId] = price;
                            };

                            _this.api.onPriceChanged(updatePrice);

                            setTimeout(function () {
                              _this.api.unPriceChanged(updatePrice);

                              _this._pricesBySymbol = null;
                            }, 60 * 60 * 1000);
                            return _context5.abrupt("return", prices);

                          case 11:
                          case "end":
                            return _context5.stop();
                        }
                      }
                    }, _callee5, this);
                  }))();
                }

                return _context6.abrupt("return", this._pricesBySymbol);

              case 2:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      return function _getPricesBySymbol() {
        return _getPricesBySymbol2.apply(this, arguments);
      };
    }()
  }, {
    key: "_getCurrenciesBySymbol",
    value: function () {
      var _getCurrenciesBySymbol2 = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee8() {
        var _this2 = this;

        return regeneratorRuntime.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                if (!this._currenciesBySymbol) {
                  this._currenciesBySymbol = _asyncToGenerator(
                  /*#__PURE__*/
                  regeneratorRuntime.mark(function _callee7() {
                    var currencies;
                    return regeneratorRuntime.wrap(function _callee7$(_context7) {
                      while (1) {
                        switch (_context7.prev = _context7.next) {
                          case 0:
                            _context7.t0 = _lodash.default;
                            _context7.next = 3;
                            return _this2.api.getCurrencies();

                          case 3:
                            _context7.t1 = _context7.sent;
                            currencies = _context7.t0.keyBy.call(_context7.t0, _context7.t1, 'symbol');
                            setTimeout(function () {
                              return _this2._currenciesBySymbol = null;
                            }, 60 * 60 * 1000);
                            return _context7.abrupt("return", currencies);

                          case 7:
                          case "end":
                            return _context7.stop();
                        }
                      }
                    }, _callee7, this);
                  }))();
                }

                return _context8.abrupt("return", this._currenciesBySymbol);

              case 2:
              case "end":
                return _context8.stop();
            }
          }
        }, _callee8, this);
      }));

      return function _getCurrenciesBySymbol() {
        return _getCurrenciesBySymbol2.apply(this, arguments);
      };
    }()
  }]);

  return CoinClient;
}(_Client2.default);

var _default = CoinClient.getClient(CoinClient, 'tradingshape.com', 3011, 3013);

exports.default = _default;