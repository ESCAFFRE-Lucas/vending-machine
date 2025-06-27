import { ChangeCalculator } from './ChangeCalculator';

export class CoinStock {
    private coins: Map<number, number>;

    constructor() {
        this.coins = new Map();
    }

    public canMakeChange(amount: number): boolean {
        const result = ChangeCalculator.calculateOptimalChange(amount, this.coins);
        return result !== null;
    }

    public makeChange(amount: number): number[] | null {
        const possibleChange = ChangeCalculator.calculateOptimalChange(amount, this.coins);

        if (possibleChange === null) {
            return null;
        }

        possibleChange.forEach(coinValue => {
            const currentCount = this.coins.get(coinValue) || 0;
            this.coins.set(coinValue, currentCount - 1);
        });

        return possibleChange;
    }

    public addCoins(coinValue: number, quantity: number): void {
        if (quantity <= 0) {
            return;
        }

        const currentCount = this.coins.get(coinValue) || 0;
        this.coins.set(coinValue, currentCount + quantity);
    }

    public getCoinCount(coinValue: number): number {
        return this.coins.get(coinValue) || 0;
    }

    public getAllCoins(): Map<number, number> {
        return new Map(this.coins);
    }
}