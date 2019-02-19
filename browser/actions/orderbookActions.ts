import * as types from './actionTypes';

function url() {
  return 'localhost:1420';
}

export function receiveOrderbook(json) {
    return { type: types.RECEIVE_ORDERBOOK, orderbook: json.orderbook };
}

export function fetchOrderbook() {
    return dispatch => {
        return fetch(url + '/api/orderbook/combined', {
            method: 'GET',
            mode: 'cors'
        })
        .then(response => response.json())
        .then(json => dispatch(receiveOrderbook(json)));
    }
}
