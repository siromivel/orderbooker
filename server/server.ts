import express from 'express';
import cors from 'cors';
import Redis from 'redis';

import app from "./app";
import env from "./config.dev";
import BittrexClient from './client/bittrex_client';
import PoloniexClient from './client/poloniex_client';

process.env.NODE_ENV = process.env.NODE_ENV || 'development';
const redis = Redis.createClient("redis://localhost:6379");

const bittrexClient = new BittrexClient(redis);
const poloniexClient = new PoloniexClient(redis);

redis.on('error', (err: Error) => {
    console.log("Redis Error: " + err);
})

app.use(cors());
app.use(express.static('dist'));
require('./routes')(app, redis, bittrexClient, poloniexClient);

app.listen(env.port, () => {
    console.log(`process.env.NODE_ENV + listening on: ${env.port}`);
});
