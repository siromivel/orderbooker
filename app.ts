import { OrderBook } from "./api/orderbook"

const BittrexClient = require('./client/bittrex_client');

const bittrexClient = new BittrexClient('bittrex.com/api');

bittrexClient.getOrderBook().then((result: OrderBook) => {
    console.log(result);
});
