import { Order } from '../api/order'
import { OrderBook } from '../api/orderbook'
import ExchangeClient from '../client/exchange_client';
import zlib from 'zlib';
import { RedisClient } from 'redis';

const signalR = require('signalr-client');

class BittrexClient extends ExchangeClient {
    bittrexApiUrl: string;
    redis: RedisClient;

    constructor(bittrexApiUrl: string, redis: RedisClient) {
        super();
        this.bittrexApiUrl = `https://${bittrexApiUrl}/v1.1/public/`;
        this.redis = redis;
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
                            this.redis.set("trex_book", JSON.stringify(this.mapBittrexBookDataToOrderBook(parsed)));
                        } catch(e) {
                            console.log(e);
                        }
                    });
                });
            }
        }
    }

    private mapBittrexBookDataToOrderBook(orderBook: any): OrderBook {
        let aggregateLevels = (levels: Array<any>) => {
            return levels.reduce((levelMap: any, level: any) => {
                levelMap[level.R] = level.Q;
                return levelMap;
            }, {});
        }

        return {
            asks: aggregateLevels(orderBook.Z),
            bids: aggregateLevels(orderBook.S)
        }
    }
}

export default BittrexClient;
