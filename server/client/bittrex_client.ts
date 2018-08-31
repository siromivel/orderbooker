import { Order } from '../api/order'
import { OrderBook } from '../api/orderbook'
import ExchangeClient from '../client/exchange_client';
import zlib from 'zlib';

const signalR = require('signalr-client');

class BittrexClient extends ExchangeClient {
    bittrexApiUrl: string;

    constructor(bittrexApiUrl: string) {
        super();
        this.bittrexApiUrl = `https://${bittrexApiUrl}/v1.1/public/`;
    }

    async getOrderBook(ticker = 'BTC-ETH'): Promise<OrderBook> {
        const orderBookEndpoint = `${this.bittrexApiUrl}getorderbook?market=${ticker}&type=both&depth=1000`;

        let bookData = await this.getExchangeData(orderBookEndpoint);
        return this.mapBittrexBookDataToOrderBook(bookData.result);
    }

    async getOrderBookWebsocket(ticker = 'BTC-ETH') {
        const target = 'wss://socket.bittrex.com/signalr';
        const signalRClient = new signalR.client(target, ['c2'], 10, true);

        await signalRClient.start();

        signalRClient.serviceHandlers = {
            connected: () => {
                signalRClient.call('c2', 'QueryExchangeState', ticker).done((err: Error, result: any) => {
                    let debased = Buffer.from(result, 'base64');
                    let resData;

                    zlib.inflateRaw(debased, (err, bufferData) => {
                        try {
                            let parsed = JSON.parse(bufferData.toString());
                            console.log(parsed);
                        } catch(e) {
                            console.log(e);
                        }
                    });
                });
            }
        }
    }

    private mapBittrexBookDataToOrderBook(orderBook: any): OrderBook {
        return {
            asks: orderBook.sell.map(this.mapOrder),
            bids: orderBook.buy.map(this.mapOrder)
        }
    }

    private mapOrder(order: any): Order {
        return { exchange: 'bittrex', quantity: order.Quantity, rate: order.Rate }
    }
}

export default BittrexClient;
