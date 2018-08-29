import { OrderBook } from "./api/orderbook";
import app from "./app";
import { Response, Request } from "express";

const port = 1420;

const BittrexClient = require('./client/bittrex_client');
const PoloniexClient = require('./client/poloniex_client');
const bittrexClient = new BittrexClient('bittrex.com/api');
const poloniexClient = new PoloniexClient('poloniex.com/public?command=');

app.listen(port, () => {
    console.log(`Listening on: ${port}`);
});

app.get('/', (req: Request, res: Response) => {
    res.send('Hey there.');
});

app.get('/orderbook/bittrex', (req: Request, res: Response) => {
    bittrexClient.getOrderBook().then((result: OrderBook) => {
        res.status(200).send(result);
    });
});

app.get('/orderbook/poloniex', (req: Request, res: Response) => {
    poloniexClient.getOrderBook().then((result: OrderBook) => {
        res.status(200).send(result);
    });
});

app.get('/orderbook/combined', (req: Request, res: Response) => {
    Promise.all([bittrexClient.getOrderBook(), poloniexClient.getOrderBook()]).then((books) => {
        res.send({
            bittrex: books[0],
            poloniex: books[1]
        });
    });
});
