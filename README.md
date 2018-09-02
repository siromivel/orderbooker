# orderbooker

Produces a combined orderbook for bittrex and poloniex.

## Build & Run

Assuming you are running a Node environment, install typescript and tsc if you don't already have them

```npm install -g typescript tsc```

Compile the project
```tsc --project tsconfig.json```

Build and start the services and main web server
```docker-compose up```

Once the containers start you should be able to visit the app on localhost:1420
