import { expect } from 'chai';
import orderbookLib from '../lib/orderbook-lib';

describe('orderbookLib', () => {
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

        expect(orderbookLib.mapBittrexOrderbookData(rawTrexBook)).to.deep.equal({
            asks: {
                '0.170': 3.50,
                '0.150': 99
            },
            bids: {
                '0.1499': 350,
                '0.080': 0.99
            }
        });
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

        expect(orderbookLib.mapPoloniexOrderbookData(rawPoloBook)).to.deep.equal({
            asks: {
                '0.170': 3.50,
                '0.150': 99
            },
            bids: {
                '0.1499': 350,
                '0.080': 0.99
            }
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

        it('order book changes on bittrex', () => {
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
