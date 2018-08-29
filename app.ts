import { OrderBook } from "./api/orderbook"

const BittrexClient = require('./client/bittrex_client');
const PoloniexClient = require('./client/poloniex_client');
const bittrexClient = new BittrexClient('bittrex.com/api');
const poloniexClient = new PoloniexClient('poloniex.com/public?command=');

bittrexClient.getOrderBook().then((result: OrderBook) => {
    console.log(result);
});

poloniexClient.getOrderBook().then((result: OrderBook) => {
    console.log(result);
});
