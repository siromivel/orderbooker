import Redis from 'redis';
import CoinbaseClient from './client/coinbase_client';

const redis = Redis.createClient('redis://localhost:6379');
const coinbaseClient = new CoinbaseClient(redis);

async function harvest() {
    console.log('Coinbase Scraper Running');
    await coinbaseClient.getOrderBookWebsocket();
}

harvest();
