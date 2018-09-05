export default {
   combineBooks(books: Array<any>) {
        let combined = books.reduce((combinedBook: any, book: any) => {
            ['asks', 'bids'].forEach((side) => {
                Object.keys(book[side]).forEach((rate: string) => {
                    let paddedRate = rate;
                    if (!paddedRate.includes('.')) paddedRate += '.';
                    while (paddedRate.length < 10) paddedRate += '0';

                    if (book[side][rate]) {
                        if (!combinedBook[side][paddedRate]) {
                            combinedBook[side][paddedRate] = { total: 0 };
                        }
                        combinedBook[side][paddedRate][book.exchange] = book[side][rate];
                        combinedBook[side][paddedRate].total += book[side][rate]
                    }
                });
            });
            return combinedBook;
        }, { asks: {}, bids: {} });

        let sortNumericKeys = (h: object) => Object.keys(h).sort((m: string, n: string) => +m - +n);
        let sortedAskKeys = sortNumericKeys(combined.asks);
        let sortedBidKeys = sortNumericKeys(combined.bids);
        let lastBid = sortedBidKeys.length - 1;

        let sorted = { asks: {}, bids: {}} as any;

        sortedAskKeys.forEach(key => {
            if (combined.asks[key] === 0) return;
            sorted.asks[key] = combined.asks[key];
            sorted.asks[key].overlap = sortedBidKeys[lastBid] >= key;
        });

        sortedBidKeys.forEach(key => {
            if (combined.bids[key] === 0) return;
            sorted.bids[key] = combined.bids[key];
            sorted.bids[key].overlap = sortedAskKeys[0] <= key;
        });

        return sorted;
    },
    mapBittrexOrderbookData(orderbookData: any) {
        let aggregateLevels = (levels: Array<any>) => {
            return levels.reduce((levelMap: any, level: any) => {
                levelMap[level.R] = +level.Q;
                return levelMap;
            }, {});
        }

        return {
            asks: aggregateLevels(orderbookData.S),
            bids: aggregateLevels(orderbookData.Z)
        }
    },
    processBittrexFill(orderbook: any, fill: any) {
        let side = fill.OT === 'BUY' ? 'asks' : 'bids';

        if (orderbook[side][fill.R] - fill.Q <= 0) {
            delete orderbook[side][fill.R];
        } else {
            orderbook[side][fill.R] -= +fill.Q;
        }

        return orderbook;
    },
    processBittrexUpdate(orderbook: any, update: any, side: string) {
        let type = update.TY

        let topAsk = Object.keys(orderbook.asks).sort((m, n) => +m - +n)[0];
        let topBid = Object.keys(orderbook.bids).sort((m, n) => +n - +m)[0];
        if ((side === 'bids' && +topAsk <= +update.R) || (side === 'asks' && +topBid >= +update.R)) {
            throw new Error("Bad Bittrex Data Detected");
        }

        switch(type) {
            case 1:
               delete orderbook[side][update.R]
               break;

            case 0:
            case 2:
               orderbook[side][update.R] = +update.Q;
               break;

            default:
               console.log("Unknown Bittrex update type");
        }

        return orderbook;
   },
   mapCoinbaseOrderbookData(orderbookData: any): any {
        let mapLevels = (levels: Array<Array<string>>) => {
            return levels.reduce((levelMap: any, level: Array<string>) => {
                levelMap[level[0]] = +level[1];
                return levelMap;
            }, {});
        }

        return {
            asks: mapLevels(orderbookData.rawAsks),
            bids: mapLevels(orderbookData.rawBids)
        }
   },
   processCoinbaseUpdate(orderbook: any, payload: Array<string>) {
        let side = payload[0] === 'buy' ? 'bids' : 'asks';
        let rate = payload[1];
        let quantity = payload[2];

        let topAsk = Object.keys(orderbook.asks).sort((m, n) => +m - +n)[0];
        let topBid = Object.keys(orderbook.bids).sort((m, n) => +n - +m)[0];

        if ((side === 'bids' && +topAsk <= +rate) || (side === 'asks' && +topBid >= +rate)) {
            throw new Error("Bad Coinbase Data Detected");
        }

        if (quantity === '0') {
            delete orderbook[side][rate];
        } else {
            orderbook[side][rate] = +quantity;
        }

        return orderbook;
   },
   mapPoloniexOrderbookData(orderbookData: any): any {
        let mapLevels = (levels: any) => {
            return Object.keys(levels).reduce((levelMap: any, level: string) => {
                levelMap[level] = +levels[level]
                return levelMap;
            }, {});
        }

        return {
            asks: mapLevels(orderbookData.rawAsks),
            bids: mapLevels(orderbookData.rawBids)
        }
    },
    processPoloniexFill(orderbook: any, payload: Array<any>) {
        let updateType = payload[1];

        if (updateType) {
            if (orderbook.asks[payload[2]] - +payload[3] <= 0) {
                delete orderbook.asks[payload[2]]
            } else {
                orderbook.asks[payload[2]] -= +[payload[3]];
            }
        } else {
            if (orderbook.bids[payload[2]] - +payload[3] === 0) {
                delete orderbook.bids[payload[2]]
            } else {
                orderbook.bids[payload[2]] -= +[payload[3]];
            }
        }

        return orderbook;
    },
    processPoloniexUpdate(orderbook: any, payload: Array<any>) {
        let updateType = payload[1];
        
        if (updateType) {
            if (+payload[3] === 0) {
                delete orderbook.bids[payload[2]]
            } else {
                let topAsk = Object.keys(orderbook.asks).sort((m, n) => +m - +n)[0];

                if (+topAsk <= +payload[2]) {
                    throw new Error("Bad Poloniex Data Detected");
                }
                orderbook.bids[payload[2]] = +[payload[3]];
            }
        } else {
            if (+payload[3] === 0) {
                delete orderbook.asks[payload[2]]
            } else {
                let topBid = Object.keys(orderbook.bids).sort((m, n) => +n - +m)[0];
                if (+topBid >= +payload[2]) {
                    throw new Error("Bad Poloniex Data Detected");
                }
                orderbook.asks[payload[2]] = +[payload[3]];
            }
        }

        return orderbook;
    }
}
