"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _socket = _interopRequireDefault(require("socket.io-client"));

var _crossFetch = _interopRequireDefault(require("cross-fetch"));

var _lodash = _interopRequireDefault(require("lodash"));

var _browser = _interopRequireDefault(require("jayson/lib/client/browser"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } } function _next(value) { step("next", value); } function _throw(err) { step("throw", err); } _next(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

if (!process.env.BROWSER && typeof window === 'undefined') {
  // using commonjs because nested/variable es6 imports appear to be unsupported
  var _jaysonServerSide = require('jayson/promise');
}

var Client =
/*#__PURE__*/
function () {
  function Client(host, rpcPort, socketPort) {
    _classCallCheck(this, Client);

    this.host = host;
    this.rpcPort = rpcPort;
    this.socketPort = socketPort;
    this.isServerSide = typeof window === 'undefined';
  }

  _createClass(Client, [{
    key: "help",
    value: function () {
      var _help = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee() {
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.t0 = console;
                _context.next = 3;
                return this._request('help');

              case 3:
                _context.t1 = _context.sent;

                _context.t0.log.call(_context.t0, _context.t1);

              case 5:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      return function help() {
        return _help.apply(this, arguments);
      };
    }()
  }, {
    key: "parseCSV",
    value: function parseCSV(data) {
      var fields = data.shift(),
          records = [],
          record,
          row,
          col;

      for (row = 0; row < data.length; row++) {
        record = {};

        for (col = 0; col < data[row].length; col++) {
          record[fields[col]] = data[row][col];
        }

        records.push(record);
      }

      return records;
    }
  }, {
    key: "on",
    value: function on(eventName, callback) {
      this._socket = this._socket || (0, _socket.default)("http://".concat(this.host, ":").concat(this.socketPort));

      this._socket.on(eventName, callback);
    }
  }, {
    key: "un",
    value: function un(eventName, callback) {
      if (this._socket) {
        this._socket.off(eventName, callback);
      }
    }
  }, {
    key: "_verifyEndpoint",
    value: function () {
      var _verifyEndpoint2 = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee2(methodName) {
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return this._getEndpoints();

              case 2:
                _context2.t0 = function (endpoint) {
                  return endpoint.name === methodName;
                };

                _context2.t1 = _context2.sent.findIndex(_context2.t0);
                _context2.t2 = -1;
                return _context2.abrupt("return", _context2.t1 > _context2.t2);

              case 6:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      return function _verifyEndpoint(_x) {
        return _verifyEndpoint2.apply(this, arguments);
      };
    }()
  }, {
    key: "_getEndpoints",
    value: function _getEndpoints() {
      this._getEndpointsPromise = this._getEndpointsPromise || this._request('getEndpoints');
      return this._getEndpointsPromise;
    }
  }, {
    key: "_request",
    value: function () {
      var _request2 = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee3(method) {
        var _len,
            args,
            _key,
            _args3 = arguments;

        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                for (_len = _args3.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                  args[_key - 1] = _args3[_key];
                }

                _context3.t0 = this;
                _context3.next = 4;
                return this._getRequestClient().request(method, args);

              case 4:
                _context3.t1 = _context3.sent;
                return _context3.abrupt("return", _context3.t0._getRPCResponse.call(_context3.t0, _context3.t1));

              case 6:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      return function _request(_x2) {
        return _request2.apply(this, arguments);
      };
    }()
  }, {
    key: "_getRequestClient",
    value: function _getRequestClient() {
      if (!this._client) {
        this._client = this.isServerSide ? this._getServerSideClient() : this._getBrowserSideClient();
      }

      return this._client;
    }
  }, {
    key: "_getServerSideClient",
    value: function _getServerSideClient() {
      return jaysonServerSide.client.http({
        host: this.host,
        port: this.rpcPort,
        replacer: this._replacer,
        reviver: this._reviver
      });
    }
  }, {
    key: "_getBrowserSideClient",
    value: function _getBrowserSideClient() {
      var _this = this;

      var callServer =
      /*#__PURE__*/
      function () {
        var _ref = _asyncToGenerator(
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee4(request, callback) {
          var response, options;
          return regeneratorRuntime.wrap(function _callee4$(_context4) {
            while (1) {
              switch (_context4.prev = _context4.next) {
                case 0:
                  options = {
                    method: 'POST',
                    body: request,
                    headers: {
                      'Content-Type': 'application/json'
                    }
                  };
                  _context4.prev = 1;
                  _context4.next = 4;
                  return (0, _crossFetch.default)("http://".concat(_this.host, ":").concat(_this.rpcPort), options);

                case 4:
                  response = _context4.sent;
                  _context4.next = 11;
                  break;

                case 7:
                  _context4.prev = 7;
                  _context4.t0 = _context4["catch"](1);
                  callback(_context4.t0);
                  return _context4.abrupt("return");

                case 11:
                  _context4.t1 = callback;
                  _context4.next = 14;
                  return response.text();

                case 14:
                  _context4.t2 = _context4.sent;
                  (0, _context4.t1)(null, _context4.t2);

                case 16:
                case "end":
                  return _context4.stop();
              }
            }
          }, _callee4, this, [[1, 7]]);
        }));

        return function callServer(_x3, _x4) {
          return _ref.apply(this, arguments);
        };
      }();

      var client = (0, _browser.default)(callServer, {
        replacer: this._replacer,
        reviver: this._reviver
      });
      return {
        request: function request(method, args) {
          return new Promise(function (resolve, reject) {
            client.request(method, args, function (localError, remoteError, result) {
              resolve({
                error: localError || remoteError,
                result: result
              });
            });
          });
        }
      };
    }
  }, {
    key: "_replacer",
    value: function _replacer(key, value) {
      if (typeof value === 'function') {
        return {
          $class: 'function',
          $value: value.toString()
        };
      }

      return value;
    }
  }, {
    key: "_reviver",
    value: function _reviver(key, value) {
      if (value && value.$class === 'function') {
        return eval(value.$value);
      }

      return value;
    }
  }, {
    key: "_getRPCResponse",
    value: function _getRPCResponse(response) {
      if (response.error) {
        throw JSON.stringify(response.error);
      }

      if (Array.isArray(response.result || {}) && Array.isArray(response.result[0] || {})) {
        return this.parseCSV(response.result);
      }

      return response.result;
    }
  }], [{
    key: "getClient",
    value: function getClient(cls, host, rpcPort, socketPort) {
      var client = new cls(host, rpcPort, socketPort),
          localMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(client)).filter(function (p) {
        return p !== 'constructor' && !_lodash.default.startsWith(p, '_');
      });
      var proxy = new Proxy(client, {
        get: function get(target, method) {
          return function () {
            for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
              args[_key2] = arguments[_key2];
            }

            if (['help', 'parseCSV'].concat(localMethods).indexOf(method) > -1) {
              return target[method].apply(target, args);
            }

            if (method.indexOf('on') === 0) {
              return target.on.apply(target, [method.slice(2).toLowerCase()[0] + method.slice(3)].concat(args));
            }

            if (method.indexOf('un') === 0) {
              return target.un.apply(target, [method.slice(2).toLowerCase()[0] + method.slice(3)].concat(args));
            }

            return _asyncToGenerator(
            /*#__PURE__*/
            regeneratorRuntime.mark(function _callee5() {
              var isValid;
              return regeneratorRuntime.wrap(function _callee5$(_context5) {
                while (1) {
                  switch (_context5.prev = _context5.next) {
                    case 0:
                      _context5.next = 2;
                      return target._verifyEndpoint(method);

                    case 2:
                      isValid = _context5.sent;

                      if (isValid) {
                        _context5.next = 5;
                        break;
                      }

                      throw "Invalid API endpoint: ".concat(method);

                    case 5:
                      _context5.next = 7;
                      return target._request.apply(target, [method].concat(args));

                    case 7:
                      return _context5.abrupt("return", _context5.sent);

                    case 8:
                    case "end":
                      return _context5.stop();
                  }
                }
              }, _callee5, this);
            }))();
          };
        }
      });
      client.api = proxy;
      return proxy;
    }
  }]);

  return Client;
}();

exports.default = Client;