import { describe, it, expect } from 'vitest';
import { ChangeCalculator } from '../../core/money/ChangeCalculator';

describe('ChangeCalculator - Customer Experience Tests', () => {

    describe('When machine has plenty of coins', () => {
        const richStock = new Map([
            [200, 10], [100, 10], [50, 10], [20, 10],
            [10, 10], [5, 10], [2, 10], [1, 10]
        ]);

        it('should give customer the exact change amount they deserve', () => {
            const changeNeeded = 50;

            const result = ChangeCalculator.calculateOptimalChange(changeNeeded, richStock);

            expect(result).not.toBeNull();
            expect(result!.reduce((sum: number, coin: number) => sum + coin, 0)).toBe(50);
        });

        it('should give customer the fewest coins possible as change', () => {
            const changeNeeded = 85;

            const result = ChangeCalculator.calculateOptimalChange(changeNeeded, richStock);

            expect(result).not.toBeNull();
            expect(result!.length).toBeLessThanOrEqual(4);
        });
    });

    describe('When machine is running low on certain coins', () => {
        it('should still provide correct change when some coin types are empty', () => {
            const limitedStock = new Map([[20, 3], [10, 2], [5, 1]]);
            const changeNeeded = 50;

            const result = ChangeCalculator.calculateOptimalChange(changeNeeded, limitedStock);

            expect(result).not.toBeNull();
            expect(result!.reduce((sum: number, coin: number) => sum + coin, 0)).toBe(50);
            result!.forEach((coin: number) => {
                expect([20, 10, 5]).toContain(coin);
            });
        });

        it('should inform customer when unable to provide change', () => {
            const insufficientStock = new Map([[20, 1]]);
            const changeNeeded = 50;

            const result = ChangeCalculator.calculateOptimalChange(changeNeeded, insufficientStock);

            expect(result).toBeNull();
        });
    });

    describe('Common customer payment scenarios', () => {
        it('should not give any change when customer pays exact amount', () => {
            const anyStock = new Map([[50, 1]]);
            const changeNeeded = 0;

            const result = ChangeCalculator.calculateOptimalChange(changeNeeded, anyStock);

            expect(result).toEqual([]);
        });

        it('should inform customer when machine is out of coins', () => {
            const emptyStock = new Map();
            const changeNeeded = 10;

            const result = ChangeCalculator.calculateOptimalChange(changeNeeded, emptyStock);

            expect(result).toBeNull();
        });

        it('should handle customer paying with large bills', () => {
            const bigStock = new Map([[200, 5], [100, 5]]);
            const changeNeeded = 500;

            const result = ChangeCalculator.calculateOptimalChange(changeNeeded, bigStock);

            expect(result).not.toBeNull();
            expect(result!.reduce((sum: number, coin: number) => sum + coin, 0)).toBe(500);
        });
    });

    describe('Customer protection against machine errors', () => {
        it('should not return more coins to customer than available in stock', () => {
            const limitedStock = new Map([[10, 2], [5, 1]]);
            const changeNeeded = 25;

            const result = ChangeCalculator.calculateOptimalChange(changeNeeded, limitedStock);

            expect(result).not.toBeNull();
            const coinsUsed = new Map<number, number>();
            result!.forEach((coin: number) => {
                coinsUsed.set(coin, (coinsUsed.get(coin) || 0) + 1);
            });

            coinsUsed.forEach((used, coinValue) => {
                expect(used).toBeLessThanOrEqual(limitedStock.get(coinValue) || 0);
            });
        });
    });
});