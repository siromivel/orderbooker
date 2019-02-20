import * as types from './actionTypes';

function url() {
  return 'http://localhost:1420';
}

export function receiveOrderbook(json: object) {
    return { type: types.RECEIVE_ORDERBOOK, orderbook: json };
}

export function fetchOrderbook() {
    return (dispatch: Function) => {
        return fetch(url() + '/api/orderbook/combined', {
            method: 'GET',
            mode: 'cors'
        })
        .then(response => response.json())
        .then(json => dispatch(receiveOrderbook(json)));
    }
}
