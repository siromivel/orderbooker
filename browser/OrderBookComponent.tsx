import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import * as orderbookActions from './actions/orderbookActions';
import React, { Component } from 'react';
import './OrderBookComponentStyle.css';

class OrderBook extends Component<{ orderbookActions: any; orderbook: any }, {}> {
    refreshInterval: any;

    componentDidMount() {
        this.refreshInterval = setInterval(() => {
            this.props.orderbookActions.fetchOrderbook()
        }
        , 5000);
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
                                this.renderSide(this.props.orderbook.bids).reverse()
                            }
                        </div>
                        <div className="orderbook-total">Total Bids: { this.tallyOrderbookSide(this.props.orderbook.bids) } ETH</div>
                    </div>
                    <div className="orderbook-column">
                        <h2 className="side-label">Ask</h2>
                        <div className="order-pane asks">
                            {
                                this.renderSide(this.props.orderbook.asks)
                            }
                        </div>
                        <div className="orderbook-total">Total Asks: { this.tallyOrderbookSide(this.props.orderbook.asks) } ETH</div>
                    </div>
                </div>
            </div>
        )
    }
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        orderbookActions: bindActionCreators(orderbookActions, dispatch)
    }
}

function mapStateToProps(props: { orderbook: object }) {
    return {
        orderbook: props.orderbook
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(OrderBook);
