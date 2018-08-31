import express from 'express';
import Redis from 'redis';

import app from "./app";
import env from "./config";
import BittrexClient from './client/bittrex_client';
import PoloniexClient from './client/poloniex_client';

process.env.NODE_ENV = process.env.NODE_ENV || 'development';
const redis = Redis.createClient("redis://localhost:6379");

const bittrexClient = new BittrexClient('bittrex.com/api', redis);
const poloniexClient = new PoloniexClient('poloniex.com/public?command=', redis);

redis.on('error', (err: Error) => {
    console.log("Redis Error: " + err);
})

app.use(express.static('dist'));
require('./routes')(app, redis, bittrexClient, poloniexClient);

app.listen(env.port, () => {
    console.log(`process.env.NODE_ENV + listening on: ${env.port}`);
});
