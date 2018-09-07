# orderbooker

Produces a combined orderbook for Bittrex, Poloniex and Coinbase.

Overlapping orders are highlighting in grey ![#f03c15](https://placehold.it/15/42ebf4/000000?text=+) `#42ebf4`.
If an order overlaps, that means that the order can immediately be filled by a standing order on another exchange.

Currently live on http://ec2-18-212-93-59.compute-1.amazonaws.com:1420/

Built using Node 8 & TypeScript for the RESTful web API and the exchange websocket clients with a shared Redis store.

## Run Tests
`npm test`

## Build & Run

Assuming you are running a Node environment, install typescript and tsc if you don't already have them

```npm install -g typescript tsc```

Run an `npm install` inside of the repository and then compile the project:
```tsc --project tsconfig.json```

Build and start the services and main web server using docker
```docker-compose up```

Once the containers start you should be able to visit the app on localhost:1420
