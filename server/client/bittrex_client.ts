import { Order } from '../api/order'
import { OrderBook } from '../api/orderbook'
import ExchangeClient from '../client/exchange_client';
import zlib from 'zlib';
import { RedisClient } from 'redis';

const signalR = require('signalr-client');

class BittrexClient extends ExchangeClient {
    redis: RedisClient;

    constructor(redis: RedisClient) {
        super();
        this.redis = redis;
    }

    async getOrderBookWebsocket(ticker = 'BTC-ETH') {
        const target = 'wss://socket.bittrex.com/signalr';
        const signalRClient = new signalR.client(target, ['c2'], 10, true);

        await signalRClient.start();

        signalRClient.serviceHandlers = {
            connected: () => {
                signalRClient.call('c2', 'QueryExchangeState', ticker).done((err: Error, result: any) => {
                    let debased = Buffer.from(result, 'base64');

                    zlib.inflateRaw(debased, (err: Error|null, bufferData) => {
                        if (err) return console.log(err);
                        try {
                            let parsed = JSON.parse(bufferData.toString());
                            let mapped = this.mapBittrexBookDataToOrderBook(parsed);

                            this.redis.set("trex_book", JSON.stringify(mapped), (err: Error|null) => {
                                if (err) throw err;
                                console.log("Successfully imported Bittrex orderbook");
                            });
                        } catch(e) {
                            console.log(e);
                        }
                    });
                });

                signalRClient.call('c2', 'SubscribeToExchangeDeltas', ticker).done((err: Error, result: any) => {
                    if (result === true) console.log('Subscribed to Bittrex data feed');
                });
            },
            messageReceived: (message: any) => {
                let debased = Buffer.from(message.utf8Data);
                let data = JSON.parse(debased.toString());

                if (data && data.M) {
                    data.M.forEach((M: any) => {
                        let d = Buffer.from(M.A[0], 'base64');

                        zlib.inflateRaw(d, (err: Error|null, d: any) => {
                            if (err) console.log(err);
                            let parsed = JSON.parse(d.toString());
                            this.updateOrderbook(parsed);
                        });
                    });
                }
            }
        }
    }

    async getFromRedis(key: string): Promise<any> {
        return new Promise((resolve, reject) => {
            return this.redis.get(key, (err, val) => {
                if (err) return reject(err);
                try {
                    let parsed = JSON.parse(val);
                    return resolve(parsed);
                } catch(e) {
                    return reject(e);
                }
            });
        });
    }

    private async updateOrderbook(payload: any) {
        let orderbook = await this.getFromRedis('trex_book');

        payload.Z.forEach((update: any) => {
            let type = update.TY

            switch(type) {
                case 1:
                    delete orderbook[update.R]
                    break;

                case 0:
                case 2:
                    orderbook[update.R] = update.Q
                    break;

                default:
                    throw new Error("Unknown Bittrex update type");
            }
        });

        this.redis.set("trex_book", JSON.stringify(orderbook), (err: Error|null) => {
            if (err) throw err;
            console.log("Updated Bittrex orderbook");
        });
    }

    private mapBittrexBookDataToOrderBook(orderBook: any): OrderBook {
        let aggregateLevels = (levels: Array<any>) => {
            return levels.reduce((levelMap: any, level: any) => {
                levelMap[level.R] = level.Q;
                return levelMap;
            }, {});
        }

        return {
            asks: aggregateLevels(orderBook.S),
            bids: aggregateLevels(orderBook.Z)
        }
    }
}

export default BittrexClient;
