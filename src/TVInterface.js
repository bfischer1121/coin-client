class TVInterface{
  constructor(coinClient){
    this._coinClient = coinClient;
  }

  addWidget(containerId, symbol, options = {}){
    let defaultOptions = {
      container_id               : containerId,
			symbol                     : symbol,
			datafeed                   : this,
			interval                   : 'D',
			library_path               : '/charting_library/',
			locale                     : 'en',
			disabled_features          : ['use_localstorage_for_settings'],
			enabled_features           : ['study_templates'],
			charts_storage_url         : 'https://saveload.tradingview.com',
			charts_storage_api_version : '1.1',
			client_id                  : 'tradingview.com',
			user_id                    : 'public_user_id',
			fullscreen                 : false,
			autosize                   : true,
			studies_overrides          : {}
		};

    return new Promise(resolve => {
  		window.TradingView.onready(() => {
  			let widget = new window.TradingView.widget(Object.assign({}, defaultOptions, options));
  			widget.onChartReady(() => resolve(widget));
  		});
    });
  }

  async onReady(callback){
    callback({
      exchanges                : await this._getExchanges(),
      symbols_types            : [{ name: 'Crypto', value: 'bitcoin' }],
      supported_resolutions    : ['D'],
      supports_marks           : false,
      supports_timescale_marks : false,
      supports_time            : false
    });
  }

  searchSymbols(userInput, exchange, symbolType, onResultReadyCallback){
    return [];
  }

  resolveSymbol(symbolName, onSymbolResolvedCallback, onResolveErrorCallback){
    // TradingView requires resolveSymbol to call onSymbolResolvedCallback asynchronously
    setTimeout(() => onSymbolResolvedCallback(this._transformSymbol(symbolName)), 0);
  }

  async getBars(symbolInfo, resolution, from, to, onHistoryCallback, onErrorCallback, firstDataRequest){
    let bars = (await this._coinClient.getTicks({
      symbol     : symbolInfo.ticker,
      duration   : { 'D': 1440 }[resolution],
      startingAt : new Date(from),
      endingAt   : firstDataRequest ? null : new Date(to + 1)
    })).map(t => this._transformTick(t));

    // bars must be sorted by time or TradingView will not show them
    bars.sort((b1, b2) => b1.time - b2.time);

    let meta = bars.length ? { noData: false } : { noData: true, nextTime: '' };

    onHistoryCallback(bars, meta);
  }

  subscribeBars(symbolInfo, resolution, onRealtimeCallback, subscriberUID, onResetCacheNeededCallback){
    this._coinClient.onNewTick(tick => onRealtimeCallback(this._transformTick(tick)));
  }

  unsubscribeBars(subscriberUID){
    
  }

  calculateHistoryDepth(resolution, resolutionBack, intervalBack){
    return undefined;
  }

  getMarks(symbolInfo, startDate, endDate, onDataCallback, resolution){}

  getTimescaleMarks(symbolInfo, startDate, endDate, onDataCallback, resolution){}

  getServerTime(callback){}

  async _getExchanges(){
    if(!this._exchanges){
      this._exchanges = (await this._coinClient.getExchanges()).map(e => this._transformExchange(e));
    }

    return this._exchanges;
  }

  _transformExchange(e){
    return {
      value : e.remoteId,
      name  : e.name,
      desc  : e.name
    };
  }

  _transformSymbol(s){
    let info = this._coinClient.parseSymbolId(s);

    let priceScale = {
      'BTC'  : 100000000,
      'ETH'  : 1000000000000000000,
      'USD'  : 10000,
      'USDT' : 10000
    }[info.quoteAssetId] || 10000;

    return {
      name                  : `${info.baseAssetId} / ${info.quoteAssetId}`,
      ticker                : s,
      description           : '',
      type                  : 'bitcoin',
      session               : '24x7',
      exchange              : info.exchangeId,
      listed_exchange       : info.exchangeId,
      timezone              : 'Europe/London',
      fractional            : false,
      minmov                : 1,
      pricescale            : priceScale,
      has_intraday          : true,
      supported_resolutions : ['D'],
      //intraday_multipliers  : [],
      has_daily             : true,
      volume_precision      : 13,
      data_status           : 'streaming'
      /*sector: ,
      industry: ,
      currency_code: */
    };
  }

  _transformTick(t){
    return {
      time   : +(new Date(t.t)),
      open   : t.o,
      high   : t.h,
      low    : t.l,
      close  : t.c,
      volume : t.v
    };
  }
}

exports.TVInterface = TVInterface;