import Redis from 'redis';
import BittrexClient from './client/bittrex_client';

const redis = Redis.createClient("redis://localhost:6379");
const bittrexClient = new BittrexClient('poloniex.com/public?command=');

async function harvest() {
    console.log('Bittrex Scraper Running');
    await bittrexClient.getOrderBookWebsocket();
}

harvest();
