import React, { Component } from 'react';
import './OrderBookComponentStyle.css';

class OrderBook extends Component<{}, { orderbook: any }> {
    constructor(props: object) {
        super(props);
        this.state = { orderbook: { asks: {}, bids: {} } };
    }

    aggregateOrders(orders: Array<any>, granularity: number) {
        
    }

    componentDidMount() {
        fetch('http://localhost:1420/api/orderbook/combined')
          .then(response => response.json())
          .then(orderbook => this.setState({ orderbook: orderbook }));
    }

    render() {
        return (
            <div>
                <div className="orderbook">
                    <div className="asks">
                        {
                            Object.keys(this.state.orderbook.asks).map((rate: string) => {
                                return <div className="orderbook-cell">
                                    <div className="orderbook-value">{rate}</div><div className="orderbook-align">|</div><div className="orderbook-value">{this.state.orderbook.asks[rate].toFixed(7)}</div> BTC
                                </div>
                            }).reverse()
                        }
                    </div>
                </div>

                <div>
                    <div className="bids">
                        {   
                            Object.keys(this.state.orderbook.bids).map((rate: string) => {
                                return <div className="orderbook-cell">
                                    <div className="orderbook-value">{rate}</div><div className="orderbook-align">|</div><div className="orderbook-value">{this.state.orderbook.bids[rate].toFixed(7)}</div> BTC
                                </div>
                            })
                        }
                    </div>
                </div>
            </div>
        )
    }
}

export default OrderBook;
