import React, { Component } from "react";

class App extends Component {
  constructor(props: object) {
    super(props);
    this.state = { orderbook: {} };
  }

  componentDidMount() {
    fetch('http://localhost:1420/api/orderbook/combined')
      .then(response => response.json())
      .then(orderbook => this.setState({ orderbook: orderbook }));
  }

  render() {
    return (
      <div>
        Send Corn
        <div>
          Enjoy this
          {JSON.stringify(this.state)}
        </div>
      </div>
    )
  }
}

export default App;
