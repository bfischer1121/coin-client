const io = require('socket.io-client');
const fetch = require('cross-fetch');
const _ = require('lodash');
const jayson = require('jayson/promise');

class Client{
  constructor(host, rpcPort, socketPort){
    this.host       = host;
    this.rpcPort    = rpcPort;
    this.socketPort = socketPort;
  }

  static getClient(cls, host, rpcPort, socketPort){
    let client       = new cls(host, rpcPort, socketPort),
        localMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(client)).filter(p => p !== 'constructor' && !_.startsWith(p, '_'));

    let proxy = new Proxy(client, {
      get(target, method){
        return (...args) => {
          if(['help', 'parseCSV'].concat(localMethods).indexOf(method) > -1){
            return target[method](...args);
          }

          if(method.indexOf('on') === 0){
            return target.on(method.slice(2).toLowerCase()[0] + method.slice(3), ...args);
          }

          if(method.indexOf('un') === 0){
            return target.un(method.slice(2).toLowerCase()[0] + method.slice(3), ...args);
          }

          return (async () => {
            let isValid = await target._verifyEndpoint(method);

            if(!isValid){
              throw `Invalid API endpoint: ${method}`;
            }

            return await target._request(method, ...args);
          })();
        };
      }
    });

    client.api = proxy;

    return proxy;
  }

  async help(){
    console.log(await this._request('help'));
  }

  parseCSV(data){
    let fields  = data.shift(),
        records = [],
        record, row, col;

    for(row = 0; row < data.length; row++){
      record = {};

      for(col = 0; col < data[row].length; col++){
        record[fields[col]] = data[row][col];
      }

      records.push(record);
    }

    return records;
  }

  on(eventName, callback){
    this._socket = this._socket || io(`https://${this.host}:${this.socketPort}`);
    this._socket.on(eventName, callback);
  }

  un(eventName, callback){
    if(this._socket){
      this._socket.off(eventName, callback);
    }
  }

  async _verifyEndpoint(methodName){
    return (await this._getEndpoints()).findIndex(endpoint => endpoint.name === methodName) > -1;
  }

  _getEndpoints(){
    this._getEndpointsPromise = this._getEndpointsPromise || this._request('getEndpoints');
    return this._getEndpointsPromise;
  }

  async _request(method, ...args){
    return this._getRPCResponse(await this._getRequestClient().request(method, args));
  }

  _getRequestClient(){
    if(!this._client){
      this._client = jayson.client.https({
        host     : this.host,
        port     : this.rpcPort,
        replacer : this._replacer,
        reviver  : this._reviver
      });
    }

    return this._client;
  }

  _replacer(key, value){
    if(typeof value === 'function'){
      return {
        $class: 'function',
        $value: value.toString()
      };
    }

    return value;
  }

  _reviver(key, value){
    if(value && value.$class === 'function'){
      return eval(value.$value);
    }

    return value;
  }

  _getRPCResponse(response){
    if(response.error){
      throw JSON.stringify(response.error);
    }

    if(Array.isArray(response.result || {}) && Array.isArray(response.result[0] || {})){
      return this.parseCSV(response.result);
    }

    return response.result;
  }
}

exports.Client = Client;