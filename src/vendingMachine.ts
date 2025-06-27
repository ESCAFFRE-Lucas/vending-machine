import {IProduct} from "../interfaces/Iproduct";
import {IInventory} from "../interfaces/Iinventory";

export class VendingMachine {
    private totalInserted: number = 0;
    private selectedProduct: IProduct | null = null;

    constructor(private inventory: IInventory) {}

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
        return product;
    }

    completePurchase() {
        if (!this.selectedProduct) {
            throw new Error('No product selected');
        }

        if (!this.inventory.hasStock('A1')) {
            throw new Error('Out of stock');
        }

        if (this.totalInserted < this.selectedProduct.price) {
            throw new Error('Insufficient money');
        }

        const change = this.totalInserted - this.selectedProduct.price;
        this.inventory.removeItem('A1');
        this.totalInserted = 0;

        return {
            success: true,
            change: change,
            productDispensed: this.selectedProduct.name
        };
    }
}