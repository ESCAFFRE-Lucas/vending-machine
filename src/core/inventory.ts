import type {IInventory} from "./interfaces/Iinventory";
import type {IProduct} from "./interfaces/Iproduct";
import type { ProductDisplay } from './entities/ProductDisplay';

export class Inventory implements IInventory {
    private products = new Map<string, IProduct>([
        ['A1', { name: 'Coca Cola', price: 150, category: 'Soda' }],
        ['A2', { name: 'Pepsi', price: 140, category: 'Soda' }],
        ['B1', { name: 'Snickers', price: 120, category: 'Candy' }],
        ['B2', { name: 'Mars Bar', price: 130, category: 'Candy' }],
        ['C1', { name: 'Water Bottle', price: 100, category: 'Water' }],
        ['C2', { name: 'Orange Juice', price: 160, category: 'Juice' }]
    ]);

    private stock = new Map<string, number>([
        ['A1', 5],
        ['A2', 5],
        ['B1', 5],
        ['B2', 5],
        ['C1', 5],
        ['C2', 5]
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

    getAllProducts(): ProductDisplay[] {
        return this.products.entries().map(([code, product]) => ({
            code,
            name: product.name,
            price: product.price,
            category: product.category,
            stock: this.getStock(code)
        })).toArray();
    }
}