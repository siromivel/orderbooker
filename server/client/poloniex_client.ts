import { RedisClient } from "redis";
import ExchangeClient from '../client/exchange_client';
import WebSocket from 'ws';
import orderbookLib from "../../lib/orderbook-lib";

class PoloniexClient extends ExchangeClient {
    redis: RedisClient;
    orderbook: any;

    constructor(redis: RedisClient) {
        super();
        this.redis = redis;
        this.orderbook = {};
    }

    async getOrderBookWebsocket(ticker = 'BTC_ETH') {
        let target = 'wss://api2.poloniex.com';
        let ws = new WebSocket(target);

        ws.on('open', () => ws.send(JSON.stringify({ command: 'subscribe', channel: 148 })));
        ws.on('message', (data: string) => {
            let parsed  = JSON.parse(data);
            this.handleWebsocketOrderbookData(parsed);
        });
        ws.on('close', () => process.exit(1));
    }

    private handleWebsocketOrderbookData(rawData: Array<any>) {
        let bookData = [];
        let channelId = 'x';

        if (rawData && rawData[2]) {
            bookData = rawData[2][0];
            channelId = bookData[0];
        }

        switch(channelId) {
            case 'i':
                let rawOrderBook = {
                    rawAsks: bookData[1].orderBook[0],
                    rawBids: bookData[1].orderBook[1]
                }

                this.orderbook = orderbookLib.mapPoloniexOrderbookData(rawOrderBook)
                break;

            case 'o':
                try {
                    this.orderbook = orderbookLib.processPoloniexUpdate(this.orderbook, bookData);
                } catch(err) {
                    console.log(err.message + " - Restarting");
                    process.exit(1);
                }
                break;

            case 't':
                this.orderbook = orderbookLib.processPoloniexFill(this.orderbook, bookData);
                break;

            case 'x':
                console.log(`invalid data: ${rawData}`);
                process.exit(1);
                break;

            default:
                console.log(`unknown channel ID ${channelId}`);
                process.exit(1);
        }
        console.log("updated polo");
        this.redis.set("polo_book", JSON.stringify(this.orderbook));
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
}

export default PoloniexClient;
