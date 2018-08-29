import { OrderBook } from "./api/orderbook";
import app from "./app";
import { Response, Request } from "express";
import { Order } from "./api/order";
const express = require('express');
const path = require('path');

const port = 1420;

const BittrexClient = require('./client/bittrex_client');
const PoloniexClient = require('./client/poloniex_client');
const bittrexClient = new BittrexClient('bittrex.com/api');
const poloniexClient = new PoloniexClient('poloniex.com/public?command=');

app.use(express.static('dist'));

app.listen(port, () => {
    console.log(`Listening on: ${port}`);
});

app.get('/', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../browser/index.html'));
});

app.get('/api/orderbook/bittrex', (req: Request, res: Response) => {
    bittrexClient.getOrderBook().then((result: OrderBook) => {
        res.status(200).send(result);
    });
});

app.get('/api/orderbook/poloniex', (req: Request, res: Response) => {
    poloniexClient.getOrderBook().then((result: OrderBook) => {
        res.status(200).send(result);
    });
});

app.get('/api/orderbook/combined', (req: Request, res: Response) => {
    Promise.all([bittrexClient.getOrderBook(), poloniexClient.getOrderBook()]).then((books) => {

        let askBook = books[0].asks.concat(books[1].asks);
        let bidBook = books[0].bids.concat(books[1].bids);

        let aggregatedBook = {
            asks: askBook.reduce((orderMap: any, order: Order) => {
                let rate = (Math.ceil(order.rate * 100000) / 100000).toString();
                orderMap[rate] = (orderMap[rate] || 0) + order.quantity;
                return orderMap;
            }, {}),
            bids: bidBook.reduce((orderMap: any, order: Order) => {
                let rate = (Math.ceil(order.rate * 100000) / 100000).toString();
                orderMap[rate] = (orderMap[rate] || 0) + order.quantity;
                return orderMap;
            }, {}),
        }
        res.send(aggregatedBook);
    });
});

app.get('/api/orderbook/stats', (req: Request, res: Response) => {
    Promise.all([bittrexClient.getOrderBook(), poloniexClient.getOrderBook()]).then((books) => {
        let askBook = books[0].asks.concat(books[1].asks);
        let bidBook = books[0].bids.concat(books[1].bids);

        let totalAsks = askBook.reduce((sum = 0, order: Order) => sum + order.quantity, 0);
        let totalBids = bidBook.reduce((sum = 0, order: Order) => sum + order.quantity, 0);

        res.send({
            totalAsks: totalAsks,
            totalBids: totalBids
        });
    });
});
