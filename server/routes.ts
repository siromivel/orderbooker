import { Application, Request, Response } from "express";
import { OrderBook } from "./api/orderbook";
import { Order } from "./api/order";
import { RedisClient } from "redis";

import path from 'path';

import BittrexClient from './client/bittrex_client';
import PoloniexClient from './client/poloniex_client';

module.exports = (app: Application, redis: RedisClient, bittrexClient: BittrexClient, poloniexClient: PoloniexClient) => {
    app.get('/', (req: Request, res: Response) => {
        (async function() { await bittrexClient.getOrderBookWebsocket() })();

        res.sendFile(path.join(__dirname, '../browser/index.html'));
    });

    app.get('/api/orderbook/bittrex', (req: Request, res: Response) => {
        bittrexClient.getOrderBook().then((result: OrderBook) => {
            res.status(200).send(result);
        });
    });

    app.get('/api/orderbook/poloniex', (req: Request, res: Response) => {
        // poloniexClient.getOrderBook().then((result: OrderBook) => {
        //     res.status(200).send(result);
        // });
        redis.get("polo_book", (err, val) => {
            err ? res.status(500).send(err) : res.status(200).send(JSON.parse(val))
        });
    });

    // app.get('/api/orderbook/combined', (req: Request, res: Response) => {
    //     let aggregateOrders = (orders: Order[]) => {
    //         return orders.reduce((orderMap: any, order: Order) => {
    //             let rate = (Math.ceil(order.rate * 100000) / 100000).toString();
    //             orderMap[rate] = (orderMap[rate] || 0) + order.quantity;
    //             return orderMap;
    //         }, {})
    //     }

    //     Promise.all([bittrexClient.getOrderBook(), poloniexClient.getOrderBook()]).then((books) => {
    //         let asks = books[0].asks.concat(books[1].asks);
    //         let bids = books[0].bids.concat(books[1].bids);

    //         let aggregatedBook = {
    //             asks: aggregateOrders(asks),
    //             bids: aggregateOrders(bids),
    //         }

    //         redis.set("orderbook", JSON.stringify((aggregatedBook)));
    //         redis.get("orderbook", (err, val) => err ? res.status(500).send(err) : res.status(200).send(JSON.parse(val)));
    //     });
    // });

    // app.get('/api/orderbook/stats', (req: Request, res: Response) => {
    //     Promise.all([bittrexClient.getOrderBook(), poloniexClient.getOrderBook()]).then((books) => {
    //         let askBook = books[0].asks.concat(books[1].asks);
    //         let bidBook = books[0].bids.concat(books[1].bids);

    //         let totalAsks = askBook.reduce((sum = 0, order: Order) => sum + order.quantity, 0);
    //         let totalBids = bidBook.reduce((sum = 0, order: Order) => sum + order.quantity, 0);

    //         res.send({
    //             totalAsks: totalAsks,
    //             totalBids: totalBids
    //         });
    //     });
    // });
}
