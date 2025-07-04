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

        console.log(`Calculating change for amount: ${amount} with available coins: ${Array.from(availableCoins.entries()).map(([value, count]) => `${value}x${count}`).join(', ')}`);

        const sortedCoinValues = Array.from(availableCoins.keys()).sort((a, b) => b - a);

        for (const coinValue of sortedCoinValues) {
            let availableCount = availableCoins.get(coinValue) || 0;

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