import { expect } from 'chai';
import orderbookLib from '../lib/orderbook-lib';

describe('orderbookLib', () => {
    describe('combineOrderbook', () => {
        it('generates a combined orderbook', () => {
            let poloBook = {
                asks: {
                    '0.170': 3.50,
                    '0.150': 99
                },
                bids: {
                    '0.1499': 350,
                    '0.080': 0.99
                },
                exchange: 'poloniex'
            };

            let trexBook = {
                asks: {
                    '0.171': 3.75,
                    '0.155': 999
                },
                bids: {
                    '0.1487': 9001,
                    '0.070': 240
                },
                exchange: 'bittrex'
            }

            let coinbaseBook = {
                asks: {
                    '0.175': 10,
                    '0.14990001': 204.50943
                },
                bids: {
                    '0.1487': 9001,
                    '0.060': 175
                },
                exchange: 'coinbase'
            }

            let expected = {
                asks: {
                    '0.17500000': { coinbase: 10, overlap: false },
                    '0.17100000': { bittrex: 3.75, overlap: false },
                    '0.17000000': { poloniex: 3.50, overlap: false },
                    '0.15500000': { bittrex: 999, overlap: false },
                    '0.15000000': { poloniex: 99, overlap: false },
                    '0.14990001': { coinbase: 204.50943, overlap: false }
                },
                bids: {
                    '0.14990000': { poloniex: 350, overlap: false },
                    '0.14870000': { bittrex: 9001, coinbase: 9001, overlap: false },
                    '0.08000000': { poloniex: 0.99, overlap: false },
                    '0.07000000': { bittrex: 240, overlap: false },
                    '0.06000000': { coinbase: 175, overlap: false }
                }
            }

            let orderbook = orderbookLib.combineBooks([coinbaseBook, poloBook, trexBook]);

            expect(orderbook).to.deep.equal(expected)
        });

        it('flags overlapping orders', () => {
            let poloBook = {
                asks: {
                    '0.170': 3.50,
                    '0.150': 99
                },
                bids: {
                    '0.1499': 350,
                    '0.080': 0.99
                },
                exchange: 'poloniex'
            };

            let trexBook = {
                asks: {
                    '0.171': 3.75,
                    '0.155': 999
                },
                bids: {
                    '0.151': 9001,
                    '0.070': 240
                },
                exchange: 'bittrex'
            }

            let expected = {
                asks: {
                    '0.17000000': { poloniex: 3.50, overlap: false },
                    '0.17100000': { bittrex: 3.75, overlap: false },
                    '0.15500000': { bittrex: 999, overlap: false },
                    '0.15000000': { poloniex: 99, overlap: true }
                },
                bids: {
                    '0.14990000': { poloniex: 350, overlap: false },
                    '0.15100000': { bittrex: 9001, overlap: true },
                    '0.08000000': { poloniex: 0.99, overlap: false },
                    '0.07000000': { bittrex: 240, overlap: false }
                }
            }

            let orderbook = orderbookLib.combineBooks([poloBook, trexBook]);
            expect(orderbook).to.deep.equal(expected)
        });
    });

    describe('import orderbooks', () => {
        let expectedOrderbook;

        beforeEach(() => {
            expectedOrderbook = {
                asks: {
                    '0.170': 3.50,
                    '0.150': 99
                },
                bids: {
                    '0.1499': 350,
                    '0.080': 0.99
                }
            }
        });

        it('parses raw bittrex book data', () => {
            let rawTrexBook = {
                S: [
                    { R: '0.170', Q: '3.50' },
                    { R: '0.150', Q: '99' }
                ],
                Z: [
                    { R: '0.1499', Q: '350' },
                    { R: '0.080', Q: '0.99' }
                ]
            }

            expect(orderbookLib.mapBittrexOrderbookData(rawTrexBook)).to.deep.equal(expectedOrderbook);
        });

        it('parses raw coinbase book data', () => {
            let rawCoinbaseBook = {
                rawAsks: [
                    ['0.170', '3.50'],
                    ['0.150', '99']
                ],
                rawBids: [
                    ['0.1499', '350'],
                    ['0.080', '0.99']
                ]
            }

            expect(orderbookLib.mapCoinbaseOrderbookData(rawCoinbaseBook)).to.deep.equal(expectedOrderbook);
        });

        it('parses raw poloniex book data', () => {
            let rawPoloBook = {
                rawAsks: {
                            '0.170': '3.50',
                            '0.150': '99'
                        },
                rawBids: {
                        '0.1499': '350',
                        '0.080': '0.99'
                }
            }

            expect(orderbookLib.mapPoloniexOrderbookData(rawPoloBook)).to.deep.equal(expectedOrderbook);
        });
    });

    describe('handles fills & updates', () => {
        let orderbook, updatedOrderbook;
        beforeEach(() => {
            orderbook = {
                asks: {
                    '0.170': 3.50,
                    '0.150': 99
                },
                bids: {
                    '0.1499': 350,
                    '0.080': 0.99
                }
            }

            updatedOrderbook = {
                asks: {
                    '0.170': 3.50
                },
                bids: {
                    '0.1499': 50,
                    '0.080': 0.99
                }
            }
        });

        it('buys on bittrex', () => {
            let buy = {
                'OT': 'BUY',
                'R': '0.150',
                'Q': '49'
            }

            orderbook = orderbookLib.processBittrexFill(orderbook, buy);

            expect(orderbook.asks['0.150']).to.equal(50);

            buy = {
                'OT': 'BUY',
                'R': '0.150',
                'Q': '50'
            }

            orderbook = orderbookLib.processBittrexFill(orderbook, buy);

            expect(orderbook.asks['0.150']).to.be.undefined;
        });

        it('sells on bittrex', () => {
            let sell = {
                'OT': 'SELL',
                'R': '0.1499',
                'Q': '101.24'
            }

            orderbook = orderbookLib.processBittrexFill(orderbook, sell);

            expect(orderbook.bids['0.1499']).to.equal(248.76);

            sell = {
                'OT': 'SELL',
                'R': '0.1499',
                'Q': '248.76'
            }

            orderbook = orderbookLib.processBittrexFill(orderbook, sell);

            expect(orderbook.bids['0.1499']).to.be.undefined;
        });

        it('order book updates on bittrex', () => {
            let update = {
                'TY': 1,
                'R': '0.150',
                'Q': '1000'
            }
            orderbook = orderbookLib.processBittrexUpdate(orderbook, update, 'asks');

            expect(orderbook.asks['0.150']).to.be.undefined;

            update = {
                'TY': 2,
                'R': '0.1499',
                'Q': '50'
            }
            orderbook = orderbookLib.processBittrexUpdate(orderbook, update, 'bids');

            expect(orderbook).to.deep.equal(updatedOrderbook);
        });

        it('order book updates on coinbase', () => {
            let update = ['sell', '0.150', '0'];
            orderbook = orderbookLib.processCoinbaseUpdate(orderbook, update);

            expect(orderbook.asks['0.150']).to.be.undefined;

            update = ['buy', '0.1499', '50'];
            orderbook = orderbookLib.processCoinbaseUpdate(orderbook, update);

            expect(orderbook).to.deep.equal(updatedOrderbook);
        });

        it('buys on poloniex', () => {
            let buy = ['t', 1, '0.150', '49'];
            orderbook = orderbookLib.processPoloniexFill(orderbook, buy);

            expect(orderbook.asks['0.150']).to.equal(50);

            buy = ['t', 1 ,'0.150', '50'];
            orderbook = orderbookLib.processPoloniexFill(orderbook, buy);

            expect(orderbook.asks['0.150']).to.be.undefined;
        });

        it('sells on poloniex', () => {
            let sell = ['t', 0, '0.1499', '101.24'];
            orderbook = orderbookLib.processPoloniexFill(orderbook, sell);

            expect(orderbook.bids['0.1499']).to.equal(248.76);

            sell = ['t', 0, '0.1499', '248.76'];
            orderbook = orderbookLib.processPoloniexFill(orderbook, sell);

            expect(orderbook.bids['0.1499']).to.be.undefined;
        });

        it('order book updates on poloniex', () => {
            let update = ['o', 0, '0.150', '0.0000'];
            orderbook = orderbookLib.processPoloniexUpdate(orderbook, update);

            expect(orderbook.asks['0.150']).to.be.undefined;

            update = ['o', 1, '0.1499', '50'];
            orderbook = orderbookLib.processPoloniexUpdate(orderbook, update);

            expect(orderbook).to.deep.equal(updatedOrderbook);
        });
    });
});
