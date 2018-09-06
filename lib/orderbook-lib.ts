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
                            combinedBook[side][paddedRate] = {};
                        }
                        combinedBook[side][paddedRate][book.exchange] = book[side][rate];
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
        let type = update.TY;
        let rate = update.R;
        let quantity = type === 1 ? 0 :+update.Q;

        return this.processUpdate(orderbook, side, rate, quantity);
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
        let quantity = +payload[2];

        return this.processUpdate(orderbook, side, rate, quantity);
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
        let side = +payload[1] ? 'asks' : 'bids';
        let rate = payload[2];
        let quantity = +payload[3];

        if (orderbook[side][rate] - quantity <= 0) {
            delete orderbook[side][payload[2]];
        } else {
            orderbook[side][rate] -= quantity;
        }

        return orderbook;
    },
    processPoloniexUpdate(orderbook: any, payload: Array<any>) {
        let side = payload[1] ? 'bids' : 'asks';
        let rate = payload[2];
        let quantity = +payload[3];

        return this.processUpdate(orderbook, side, rate, quantity);
    },
    checkForBadOrderbookData(orderbook: any, rate: string, side: string) {
        let topAsk = Object.keys(orderbook.asks).sort((m, n) => +m - +n)[0];
        let topBid = Object.keys(orderbook.bids).sort((m, n) => +n - +m)[0];

        return ((side === 'bids' && +topAsk <= +rate) || (side === 'asks' && +topBid >= +rate));
    },
    processFill() {

    },
    processUpdate(orderbook: any, side: string, rate: string, quantity: number) {
        if (quantity === 0) {
            delete orderbook[side][rate];
        } else if (this.checkForBadOrderbookData(orderbook, rate, side)) {
            throw new Error("Bad Orderbook Data Detected");
        } else {
            orderbook[side][rate] = quantity;
        }

        return orderbook;
    }
}
