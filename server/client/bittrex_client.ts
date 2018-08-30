import { Order } from '../api/order'
import { OrderBook } from '../api/orderbook'
const ExchangeClient = require('../client/exchange_client');
'use strict';

class BittrexClient extends ExchangeClient {
    bittrexApiUrl: string;

    constructor(bittrexApiUrl: string) {
        super();
        this.bittrexApiUrl = `https://${bittrexApiUrl}/v1.1/public/`;
    }

    async getOrderBook(ticker = 'BTC-ETH'): Promise<OrderBook> {
        let orderBookEndpoint = `${this.bittrexApiUrl}getorderbook?market=${ticker}&type=both&depth=1000`;

        let bookData = await this.getExchangeData(orderBookEndpoint);
        return this.mapBittrexBookDataToOrderBook(bookData.result);
    }

    private mapBittrexBookDataToOrderBook(orderBook: any): OrderBook {
        return {
            asks: orderBook.sell.map(this.mapOrder),
            bids: orderBook.buy.map(this.mapOrder)
        }
    }

    private mapOrder(order: any): Order {
        return { exchange: "bittrex", quantity: order.Quantity, rate: order.Rate }
    }
}

module.exports = BittrexClient;
