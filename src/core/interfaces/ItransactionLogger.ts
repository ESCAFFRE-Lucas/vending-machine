export interface SaleLog {
	type: 'SALE';
	timestamp: string;
	productCode: string;
	productName: string;
	price: number;
	amountPaid: number;
	change: number;
	changeCoins: number[];
	sessionId?: string;
}

export interface ErrorLog {
	type: 'ERROR';
	timestamp: string;
	errorType: 'INSUFFICIENT_MONEY' | 'OUT_OF_STOCK' | 'CANNOT_MAKE_CHANGE' | 'PRODUCT_NOT_FOUND';
	context: any;
	sessionId?: string;
}

export interface RestockLog {
	type: 'RESTOCK';
	timestamp: string;
	productCode: string;
	quantityAdded: number;
	newStock: number;
	sessionId?: string;
}

export type TransactionLog = SaleLog | ErrorLog | RestockLog;

export interface ITransactionLogger {
	logSale(sale: Omit<SaleLog, 'type' | 'timestamp'>): void;
	logError(error: Omit<ErrorLog, 'type' | 'timestamp'>): void;
	logRestock(restock: Omit<RestockLog, 'type' | 'timestamp'>): void;

	getAllLogs(): TransactionLog[];
	getLogsByType(type: 'SALE' | 'ERROR' | 'RESTOCK'): TransactionLog[];
	getLogsByDate(date: string): TransactionLog[];
}