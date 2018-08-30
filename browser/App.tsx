import React, { Component } from "react";
import OrderBook from "./OrderBookComponent";

class App extends Component {
  constructor(props: object) {
    super(props);
    this.state = { };
  }

  render() {
    return (
      <div>
        <div>
          <OrderBook />
        </div>
      </div>
    )
  }
}

export default App;
