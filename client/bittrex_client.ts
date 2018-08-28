import { ClientResponse } from "http";
import { OrderBook } from "../api/orderbook"

const https = require("https");

// const OrderBook = require("../api/orderbook");
'use strict';

class BittrexClient {
    bittrexApiUrl: string;

    constructor(bittrexApiUrl: string) {
        this.bittrexApiUrl = `https://${bittrexApiUrl}/v1.1/public/`;
    }

    async getOrderBook(ticker = 'BTC-ETH'): Promise<OrderBook> {
        let orderBookEndpoint = `${this.bittrexApiUrl}getorderbook?market=${ticker}&type=both`;

        let bookData = await this.getFromBittrex(orderBookEndpoint);

        return {
            exchange: "bittrex",
            buy: bookData.result.buy,
            sell: bookData.result.sell
        }
    }

    private async getFromBittrex(endpoint: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            https.get(endpoint, (res: ClientResponse) => {
                let blob = '';

                res.on('data', (data: Buffer) => {
                    if (data) blob += data.toString();
                })
                .on('end', (data: Buffer) => {
                    if (data) blob += data.toString();
                    return resolve(JSON.parse(blob));
                });
            })
            .on('error', (e: Error) => {
                return reject(e);
            });
        });
    }
}

module.exports = BittrexClient;
