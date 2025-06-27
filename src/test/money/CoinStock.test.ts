// test/money/CoinStock.test.ts

import { describe, it, expect, beforeEach } from 'vitest';
import {CoinStock} from "../../money/CoinStock";

describe('CoinStock - Customer & Manager Experience Tests', () => {

    describe('When customer wants to check if machine can provide change', () => {
        let coinStock: CoinStock;

        beforeEach(() => {
            coinStock = new CoinStock();
            coinStock.addCoins(200, 5);
            coinStock.addCoins(100, 5);
            coinStock.addCoins(50, 5);
            coinStock.addCoins(20, 5);
            coinStock.addCoins(10, 5);
        });

        it('should tell customer that machine can provide simple change', () => {
            const changeNeeded = 50;

            const canProvide = coinStock.canMakeChange(changeNeeded);

            expect(canProvide).toBe(true);
        });

        it('should warn customer when machine cannot provide change', () => {
            const lowStock = new CoinStock();
            lowStock.addCoins(200, 2);
            const changeNeeded = 50;

            const canProvide = lowStock.canMakeChange(changeNeeded);

            expect(canProvide).toBe(false);
        });
    });

    describe('When customer completes purchase and receives change', () => {
        let coinStock: CoinStock;

        beforeEach(() => {
            coinStock = new CoinStock();
            coinStock.addCoins(50, 3);
            coinStock.addCoins(20, 3);
            coinStock.addCoins(10, 2);
        });

        it('should give customer their change and reduce machine stock', () => {
            const changeNeeded = 50;
            const initialFifties = coinStock.getCoinCount(50);

            const change = coinStock.makeChange(changeNeeded);

            expect(change).toEqual([50]);
            expect(coinStock.getCoinCount(50)).toBe(initialFifties - 1);
        });

        it('should provide optimal change to preserve machine stock', () => {
            const changeNeeded = 70;

            const change = coinStock.makeChange(changeNeeded);

            expect(change).not.toBeNull();
            expect(change!.reduce((sum: number, coin: number) => sum + coin, 0)).toBe(70);
            expect(change!.length).toBeLessThanOrEqual(2);
        });

        it('should handle exact payment without touching coin stock', () => {
            const changeNeeded = 0;
            const initialStock = new Map(coinStock.getAllCoins());

            const change = coinStock.makeChange(changeNeeded);

            expect(change).toEqual([]);
            expect(coinStock.getAllCoins()).toEqual(initialStock);
        });
    });

    describe('When manager restocks the machine', () => {
        let coinStock: CoinStock;

        beforeEach(() => {
            coinStock = new CoinStock();
        });

        it('should allow manager to restock coins to machine', () => {
            coinStock.addCoins(50, 10);
            coinStock.addCoins(20, 15);

            expect(coinStock.getCoinCount(50)).toBe(10);
            expect(coinStock.getCoinCount(20)).toBe(15);
        });
    });

    describe('Edge cases', () => {
        let coinStock: CoinStock;

        beforeEach(() => {
            coinStock = new CoinStock();
        });

        it('should protect against negative coin additions', () => {
            coinStock.addCoins(50, 5);
            coinStock.addCoins(50, -2);

            expect(coinStock.getCoinCount(50)).toBeGreaterThanOrEqual(0);
        });

        it('should handle requests for coins that dont exist', () => {
            const countOfNonExistentCoin = coinStock.getCoinCount(999);

            expect(countOfNonExistentCoin).toBe(0);
        });
    });
});