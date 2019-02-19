import { Application, Request, Response } from "express";
import { RedisClient } from "redis";

import path from 'path';
import orderbookLib from '../lib/orderbook-lib'

module.exports = (app: Application, redis: RedisClient) => {
    app.get('/', (req: Request, res: Response) => {
        res.sendFile(path.join(__dirname, '../browser/index.html'));
    });

    app.get('/api/orderbook/bittrex', (req: Request, res: Response) => {
        getFromRedis('trex_book')
            .then(book => res.status(200).send(book))
            .catch(res.status(500).send)
    });

    app.get('/api/orderbook/coinbase', (req: Request, res: Response) => {
        getFromRedis('coinbase_book')
            .then(book => res.status(200).send(book))
            .catch(res.status(500).send)
    });

    app.get('/api/orderbook/poloniex', (req: Request, res: Response) => {
        getFromRedis('polo_book')
            .then(book => res.status(200).send(book))
            .catch(res.status(500).send)
    });

    app.get('/api/orderbook/combined', (req: Request, res: Response) => {
        getCombinedOrderBook().then((combinedBook) => {
            return res.status(200).send(combinedBook);
        }).catch((err) => {
            return res.status(500).send(err);
        });
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
        let books = [
            getFromRedis('polo_book'),
            getFromRedis('trex_book'),
            getFromRedis('coinbase_book')
        ];

        let poloBook = await books[0] as any;
        let trexBook = await books[1] as any;
        let coinbaseBook = await books[2] as any;

        trexBook.exchange = 'bittrex';
        poloBook.exchange = 'poloniex';
        coinbaseBook.exchange = 'coinbase';

        books = [coinbaseBook, poloBook, trexBook];

        return orderbookLib.combineBooks(books);
    }
}
