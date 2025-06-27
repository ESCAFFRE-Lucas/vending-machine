export class ChangeCalculator {

    public static calculateOptimalChange(
        amount: number,
        availableCoins: Map<number, number>
    ): number[] | null {
        if (amount === 0) {
            return [];
        }

        if (availableCoins.size === 0) {
            return null;
        }

        const result: number[] = [];
        let remainingAmount = amount;

        const sortedCoinValues = Array.from(availableCoins.keys()).sort((a, b) => b - a);

        for (const coinValue of sortedCoinValues) {
            let availableCount = availableCoins.get(coinValue) || 0; // ← let au lieu de const

            while (remainingAmount >= coinValue && availableCount > 0) {
                result.push(coinValue);
                remainingAmount -= coinValue;
                availableCount--;
            }
        }

        if (remainingAmount === 0) {
            return result;
        } else {
            return null;
        }
    }
}