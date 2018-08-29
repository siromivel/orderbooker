import { OrderBook } from "./api/orderbook";
import app from "./app";
import { Response, Request } from "express";
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
        res.send({
            bids: books[0].bids.concat(books[1].bids),
            asks: books[0].asks.concat(books[1].asks)
        });
    });
});
