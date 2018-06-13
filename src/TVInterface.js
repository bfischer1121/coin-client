class TVInterface{
  constructor(coinClient){
    this._coinClient = coinClient;

    this.latestBars = {};
    this.resolutionToDuration = { 'D': 1440 };
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
    let symbol     = symbolInfo.ticker,
        duration   = this.resolutionToDuration[resolution],
        startingAt = new Date(from),
        endingAt   = firstDataRequest ? null : new Date(to + 1);

    let bars = (await this._coinClient.getTicks({ symbol, duration, startingAt, endingAt })).map(t => this._transformTick(t)),
        meta = bars.length ? { noData: false } : { noData: true, nextTime: '' };

    // bars must be sorted by time or TradingView will not show them
    bars.sort((b1, b2) => b1.time - b2.time);

    let latestBar  = bars[bars.length - 1],
        latestTime = ((this.latestBars[symbol] || {})[duration] || {}).time;

    if(latestBar && (!latestTime || latestBar.time >= latestTime)){
      this.latestBars[symbol] = this.latestBars[symbol] || {};
      this.latestBars[symbol][duration] = latestBar;
    }

    onHistoryCallback(bars, meta);
  }

  subscribeBars(symbolInfo, resolution, onRealtimeCallback, subscriberUID, onResetCacheNeededCallback){
    let duration = this.resolutionToDuration[resolution],
        tick;

    this._coinClient.onPriceChanged((symbol, price) => {
      if(symbol === symbolInfo.ticker){
        tick = this._generateTick(symbol, duration, price);

        if(tick){
          onRealtimeCallback(tick);
        }
      }
    });
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

  _generateTick(symbol, duration, price){
    let latestTime = ((this.latestBars[symbol] || {})[duration] || {}).time,
        tradeTime  = +this._getAbsoluteAggregateTime(new Date(), duration),
        tick;

    if(!latestTime || tradeTime > latestTime){
      this.latestBars[symbol] = this.latestBars[symbol] || {};

      tick = this.latestBars[symbol][duration] = {
        time   : tradeTime,
        open   : price,
        high   : price,
        low    : price,
        close  : price,
        volume : 1
      };
    }
    else if(tradeTime === latestTime){
      tick         = this.latestBars[symbol][duration];
      tick.high    = Math.max(tick.high, price);
      tick.low     = Math.min(tick.low, price);
      tick.close   = price;
      tick.volume += 1;
    }

    return tick;
  }

  _getAbsoluteAggregateTime(time, tickDuration){
    let hours   = time.getUTCHours(),
        minutes = time.getUTCMinutes();

    if(tickDuration > 60){
      hours = hours - (hours % (tickDuration / 60));
    }

    minutes = (tickDuration < 60) ? minutes - (minutes % tickDuration) : 0;

    return new Date(Date.UTC(time.getUTCFullYear(), time.getUTCMonth(), time.getUTCDate(), hours, minutes, 0));
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
      'BTC'  : 10000000,
      'ETH'  : 1000000,
      'USD'  : 100,
      'USDT' : 100
    }[info.quoteAssetId] || 10000;

    return {
      name                  : `${info.baseAssetId} / ${info.quoteAssetId}`,
      ticker                : s,
      description           : '',
      type                  : 'bitcoin',
      session               : '24x7',
      exchange              : info.exchangeId,
      listed_exchange       : info.exchangeId,
      timezone              : 'UTC',
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