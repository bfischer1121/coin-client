/*
'use strict';

const { CoinClient, TwitterClient } = require('../src/index');
const _ = require('lodash');
*/

let tests = (async ({ CoinClient, TwitterClient, TVInterface }) => {
  let formatResults = (results) => {
    if(_.isArray(results)){
      return '[' + (results.length ? JSON.stringify(results[0]) : '') + (results.length > 1 ? `, ...${results.length - 1} more]` : ']');
    }

    if(_.isString(results)){
      return results.slice(0, 100) + '...';
    }

    if(_.isPlainObject(results)){
      return JSON.stringify(results);
    }

    return '';
  };

  let call = async (endpoint, ...args) => {
    console.log(`\n${endpoint}(` + (args.length ? args.map(a => JSON.stringify(a)).join(', ') : '') + ') -> ');

    let client  = { 'CoinClient': CoinClient, 'TwitterClient': TwitterClient }[endpoint.split('.')[0]],
        results = await client[endpoint.split('.')[1]](...args);

    if(results){
      console.log(formatResults(results));
    }
  };

  /*
  await call('CoinClient.parseSymbolId', 'BINANCE_SPOT_BTC_USDT');
  await call('CoinClient.getPriceIndicators', 'BINANCE_SPOT_BTC_USDT');
  await call('CoinClient.getCurrency', 'GVT');
  await call('CoinClient.getSymbolPrice', 'BINANCE_SPOT_GVT_BTC');
  await call('CoinClient.getExchangeRate', 'GVT', 'USDT', 'BINANCE_SPOT_GVT_BTC');

  await call('CoinClient.help');
  await call('CoinClient.getDataVersions');
  await call('CoinClient.getFrontendClient');
  await call('CoinClient.getExchanges');
  await call('CoinClient.getCurrencies');
  await call('CoinClient.getMarketLists');
  await call('CoinClient.getIndicatorInfo');
  await call('CoinClient.getIndicators', { symbol: 'BINANCE_SPOT_BTC_USDT' });
  await call('CoinClient.getAllEvents');
  await call('CoinClient.getEventCategories');
  await call('CoinClient.getAllICOs');
  await call('CoinClient.getTwitterUsers');
  */

  /*
  await call('TwitterClient.help');
  await call('TwitterClient.getTweets', { assets: ['BTC'], skip: 0, limit: 10 });
  */

  if(TVInterface){
    TVInterface.addWidget('tv-chart', 'BINANCE_SPOT_BTC_USDT');
  }

  //TwitterClient.onTweet(tweet => console.log(tweet));
  //TwitterClient.onTweetForBTC(tweet => console.log(tweet));

  /*CoinClient.onPriceChanged((symbolId, price) => {
    console.log('price', symbolId, price);
  });*/

  return;
  CoinClient.onIndicatorsChanged(indicators => {
    console.log(indicators);
  });
  return;

  CoinClient.getDimensions().then(dimensions => {
    /**
     * console.log(dimensions); ->
     * {
     *   columns: [{ id: 'market', fieldType: 'string', name: 'Market', enabled: true, range: 80 || 2 || [2, 3], rangeType: 'StandardDeviation' || 'Percentile' }, { id: 'usdMarketCap', fieldType: 'float', name: 'Market Cap' }, ...],
     *   data: [ ['market', 'usdMarketCap', ...], ['ETH-TIX', 26755382.458370734, ...] ]
     * }
     */

    let columns    = {},
        csvColumns = dimensions.data.shift(),
        padding    = '                        ';

    dimensions.columns.forEach(c => columns[c.id] = c);

    csvColumns.slice(1).forEach((column, i) => {
      let index = i + 1;

      dimensions.data.sort((d1, d2) => d1[index] < d2[index] ? -1 : (d1[index] > d2[index] ? 1 : 0));

      console.log([
        (columns[column].name + padding).slice(0, 22),
        'Min: ' + (dimensions.data[0][0] + padding).slice(0, 10),
        'Max: ' + (dimensions.data[dimensions.data.length - 1][0] + padding).slice(0, 10)
      ].join(' | '));
    });
  });

  let getDimensionColumns = CoinClient.getDimensionColumns();

  Promise.all([
    getDimensionColumns,
    CoinClient.getMarketLists()
  ]).then(([dimensionColumns, lists]) => {
    let columns = {};

    dimensionColumns.forEach(c => columns[c.id] = c);

    lists.push({
      name: 'Custom',
      criteria: [
        //{ dimension: 'periods:5:bbands:bandwidth', lt: 0.3 },
        { dimension: 'price:usd', lt: 0.1 },
        { dimension: 'usdMarketCap', lt: 50 * 1000000 },
        //{ dimension: 'periods:60:score:score', gt: 60 },
        //{ dimension: 'periods:60:bbands:bandwidth', lt: 0.6 },
        //{ dimension: 'periods:60:stochRsi:stochRsi:k', lt: 10 },
        //{ dimension: 'periods:240:volume:btc', gt: 4 },
        //{ dimension: 'periods:60:volume:stdDev', gt: 2 }
        //{ dimension: 'periods:60:bbands:stdDev', gt: 2 }
      ]
    });

    let getCriteriaResults = (criteria) => {
      return Promise.all([
        getDimensionColumns,
        CoinClient.getCriteriaResults(criteria)
      ]).then(([dimensionColumns, markets]) => {
        let columns = {},
            padding = '                        ';

        dimensionColumns.forEach(c => columns[c.id] = c);

        if(!markets.length){
          console.log('No results');
          return;
        }

        markets = markets.map(m => {
          return [m.marketName, ...criteria.map(c => {
            let column = columns[c.dimension],
                value  = m.dimensions[c.dimension];

            if(column.fieldType === 'float' && typeof value !== 'undefined' && value !== null){
              value = value.toLocaleString('latn', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            }

            return value;
          })];
        });

        let maxValues = [];

        for(let i = 0; i < markets[0].length; i++){
          maxValues.push(Math.max(...markets.map(v => v[i].length)));
        }

        console.log('------------------------------------------');

        markets.map(market => {
          console.log([
            (market[0] + padding).slice(0, maxValues[0]),
            ...market.slice(1).map((v, i) => (padding + v).slice(-1 * maxValues[i + 1]))
          ].join(' | '));
        });

        console.log('------------------------------------------');
        console.log(' ');
      });
    };

    let getListResults = () => {
      lists.reduce((promise, list) => {
        return promise.then(() => {
          console.log('------------------------------------------');
          console.log(`${list.name} (${list.criteria.map(c => columns[c.dimension].name).join(', ')})`);
          return getCriteriaResults(list.criteria);
        });
      }, Promise.resolve());
    };

    getListResults();
    setInterval(getListResults, 60 * 1000);
  });
});

if(window){
  window.tests = tests;
}