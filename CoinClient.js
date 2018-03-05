const jayson = require('jayson/promise');

/**
 * CoinClient.getDimensions().then(dimensions => console.log(dimensions));
 * ->
 * {
 *   columns: [{ id: 'market', fieldType: 'string', name: 'Market', enabled: true, range: 80 || 2 || [2, 3], rangeType: 'StandardDeviation' || 'Percentile' }, { id: 'usdMarketCap', fieldType: 'float', name: 'Market Cap' }, ...],
 *   data: [ ['market', 'usdMarketCap', ...], ['ETH-TIX', 26755382.458370734, ...] ]
 * }
 */

class CoinClient{
  static getDimensions(){
    return this._request('Screener#getDimensions');
  }

  static _request(route, ...args){
    let [server, method] = route.split('#');
    return this._client(server).request(method, args).then(response => this._getRPCResponse(response));
  }

  static _client(serverName){
    this._clients = this._clients || {};

    if(!this._clients[serverName]){
      this._clients[serverName] = jayson.client.http({
        host     : this._serverHost,
        port     : this._ports[serverName],
        replacer : this._replacer,
        reviver  : this._reviver
      });
    }

    return this._clients[serverName];
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

CoinClient._serverHost = '159.65.227.89';

CoinClient._ports = {
  'OrderBooks' : 3010,
  'Screener'   : 3011,
  'Proxy'      : 3012
};

exports.CoinClient = CoinClient;