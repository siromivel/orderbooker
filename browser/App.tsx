import React, { Component } from "react";
import OrderBook from "./OrderBook";

class App extends Component {
  constructor(props: object) {
    super(props);
    this.state = { };
  }

  render() {
    return (
      <div>
        Send Corn
        <div>
          <OrderBook />
        </div>
      </div>
    )
  }
}

export default App;
