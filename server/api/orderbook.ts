import { Order } from "./order";

export interface OrderBook {
    exchange: string;
    bids: Order[];
    asks: Order[];
}
