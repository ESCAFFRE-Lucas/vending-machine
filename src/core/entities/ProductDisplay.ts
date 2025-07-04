import type { IProduct } from '../interfaces/Iproduct';

export interface ProductDisplay extends IProduct {
	code: string;
	stock: number;
}