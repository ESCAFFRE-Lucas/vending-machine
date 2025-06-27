import {IProduct} from "./interfaces/Iproduct";
import {IInventory} from "./interfaces/Iinventory";
import {CoinStock} from "./money/CoinStock";

export class VendingMachine {
    private totalInserted: number = 0;
    private selectedProduct: IProduct | null = null;
    private selectedProductCode: string | null = null;
    private coinStock: CoinStock;

    constructor(private inventory: IInventory, coinStock?: CoinStock) {
        this.coinStock = coinStock || new CoinStock();
    }
    insertMoney(amount: number) {
        if (amount <= 0) {
            throw new Error('Invalid amount. Please insert a positive amount.');
        }
        this.totalInserted += amount;
    }

    getTotalInserted(): number {
        return this.totalInserted;
    }

    selectProduct(code: string): IProduct {
        const product = this.inventory.getProduct(code);
        if (!product) {
            throw new Error('Product not found');
        }
        this.selectedProduct = product;
        this.selectedProductCode = code;
        return product;
    }

    completePurchase() {
        if (!this.selectedProduct || !this.selectedProductCode) {
            throw new Error('No product selected');
        }

        if (!this.inventory.hasStock(this.selectedProductCode)) {
            throw new Error('Out of stock');
        }

        if (this.totalInserted < this.selectedProduct.price) {
            throw new Error('Insufficient money');
        }

        const changeNeeded = this.totalInserted - this.selectedProduct.price;

        if (changeNeeded > 0 && !this.coinStock.canMakeChange(changeNeeded)) {
            throw new Error('Cannot provide change - exact payment required');
        }

        const changeCoins = changeNeeded > 0 ? this.coinStock.makeChange(changeNeeded) : [];

        this.inventory.removeItem(this.selectedProductCode);
        this.totalInserted = 0;

        return {
            success: true,
            change: changeNeeded,
            changeCoins: changeCoins,
            productDispensed: this.selectedProduct.name
        };
    }
}