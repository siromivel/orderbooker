import Redis from 'redis';
import BittrexClient from './client/bittrex_client';

const redis = Redis.createClient("redis://localhost:6379");
const bittrexClient = new BittrexClient(redis);

async function harvest() {
    console.log('Bittrex Scraper Running');
    await bittrexClient.getOrderBookWebsocket();
}

harvest();
