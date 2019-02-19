import { combineReducers } from 'redux';
import orderbook from './orderbookReducer';

export const rootReducer = combineReducers({ orderbook });
export default rootReducer;
