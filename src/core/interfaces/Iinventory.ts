import type { IProduct } from './Iproduct';
import type { ProductDisplay } from '../entities/ProductDisplay';

export interface IInventory {
    hasStock(productCode: string): boolean;
    getStock(productCode: string): number;
    removeItem(productCode: string): void;
    addStock(productCode: string, quantity: number): void;
    getProduct(productCode: string): IProduct | undefined;
    getAllProducts(): ProductDisplay[];
}