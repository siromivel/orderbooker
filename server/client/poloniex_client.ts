import { RedisClient } from "redis";
import ExchangeClient from '../client/exchange_client';
import WebSocket, { Data } from 'ws';

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

                this.orderbook = this.mapPoloniexBookDataToOrderBook(rawOrderBook)
                break;

            case 'o':
                this.updateOrderBookWithChange(bookData);
                break;

            case 't':
                this.updateOrderBookWithTrade(bookData);
                break;

            case 'x':
                console.log(`invalid data: ${rawData}`);
                break;

            default:
                console.log(`unknown channel ID ${channelId}`);
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

    private async updateOrderBookWithChange(payload: Array<any>) {
        let updateType = payload[1];
        
        if (updateType) {
            if (+payload[3] === 0) {
                delete this.orderbook.bids[payload[2]]
            } else {
                this.orderbook.bids[payload[2]] = +[payload[3]];
            }
        } else {
            if (+payload[3] === 0) {
                delete this.orderbook.asks[payload[2]]
            } else {
                this.orderbook.asks[payload[2]] = +[payload[3]];
            }
        }
    }

    private async updateOrderBookWithTrade(payload: Array<any>) {
        let updateType = payload[1];

        if (updateType) {
            if (this.orderbook.bids[payload[2]] - +payload[3] <= 0) {
                delete this.orderbook.bids[payload[2]]
            } else {
                this.orderbook.bids[payload[2]] -= +[payload[3]];
            }
        } else {
            if (this.orderbook.asks[payload[2]] - +payload[3] === 0) {
                delete this.orderbook.asks[payload[2]]
            } else {
                this.orderbook.asks[payload[2]] -= +[payload[3]];
            }
        }
    }

    private mapPoloniexBookDataToOrderBook(orderBook: any): any {
        let aggregateLevels = (levels: any) => {
            return Object.keys(levels).reduce((levelMap: any, level: string) => {
                levelMap[level] = +levels[level]
                return levelMap;
            }, {});
        }

        return {
            asks: aggregateLevels(orderBook.rawAsks),
            bids: aggregateLevels(orderBook.rawBids)
        }
    }
}

export default PoloniexClient;
