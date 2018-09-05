import Redis from 'redis';
import PoloniexClient from './client/poloniex_client';

const redis = Redis.createClient('redis://redis:6379');
const poloniexClient = new PoloniexClient(redis);

async function harvest() {
    console.log('Poloniex Scraper Running');
    await poloniexClient.getOrderBookWebsocket();
}

harvest();
