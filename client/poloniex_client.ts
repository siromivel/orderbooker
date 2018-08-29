import { OrderBook } from "../api/orderbook"
const ExchangeClient = require("../client/exchange_client");
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

        return {
            exchange: "poloniex",
            buy: bookData.bids,
            sell: bookData.asks
        }
    }
}

module.exports = PoloniexClient;
