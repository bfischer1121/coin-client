const io = require('socket.io-client');
const jayson = require('jayson/promise');

/**
 * CoinClient.getDimensions().then(dimensions => console.log(dimensions));
 * ->
 * {
 *   columns: [{ id: 'market', fieldType: 'string', name: 'Market', enabled: true, range: 80 || 2 || [2, 3], rangeType: 'StandardDeviation' || 'Percentile', plan: 'Free' }, { id: 'usdMarketCap', fieldType: 'float', name: 'Market Cap' }, ...],
 *   enabledColumns: ['market', 'usdMarket'],
 *   data: [ ['market', 'usdMarketCap', ...], ['ETH-TIX', 26755382.458370734, ...] ]
 * }
 */

/**
 * CoinClient.getSmartLists().then(dimensions => console.log(dimensions));
 * ->
 * {
 *   columns: [{ id: 'market', fieldType: 'string', name: 'Market' }, { id: 'usdMarketCap', fieldType: 'float', name: 'Market Cap' }, ...],
 *   data: [ ['market', 'usdMarketCap', ...], ['ETH-TIX', 26755382.458370734, ...] ]
 * }
 */

class CoinClient{
  static help(){
    return this._request('help').then(help => console.log(help));
  }

  static parseCSV(data){
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

  static on(eventName, callback){
    this._socket = this._socket || io('http://tradingshape.com:3013');
    this._socket.on(eventName, callback);
  }

  static _verifyEndpoint(methodName){
    return this._getEndpoints().then(endpoints => {
      return endpoints.findIndex(endpoint => endpoint.name === methodName) > -1;
    });
  }

  static _getEndpoints(){
    this._getEndpointsPromise = this._getEndpointsPromise || this._request('getEndpoints');
    return this._getEndpointsPromise;
  }

  static _request(method, ...args){
    return this._getClient().request(method, args).then(response => this._getRPCResponse(response));
  }

  static _getClient(){
    if(!this._client){
      this._client = jayson.client.http({
        host     : 'tradingshape.com',
        port     : 3011,
        replacer : this._replacer,
        reviver  : this._reviver
      });
    }

    return this._client;
  }

  static _replacer(key, value){
    if(typeof value === 'function'){
      return {
        $class: 'function',
        $value: value.toString()
      };
    }

    return value;
  }

  static _reviver(key, value){
    if(value && value.$class === 'function'){
      return eval(value.$value);
    }

    return value;
  }

  static _getRPCResponse(response){
    if(response.error){
      throw response.error;
    }

    if(Array.isArray(response.result || {}) && Array.isArray(response.result[0] || {})){
      return CoinClient.parseCSV(response.result);
    }

    return response.result;
  }
}

exports.CoinClient = new Proxy(CoinClient, {
  get(target, method){
    return (...args) => {
      if(['help', 'parseCSV'].indexOf(method) > -1){
        return target[method](...args);
      }

      if(method.indexOf('on') === 0){
        return target.on(method.slice(2).toLowerCase()[0] + method.slice(3), ...args);
      }

      return new Promise((resolve, reject) => {
        target._verifyEndpoint(method).then(isValid => {
          isValid ? target._request(method, ...args).then((...args) => resolve(...args)) : reject(`Invalid API endpoint: ${method}`);
        });
      });
    };
  }
});