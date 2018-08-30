import { Order } from '../api/order'
import { OrderBook } from '../api/orderbook'
const ExchangeClient = require('../client/exchange_client');
'use strict';

class PoloniexClient extends ExchangeClient {
    poloniexApiUrl: string;

    constructor(poloniexApiUrl: string) {
        super();
        this.poloniexApiUrl = `https://${poloniexApiUrl}`
    }

    async getOrderBook(ticker = 'BTC_ETH'): Promise<OrderBook> {
        let orderBookEndpoint = `${this.poloniexApiUrl}returnOrderBook&currencyPair=${ticker}&depth=100`;

        let bookData = await this.getExchangeData(orderBookEndpoint);
        return this.mapPoloniexBookDataToOrderBook(bookData);
    }

    private mapPoloniexBookDataToOrderBook(orderBook: any): OrderBook {
        return {
            asks: orderBook.asks.map(this.mapOrder),
            bids: orderBook.bids.map(this.mapOrder)
        }
    }

    private mapOrder(order: any): Order {
        return { exchange: 'poloniex', quantity: order[1], rate: +order[0] }
    }
}

module.exports = PoloniexClient;
