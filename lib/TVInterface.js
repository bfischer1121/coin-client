"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } } function _next(value) { step("next", value); } function _throw(err) { step("throw", err); } _next(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var TVInterface =
/*#__PURE__*/
function () {
  function TVInterface(coinClient) {
    _classCallCheck(this, TVInterface);

    this._coinClient = coinClient;
    this.latestBars = {};
    this.resolutionToDuration = {
      'D': 1440
    };
  }

  _createClass(TVInterface, [{
    key: "addWidget",
    value: function addWidget(containerId, symbol) {
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      var defaultOptions = {
        container_id: containerId,
        symbol: symbol,
        datafeed: this,
        interval: 'D',
        library_path: '/charting_library/',
        locale: 'en',
        disabled_features: ['use_localstorage_for_settings'],
        enabled_features: ['study_templates'],
        charts_storage_url: 'https://saveload.tradingview.com',
        charts_storage_api_version: '1.1',
        client_id: 'tradingview.com',
        user_id: 'public_user_id',
        fullscreen: false,
        autosize: true,
        studies_overrides: {}
      };
      return new Promise(function (resolve) {
        window.TradingView.onready(function () {
          var widget = new window.TradingView.widget(Object.assign({}, defaultOptions, options));
          widget.onChartReady(function () {
            return resolve(widget);
          });
        });
      });
    }
  }, {
    key: "onReady",
    value: function () {
      var _onReady = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee(callback) {
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.t0 = callback;
                _context.next = 3;
                return this._getExchanges();

              case 3:
                _context.t1 = _context.sent;
                _context.t2 = [{
                  name: 'Crypto',
                  value: 'bitcoin'
                }];
                _context.t3 = ['D'];
                _context.t4 = {
                  exchanges: _context.t1,
                  symbols_types: _context.t2,
                  supported_resolutions: _context.t3,
                  supports_marks: false,
                  supports_timescale_marks: false,
                  supports_time: false
                };
                (0, _context.t0)(_context.t4);

              case 8:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      return function onReady(_x) {
        return _onReady.apply(this, arguments);
      };
    }()
  }, {
    key: "searchSymbols",
    value: function searchSymbols(userInput, exchange, symbolType, onResultReadyCallback) {
      return [];
    }
  }, {
    key: "resolveSymbol",
    value: function resolveSymbol(symbolName, onSymbolResolvedCallback, onResolveErrorCallback) {
      var _this = this;

      // TradingView requires resolveSymbol to call onSymbolResolvedCallback asynchronously
      setTimeout(function () {
        return onSymbolResolvedCallback(_this._transformSymbol(symbolName));
      }, 0);
    }
  }, {
    key: "getBars",
    value: function () {
      var _getBars = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee2(symbolInfo, resolution, from, to, onHistoryCallback, onErrorCallback, firstDataRequest) {
        var _this2 = this;

        var symbol, duration, startingAt, endingAt, bars, meta, latestBar, latestTime;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                symbol = symbolInfo.ticker, duration = this.resolutionToDuration[resolution], startingAt = new Date(from), endingAt = firstDataRequest ? null : new Date(to + 1);
                _context2.next = 3;
                return this._coinClient.getTicks({
                  symbol: symbol,
                  duration: duration,
                  startingAt: startingAt,
                  endingAt: endingAt
                });

              case 3:
                _context2.t0 = function (t) {
                  return _this2._transformTick(t);
                };

                bars = _context2.sent.map(_context2.t0);
                meta = bars.length ? {
                  noData: false
                } : {
                  noData: true,
                  nextTime: ''
                };
                // bars must be sorted by time or TradingView will not show them
                bars.sort(function (b1, b2) {
                  return b1.time - b2.time;
                });
                latestBar = bars[bars.length - 1], latestTime = ((this.latestBars[symbol] || {})[duration] || {}).time;

                if (latestBar && (!latestTime || latestBar.time >= latestTime)) {
                  this.latestBars[symbol] = this.latestBars[symbol] || {};
                  this.latestBars[symbol][duration] = latestBar;
                }

                onHistoryCallback(bars, meta);

              case 10:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      return function getBars(_x2, _x3, _x4, _x5, _x6, _x7, _x8) {
        return _getBars.apply(this, arguments);
      };
    }()
  }, {
    key: "subscribeBars",
    value: function subscribeBars(symbolInfo, resolution, onRealtimeCallback, subscriberUID, onResetCacheNeededCallback) {
      var _this3 = this;

      var duration = this.resolutionToDuration[resolution],
          tick;

      this._coinClient.onPriceChanged(function (symbol, price) {
        if (symbol === symbolInfo.ticker) {
          tick = _this3._generateTick(symbol, duration, price);

          if (tick) {
            onRealtimeCallback(tick);
          }
        }
      });
    }
  }, {
    key: "unsubscribeBars",
    value: function unsubscribeBars(subscriberUID) {}
  }, {
    key: "calculateHistoryDepth",
    value: function calculateHistoryDepth(resolution, resolutionBack, intervalBack) {
      return undefined;
    }
  }, {
    key: "getMarks",
    value: function getMarks(symbolInfo, startDate, endDate, onDataCallback, resolution) {}
  }, {
    key: "getTimescaleMarks",
    value: function getTimescaleMarks(symbolInfo, startDate, endDate, onDataCallback, resolution) {}
  }, {
    key: "getServerTime",
    value: function getServerTime(callback) {}
  }, {
    key: "_getExchanges",
    value: function () {
      var _getExchanges2 = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee3() {
        var _this4 = this;

        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                if (this._exchanges) {
                  _context3.next = 5;
                  break;
                }

                _context3.next = 3;
                return this._coinClient.getExchanges();

              case 3:
                _context3.t0 = function (e) {
                  return _this4._transformExchange(e);
                };

                this._exchanges = _context3.sent.map(_context3.t0);

              case 5:
                return _context3.abrupt("return", this._exchanges);

              case 6:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      return function _getExchanges() {
        return _getExchanges2.apply(this, arguments);
      };
    }()
  }, {
    key: "_generateTick",
    value: function _generateTick(symbol, duration, price) {
      var latestTime = ((this.latestBars[symbol] || {})[duration] || {}).time,
          tradeTime = +this._getAbsoluteAggregateTime(new Date(), duration),
          tick;

      if (!latestTime || tradeTime > latestTime) {
        this.latestBars[symbol] = this.latestBars[symbol] || {};
        tick = this.latestBars[symbol][duration] = {
          time: tradeTime,
          open: price,
          high: price,
          low: price,
          close: price,
          volume: 1
        };
      } else if (tradeTime === latestTime) {
        tick = this.latestBars[symbol][duration];
        tick.high = Math.max(tick.high, price);
        tick.low = Math.min(tick.low, price);
        tick.close = price;
        tick.volume += 1;
      }

      return tick;
    }
  }, {
    key: "_getAbsoluteAggregateTime",
    value: function _getAbsoluteAggregateTime(time, tickDuration) {
      var hours = time.getUTCHours(),
          minutes = time.getUTCMinutes();

      if (tickDuration > 60) {
        hours = hours - hours % (tickDuration / 60);
      }

      minutes = tickDuration < 60 ? minutes - minutes % tickDuration : 0;
      return new Date(Date.UTC(time.getUTCFullYear(), time.getUTCMonth(), time.getUTCDate(), hours, minutes, 0));
    }
  }, {
    key: "_transformExchange",
    value: function _transformExchange(e) {
      return {
        value: e.remoteId,
        name: e.name,
        desc: e.name
      };
    }
  }, {
    key: "_transformSymbol",
    value: function _transformSymbol(s) {
      var info = this._coinClient.parseSymbolId(s);

      var priceScale = {
        'BTC': 10000000,
        'ETH': 1000000,
        'USD': 100,
        'USDT': 100
      }[info.quoteAssetId] || 10000;
      return {
        name: "".concat(info.baseAssetId, " / ").concat(info.quoteAssetId),
        ticker: s,
        description: '',
        type: 'bitcoin',
        session: '24x7',
        exchange: info.exchangeId,
        listed_exchange: info.exchangeId,
        timezone: 'UTC',
        fractional: false,
        minmov: 1,
        pricescale: priceScale,
        has_intraday: true,
        supported_resolutions: ['D'],
        //intraday_multipliers  : [],
        has_daily: true,
        volume_precision: 13,
        data_status: 'streaming'
        /*sector: ,
        industry: ,
        currency_code: */

      };
    }
  }, {
    key: "_transformTick",
    value: function _transformTick(t) {
      return {
        time: +new Date(t.t),
        open: t.o,
        high: t.h,
        low: t.l,
        close: t.c,
        volume: t.v
      };
    }
  }]);

  return TVInterface;
}();

exports.default = TVInterface;