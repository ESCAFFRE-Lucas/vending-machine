import {IInventory} from "./interfaces/Iinventory";
import {IProduct} from "./interfaces/Iproduct";

export class Inventory implements IInventory {
    private products = new Map<string, IProduct>([
        ['A1', { name: 'Coca Cola', price: 150, category: 'Soda' }]
    ]);

    private stock = new Map<string, number>([
        ['A1', 5]
    ]);

    hasStock(productCode: string): boolean {
        return (this.stock.get(productCode) || 0) > 0;
    }

    getStock(productCode: string): number {
        return this.stock.get(productCode) || 0;
    }

    removeItem(productCode: string): void {
        const current = this.stock.get(productCode) || 0;
        if (current > 0) {
            this.stock.set(productCode, current - 1);
        }
    }

    addStock(productCode: string, quantity: number): void {
        const current = this.stock.get(productCode) || 0;
        this.stock.set(productCode, current + quantity);
    }

    getProduct(productCode: string): IProduct | undefined {
        return this.products.get(productCode);
    }
}