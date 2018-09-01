import { Application, Request, Response } from "express";
import { RedisClient } from "redis";

import path from 'path';

module.exports = (app: Application, redis: RedisClient) => {
    app.get('/', (req: Request, res: Response) => {
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
}
