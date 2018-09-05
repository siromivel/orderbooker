import { RedisClient } from "redis";
import WebSocket from 'ws';
import orderbookLib from "../../lib/orderbook-lib";

class CoinbaseClient {
    redis: RedisClient;
    orderbook: any;

    constructor(redis: RedisClient) {
        this.redis = redis;
        this.orderbook = {};
    }

    async getOrderBookWebsocket(tickers = ['ETH-BTC']) {
        let target = 'wss://ws-feed.pro.coinbase.com';
        let ws = new WebSocket(target);
        let coinbaseSubscription = {
            type: 'subscribe',
            product_ids: tickers,
            channels: ["level2"]
        }

        ws.on('open', () => {
            console.log('Connected to Coinbase');
            return ws.send(JSON.stringify(coinbaseSubscription));
        });;
        ws.on('message', (data: string) => {
            let parsed  = JSON.parse(data);
            this.handleWebsocketOrderbookData(parsed);
        });
        ws.on('error', (err) => {
            console.log('oops');
            console.log(err);
            process.exit(1);
        });
    }

    private handleWebsocketOrderbookData(rawData: any) {
        if (!rawData.type) throw Error('Unknown data received from Coinbase: ' + rawData);

        if(rawData.type === 'snapshot') {
            let rawBook = {
                rawBids: rawData.bids,
                rawAsks: rawData.asks
            }

            this.orderbook = orderbookLib.mapCoinbaseOrderbookData(rawBook);
        } else if (rawData.type === 'l2update') {
            rawData.changes.forEach((change: Array<string>) => {
                try {
                    this.orderbook = orderbookLib.processCoinbaseUpdate(this.orderbook, change);
                } catch(err) {
                    console.log(err.message + ' - Restarting');
                    process.exit(1);
                }
            });
        }
        this.redis.set("coinbase_book", JSON.stringify(this.orderbook));
    }
}

export default CoinbaseClient;
