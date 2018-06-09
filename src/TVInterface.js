class TVInterface{
  constructor(coinClient){
    this._coinClient = coinClient;
  }

  onReady(callback){
    callback({
      exchanges                : exchanges,
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
    symbols[symbolName]
      ? onSymbolResolvedCallback(symbols[symbolName])
      : onResolveErrorCallback('Symbol not found');
  }

  async getBars(symbolInfo, resolution, from, to, onHistoryCallback, onErrorCallback, firstDataRequest){
    let duration = { 'D': 1440 }[resolution],
        end      = firstDataRequest ? null : new Date(to),
        ticks    = await this._coinClient.getTicks(symbolInfo.ticker, duration, new Date(from), end),
        bars     = ticks.map(t => this._transformTick(t));

    bars.length
      ? onHistoryCallback(bars)
      : onHistoryCallback(bars, { noData: true, nextTime: '' });
  }

  subscribeBars(symbolInfo, resolution, onRealtimeCallback, subscriberUID, onResetCacheNeededCallback){
    privateMethods.onNewTick(tick => onRealtimeCallback(this._transformTick(tick)));
  }

  unsubscribeBars(subscriberUID){
    
  }

  calculateHistoryDepth(resolution, resolutionBack, intervalBack){
    return undefined;
  }

  getMarks(symbolInfo, startDate, endDate, onDataCallback, resolution){}

  getTimescaleMarks(symbolInfo, startDate, endDate, onDataCallback, resolution){}

  getServerTime(callback){}

  _transformExchange(e){
    return {
      value : e.remoteId,
      name  : e.name,
      desc  : e.name
    };
  }

  _transformSymbol(s){
    let info = privateMethods.parseSymbolId(s.remoteId);

    return {
      name                  : `${info.baseAssetId} / ${info.quoteAssetId}`,
      ticker                : s.remoteId,
      description           : '',
      type                  : 'bitcoin',
      session               : '24x7',
      exchange              : info.exchangeId,
      listed_exchange       : info.exchangeId,
      timezone              : 'Europe/London',
      minmov                : '',
      pricescale            : '',
      minmove2              : '',
      fractional            : '',
      has_intraday          : '',
      supported_resolutions : ['D'],
      intraday_multipliers  : '',
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
      time   : +t.t,
      close  : t.c,
      open   : t.o,
      high   : t.h,
      low    : t.l,
      volume : t.v
    };
  }
}

exports.TVInterface = TVInterface;