import { OrderBook } from "../api/orderbook"
const ExchangeClient = require("../client/exchange_client");
'use strict';

class BittrexClient extends ExchangeClient {
    bittrexApiUrl: string;

    constructor(bittrexApiUrl: string) {
        super();
        this.bittrexApiUrl = `https://${bittrexApiUrl}/v1.1/public/`;
    }

    async getOrderBook(ticker = 'BTC-ETH'): Promise<OrderBook> {
        let orderBookEndpoint = `${this.bittrexApiUrl}getorderbook?market=${ticker}&type=both`;

        let bookData = await this.getExchangeData(orderBookEndpoint);

        return {
            exchange: "bittrex",
            buy: bookData.result.buy,
            sell: bookData.result.sell
        }
    }
}

module.exports = BittrexClient;
