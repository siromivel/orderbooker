import React, { Component } from "react";

const chartSectionStyle = {
    display: 'inline-block',
    maxWidth: '50%',
    minWidth: '50%'
}

const askStyle = {
    color: 'red',
    display: 'inline-block'
}

const bidStyle = {
    color: 'green',
    display: 'inline-block'
}

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
        console.log(this.state.orderbook);
        return (
            <div>
                <div>
                    {/* <h2>Ask</h2> */}
                    <div style={askStyle}>
                        {
                            Object.keys(this.state.orderbook.asks).map((rate: string) => {
                                return <div>{rate} : {this.state.orderbook.asks[rate]} BTC</div>
                            }).reverse()
                        }
                        {/* {this.state.orderbook.asks.map((ask: any) => {
                            return <span>{`${ask.quantity} @ ${ask.rate}`} </span>
                        })}     */}
                    </div>
                </div>

                <div>
                    {/* <h2>Bid</h2> */}
                    <div style={bidStyle}>
                        {   
                            Object.keys(this.state.orderbook.bids).map((rate: string) => {
                                return <div>{rate} : {this.state.orderbook.bids[rate]} BTC</div>
                            })
                        }
                        {/* {this.state.orderbook.bids.map((bid: any) => {
                            return <span>{`${bid.quantity} @ ${bid.rate}`}</span>
                        })} */}
                    </div>
                </div>
            </div>
        )
    }
}

export default OrderBook;
