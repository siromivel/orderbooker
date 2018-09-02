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
        let books = [getFromRedis('polo_book'), getFromRedis('trex_book')];

        let poloBook = await books[0] as any;
        let trexBook = await books[1] as any;

        trexBook.exchange = 'bittrex';
        poloBook.exchange = 'poloniex';

        books = [poloBook, trexBook];

        let combineBooks = (books: Array<any>) => {
            return books.reduce((combinedBook: any, book: any) => {
                ['asks', 'bids'].forEach((side) => {
                    Object.keys(book[side]).forEach((rate) => {
                        if (!combinedBook[side][rate]) {
                            combinedBook[side][rate] = {} as any;
                        }

                        combinedBook[side][rate][book.exchange] = book[side][rate];
                    });
                });
                return combinedBook;
            }, { asks: {}, bids: {} });
        }
        return combineBooks(books);
    }

    app.get('/api/orderbook/combined', (req: Request, res: Response) => {
        getCombinedOrderBook().then((combinedBook) => {
            return res.status(200).send(combinedBook);
        }).catch((err) => {
            return res.status(500).send(err);
        });
    });
}
