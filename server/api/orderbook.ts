import { Order } from "./order";

export interface OrderBook {
    bids: Order[];
    asks: Order[];
}
