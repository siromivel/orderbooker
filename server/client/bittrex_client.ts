import { OrderBook } from '../api/orderbook'
import ExchangeClient from '../client/exchange_client';
import zlib from 'zlib';
import { RedisClient } from 'redis';
import orderbookLib from '../../lib/orderbook-lib';

const signalR = require('signalr-client');

class BittrexClient extends ExchangeClient {
    redis: RedisClient;
    orderbook: any;

    constructor(redis: RedisClient) {
        super();
        this.redis = redis;
        this.orderbook = {};
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
                            this.orderbook = orderbookLib.mapBittrexOrderbookData(parsed);

                            this.redis.set("trex_book", JSON.stringify(this.orderbook), (err: Error|null) => {
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
            disconnected: () => {
                console.log('Lost connection to Bittrex - reconnecting');
                signalRClient.start();
            },
            onerror: (err: Error) => {
                console.log("Websocket Error: " + err.message);
                process.exit(1);
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
                            this.redis.set("trex_book", JSON.stringify(this.orderbook), (err: Error|null) => {
                                if (err) throw err;
                                console.log("Updated Bittrex orderbook");
                            });
                        });
                    });
                }
            }
        }
    }

    private updateOrderbook(payload: any) {
        payload.S.forEach((update: any) => {
            this.orderbook = orderbookLib.processBittrexUpdate(this.orderbook, update, 'asks')
         });

         payload.Z.forEach((update: any) => {
            this.orderbook = orderbookLib.processBittrexUpdate(this.orderbook, update, 'bids')
         });

         payload.f.forEach((update: any) => {
             this.orderbook = orderbookLib.processBittrexFill(this.orderbook, update);
         });
    }
}

export default BittrexClient;
