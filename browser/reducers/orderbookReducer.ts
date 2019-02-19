import initialState from './initialState';
import { FETCH_ORDERBOOK, RECEIVE_ORDERBOOK } from '../actions/actionTypes';

export default function orderbook(state = initialState.orderbook, action) {
    let freshState;

    switch (action.type) {
        case FETCH_ORDERBOOK:
            return action;
        case RECEIVE_ORDERBOOK:
            freshState = action.orderbook;
            return freshState;
        default:
            return state;
    }
}
