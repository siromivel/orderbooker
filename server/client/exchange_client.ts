import { ClientResponse } from "http";
import https from "https";

"use strict";

abstract class ExchangeClient {
    async getExchangeData(endpoint: string): Promise<any> {
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

export default ExchangeClient;
