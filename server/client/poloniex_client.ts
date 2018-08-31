import { Order } from '../api/order'
import { OrderBook } from '../api/orderbook'
import { RedisClient } from "redis";
import ExchangeClient from '../client/exchange_client';
import WebSocket, { Data } from 'ws';

class PoloniexClient extends ExchangeClient {
    poloniexApiUrl: string;
    redis: RedisClient;

    constructor(poloniexApiUrl: string, redis: RedisClient) {
        super();
        this.poloniexApiUrl = `https://${poloniexApiUrl}`
        this.redis = redis;
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
        let bookData = rawData[2][0];
        let dataType = bookData[0];

        switch(dataType) {
            case 'i':
                let rawOrderBook = {
                    rawAsks: bookData[1].orderBook[0],
                    rawBids: bookData[1].orderBook[1]
                }

                this.redis.set("polo_book", JSON.stringify(this.mapPoloniexBookDataToOrderBook(rawOrderBook)));

            default:
                console.log("unknown data type");
                console.log(bookData);
        }
    }

    // async getOrderBook(ticker = 'BTC_ETH'): Promise<OrderBook> {
    //     let orderBookEndpoint = `${this.poloniexApiUrl}returnOrderBook&currencyPair=${ticker}&depth=100`;

    //     let bookData = await this.getExchangeData(orderBookEndpoint);
    //     return this.mapPoloniexBookDataToOrderBook(bookData);
    // }

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

    // private mapBookLevel(order: any): Order {
    //     return { exchange: 'poloniex', quantity: order[1], rate: +order[0] }
    // }
}

export default PoloniexClient;
