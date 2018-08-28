'use strict';

import * as https from 'https';

class BittrexClient {
    bittrexApiUrl: string;

    constructor(bittrexApiUrl: string) {
        this.bittrexApiUrl = `https://${bittrexApiUrl}/v1.1/public/`;
    }

    async getOrderBook(ticker = 'BTC-ETH') {
        let orderBookEndpoint = `${this.bittrexApiUrl}getorderbook?market=${ticker}&type=both`;

        let orderBook = await this.getFromBittrex(orderBookEndpoint);
        return orderBook;
    }

    private async getFromBittrex(endpoint: string) {
        return new Promise<object>((resolve, reject) => {
            https.get(endpoint, res => {
                let blob = '';

                res.on('data', (data: Buffer) => {
                    if (data) blob += data.toString();
                })
                .on('end', (data: Buffer) => {
                    if (data) blob += data.toString();
                    return resolve(JSON.parse(blob));
                });
            })
            .on('error', (e) => {
                return reject(e);
            });
        });
    }
}

const bittrexClient = new BittrexClient('bittrex.com/api');

bittrexClient.getOrderBook().then((result: any) => {
    console.log(result);
});

/*
    Orderbook call response:
    {
        success: bool,
        message: string,
        result: {
            buy: object[],
            sell: object[]
        }
    }
*/
