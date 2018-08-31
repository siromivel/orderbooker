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
        getFromRedis('trex_book')
            .then(book => res.status(200).send(book))
            .catch(res.status(500).send)
    });

    app.get('/api/orderbook/poloniex', (req: Request, res: Response) => {
        getFromRedis('polo_book')
            .then(book => res.status(200).send(book))
            .catch(res.status(500).send)
    });

    async function getFromRedis(key: string) {
        return new Promise((resolve, reject) => {
            return redis.get(key, (err, val) => {
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

    async function getCombinedOrderBook() {
        let bittrexBook  = await getFromRedis('trex_book');
        let poloniexBook = await getFromRedis('polo_book');

        let combineBooks = (bookOne: any, bookTwo: any) => {
            Object.keys(bookOne).forEach((side) => {
                Object.keys(side).forEach((rate) => {
                    if (bookOne[side][rate]) {
                        bookOne[side][rate] += bookTwo[side][rate];
                    } else {
                        bookOne[side][rate] = bookTwo[side][rate];
                    }
                });
            });

            return bookOne;
        }

        return combineBooks(poloniexBook, bittrexBook);
    }

    app.get('/api/orderbook/combined', (req: Request, res: Response) => {
        getCombinedOrderBook()
            .then(book => res.status(200).send(book))
            .catch(res.status(500).send)
    });

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
