import React, { Component } from 'react';
import './OrderBookComponentStyle.css';

class OrderBook extends Component<{}, { orderbook: any }> {
    refreshInterval: any;
    target: string;

    constructor(props: object) {
        super(props);
        this.state = { orderbook: { asks: {}, bids: {} } };
        this.target = 'localhost:1420/api';
    }

    componentDidMount() {
        this.refreshInterval = setInterval(() => {
            return fetch(this.target + '/orderbook/combined')
                .then(response => response.json())
                .then(orderbook => { return this.setState({ orderbook: orderbook }) });
        }
        , 2000);
    }

    componentWillUnmount() {
        clearInterval(this.refreshInterval);
    }

    tallyOrderbookSide(side: any) {
        return Object.keys(side).reduce((sum: number, rate: any) => {
            sum += Object.keys(side[rate]).reduce((s: number, exchange: any) => {
                s += +side[rate][exchange] || 0;
                return s;
            }, 0);
            return sum;
        }, 0);
    }

    renderExchangeInfo(trexVolume: number, poloVolume: number, coinbaseVolume: number) {
        return (
                <div className="orderbook-value orderbook-exchange-info">
                    {this.renderExchange('Bittrex', trexVolume)}
                    {this.renderExchange('Poloniex', poloVolume)}
                    {this.renderExchange('Coinbase', coinbaseVolume)}
                </div>
            )
    }

    renderExchange(exchange: string, volume: number) {
        if(volume) {
            return (
                <div className="orderbook-exchange-quantity">{exchange}: {volume.toPrecision(8)}</div>
            )
        }
    }

    renderSide(side: any) {
        return (
            Object.keys(side).map((rate, i) => {
                let orderbookAtRate = side[rate];
                let poloVolume = 0;
                let trexVolume = 0;
                let coinbaseVolume = 0;

                if (orderbookAtRate['poloniex']) {
                    poloVolume += orderbookAtRate['poloniex'];
                }

                if (orderbookAtRate['bittrex']) {
                    trexVolume += orderbookAtRate['bittrex'];
                }

                if (orderbookAtRate['coinbase']) {
                    coinbaseVolume += orderbookAtRate['coinbase'];
                }

                let totalAtRate = poloVolume + trexVolume + coinbaseVolume;

                return <div key={i} className={"orderbook-cell" + (orderbookAtRate.overlap ? ' orderbook-overlap' : '')}>
                    <div className="orderbook-value orderbook-rate">{rate}</div>
                    <div className="orderbook-value orderbook-quantity">{totalAtRate.toPrecision(8)} ETH</div>
                    { this.renderExchangeInfo(trexVolume, poloVolume, coinbaseVolume) }
                </div>
            })
        )
    }

    render() {
        return (
            <div>
                <div className="orderbook">
                    <div className="orderbook-column">
                        <h2 className="side-label">Bid</h2>
                        <div className="order-pane bids">
                            {
                                this.renderSide(this.state.orderbook.bids).reverse()
                            }
                        </div>
                        <div className="orderbook-total">Total Bids: { this.tallyOrderbookSide(this.state.orderbook.bids) } ETH</div>
                    </div>
                    <div className="orderbook-column">
                        <h2 className="side-label">Ask</h2>
                        <div className="order-pane asks">
                            {
                                this.renderSide(this.state.orderbook.asks)
                            }
                        </div>
                        <div className="orderbook-total">Total Asks: { this.tallyOrderbookSide(this.state.orderbook.asks) } ETH</div>
                    </div>
                </div>
            </div>
        )
    }
}

export default OrderBook;
