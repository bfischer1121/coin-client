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

    return response.result;
  }
}

exports.CoinClient = new Proxy(CoinClient, {
  get(target, method){
    return (...args) => {
      if(method === 'help'){
        return target.help();
      }

      return new Promise((resolve, reject) => {
        target._verifyEndpoint(method).then(isValid => {
          isValid ? target._request(method, ...args).then((...args) => resolve(...args)) : reject(`Invalid API endpoint: ${method}`);
        });
      });
    };
  }
});