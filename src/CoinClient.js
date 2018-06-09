const { Client } = require('./Client.js');

class CoinClient extends Client{
  parseSymbolId(symbolId){
    let symbolTypes = {
      'SPOT' : 'SPOT',
      'FTS'  : 'FUTURES',
      'OPT'  : 'OPTION'
    };

    let parts     = symbolId.split('_'),
        typeCodes = Object.keys(symbolTypes),
        typeIndex = parts.findIndex(p => typeCodes.indexOf(p) > -1);

    if(!typeIndex){
      throw `Invalid symbol: ${symbolId}`;
    }

    let symbol = {
      remoteId     : symbolId,
      exchangeId   : parts.slice(0, typeIndex).join('_'),
      baseAssetId  : parts[typeIndex + 1],
      quoteAssetId : parts[typeIndex + 2],
      symbolType   : symbolTypes[parts[typeIndex]],
      pairPrefix   : parts.slice(0, typeIndex + 1).join('_') + '_',
      pairSuffix   : parts.length > typeIndex + 3 ? '_' + parts.slice(typeIndex + 3).join('_') : ''
    };

    let dateStr = parts[typeIndex + 3],
        date    = dateStr ? new Date(`20${dateStr.substr(0, 2)}-${dateStr.substr(2, 2)}-${dateStr.substr(4, 2)}`) : null;

    if(symbol.symbolType === 'FUTURES'){
      symbol.future = { deliveryAt: date };
    }

    if(symbol.symbolType === 'OPTION'){
      symbol.option = {
        isCall        : (parts[typeIndex + 5] === 'C'),
        strikePrice   : +parts[typeIndex + 4],
        contractUnit  : null,
        exerciseStyle : null,
        expirationAt  : date
      };
    }

    return symbol;
  }

  async getPriceIndicators(symbolId){
    let symbol   = this.parseSymbolId(symbolId),
        price    = await this.getSymbolPrice(symbolId),
        btcRate  = await this.getExchangeRate(symbol.quoteAssetId, 'BTC', symbolId),
        usdRate  = await this.getExchangeRate(symbol.quoteAssetId, 'USDT', symbolId),
        btcPrice = (price && btcRate) ? price * btcRate : null,
        usdPrice = (price && usdRate) ? price * usdRate : null,
        supply   = (await this.getCurrency(symbol.baseAssetId) || {}).supply || {};

    return {
      'symbol'     : symbolId,
      'type'       : 'General',
      'version'    : 2,
      'updatedAt'  : new Date(),
      'price:base' : price,
      'price:btc'  : btcPrice,
      'price:usd'  : usdPrice,

      'supply:circulating' : supply.circulating || null,
      'supply:total'       : supply.total       || null,
      'supply:max'         : supply.max         || null,

      'marketCap:circulating:btc': (btcPrice && supply.circulating) ? btcPrice * supply.circulating : null,
      'marketCap:circulating:usd': (usdPrice && supply.circulating) ? usdPrice * supply.circulating : null,

      'marketCap:total:btc': (btcPrice && supply.total) ? btcPrice * supply.total : null,
      'marketCap:total:usd': (usdPrice && supply.total) ? usdPrice * supply.total : null
    };
  }

  async getCurrency(assetId){
    return (await this._getCurrenciesBySymbol())[assetId];
  }

  async getSymbolPrice(symbolId){
    return (await this._getPricesBySymbol())[symbolId];
  }

  async getExchangeRate(baseAssetId, quoteAssetId, symbolId){
    let info = this.parseSymbolId(symbolId);

    if(baseAssetId === quoteAssetId){
      return 1.0;
    }

    let multiplier = await this.getSymbolPrice(info.pairPrefix + `${baseAssetId}_${quoteAssetId}` + info.pairSuffix);

    // e.g., BINANCE_SPOT_EOS_ETH (@0.01ETH) * BINANCE_SPOT_ETH_BTC(@0.1BTC) = 0.001BTC
    if(multiplier){
      return multiplier;
    }

    multiplier = await this.getSymbolPrice(info.pairPrefix + `${quoteAssetId}_${baseAssetId}` + info.pairSuffix);

    // e.g., BINANCE_SPOT_EOS_USDT (@10USDT) * (1 / BINANCE_SPOT_BTC_USDT (@10,000USDT)) = 0.001BTC
    if(multiplier){
      return (1 / multiplier);
    }

    return quoteAssetId === 'USDT' ? this.getExchangeRate(baseAssetId, 'USD', symbolId) : null;
  }

  async _getPricesBySymbol(){
    if(this._indicatorsLoaded){
      return this._pricesBySymbol;
    }

    this._indicators = this.parseCSV((await this.api.getIndicators()).general);
    this._pricesBySymbol = this._pricesBySymbol || {};

    for(let i = 0; i < this._indicators.length; i++){
      this._pricesBySymbol[this._indicators[i].symbol] = this._indicators[i]['price:base'];
    }

    if(!this._listeningForPriceChanges){
      this.api.onPriceChanged((symbolId, price) => this._pricesBySymbol[symbolId] = price);
      this._listeningForPriceChanges = true;
    }

    this._indicatorsLoaded = true;
    setTimeout(() => this._indicatorsLoaded = false, 60 * 60 * 1000);

    return this._pricesBySymbol;
  }

  async _getCurrenciesBySymbol(){
    if(this._currenciesLoaded){
      return this._currenciesBySymbol;
    }

    this._currencies = await this.api.getCurrencies();
    this._currenciesBySymbol = this._currenciesBySymbol || {};

    for(let i = 0; i < this._currencies.length; i++){
      this._currenciesBySymbol[this._currencies[i].symbol] = this._currencies[i];
    }

    this._currenciesLoaded = true;
    setTimeout(() => this._currenciesLoaded = false, 60 * 60 * 1000);

    return this._currenciesBySymbol;
  }
}

exports.CoinClient = CoinClient.getClient(CoinClient, 'tradingshape.com', 3011, 3013);