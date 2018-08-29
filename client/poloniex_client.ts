import { OrderBook } from "../api/orderbook"
import { Order } from "../api/order";
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
            bids: bookData.bids.map(this.mapPoloniexOrderDataToOrder),
            asks: bookData.asks.map(this.mapPoloniexOrderDataToOrder)
        }
    }

    private mapPoloniexOrderDataToOrder(order: any): Order {
        return { quantity: order[1], rate: +order[0] }
    }
}

module.exports = PoloniexClient;
