import type { ErrorLog, ITransactionLogger, RestockLog, SaleLog, TransactionLog } from '../interfaces/ItransactionLogger';

export class TransactionLogger implements ITransactionLogger {
	private static instance: TransactionLogger;
	private logs: TransactionLog[] = [];
	private readonly STORAGE_KEY = 'vending-machine-logs';

	constructor() {
		this.loadFromStorage();
	}

	static getInstance(): TransactionLogger {
		if (!TransactionLogger.instance) {
			TransactionLogger.instance = new TransactionLogger();
		}
		return TransactionLogger.instance;
	}

	// Méthode pour initialiser le logger avec une VendingMachine
	static initWithVendingMachine(vendingMachine: any): TransactionLogger {
		const logger = TransactionLogger.getInstance();

		// Injecter le logger dans la vending machine si elle a une méthode setLogger
		if (vendingMachine && typeof vendingMachine.setLogger === 'function') {
			vendingMachine.setLogger(logger);
		}

		return logger;
	}

	logSale(sale: Omit<SaleLog, 'type' | 'timestamp'>): void {
		const log: SaleLog = {
			type: 'SALE',
			timestamp: new Date().toISOString(),
			...sale
		};

		this.addLog(log);
	}

	logError(error: Omit<ErrorLog, 'type' | 'timestamp'>): void {
		const log: ErrorLog = {
			type: 'ERROR',
			timestamp: new Date().toISOString(),
			...error
		};

		this.addLog(log);
	}

	logRestock(restock: Omit<RestockLog, 'type' | 'timestamp'>): void {
		const log: RestockLog = {
			type: 'RESTOCK',
			timestamp: new Date().toISOString(),
			...restock
		};

		this.addLog(log);
	}

	getAllLogs(): TransactionLog[] {
		return [...this.logs];
	}

	getLogsByType<T extends TransactionLog['type']>(type: T): Extract<TransactionLog, { type: T }>[] {
		return this.logs.filter(log => log.type === type) as Extract<TransactionLog, { type: T }>[];
	}

	getLogsByDate(date: string): TransactionLog[] {
		return this.logs.filter(log => log.timestamp.startsWith(date));
	}

	clearLogs(): void {
		this.logs = [];
		this.removeFromStorage();
	}

	private addLog(log: TransactionLog): void {
		this.logs.push(log);
		this.saveToStorage();

		if (typeof window !== 'undefined') {
			window.dispatchEvent(new CustomEvent('transaction-log-added', {
				detail: { log, allLogs: this.logs }
			}));
		}
	}

	private saveToStorage(): void {
		try {
			if (typeof window !== 'undefined' && window.localStorage) {
				localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.logs));
			}
		} catch (error) {
			console.warn('Failed to save logs to localStorage:', error);
		}
	}

	private loadFromStorage(): void {
		try {
			if (typeof window !== 'undefined' && window.localStorage) {
				const stored = localStorage.getItem(this.STORAGE_KEY);
				if (stored) {
					this.logs = JSON.parse(stored);
				}
			}
		} catch (error) {
			console.warn('Failed to load logs from localStorage, starting fresh:', error);
			this.logs = [];
		}
	}

	private removeFromStorage(): void {
		try {
			if (typeof window !== 'undefined' && window.localStorage) {
				localStorage.removeItem(this.STORAGE_KEY);
			}
		} catch (error) {
			console.warn('Failed to remove logs from localStorage:', error);
		}
	}

	getTodaysLogs(): TransactionLog[] {
		const today = new Date().toISOString().split('T')[0];
		return this.getLogsByDate(today);
	}

	getSalesTotal(date?: string): number {
		const salesLogs = date ?
			this.getLogsByDate(date).filter(log => log.type === 'SALE') as SaleLog[] :
			this.getLogsByType('SALE');

		return salesLogs.reduce((total, sale) => total + sale.price, 0);
	}

	getErrorCount(errorType?: ErrorLog['errorType']): number {
		const errorLogs = this.getLogsByType('ERROR');
		return errorType ?
			errorLogs.filter(error => error.errorType === errorType).length :
			errorLogs.length;
	}

	getMostPopularProduct(): { productCode: string; productName: string; count: number } | null {
		const salesLogs = this.getLogsByType('SALE');

		if (salesLogs.length === 0) return null;

		const productCounts = salesLogs.reduce((counts, sale) => {
			counts[sale.productCode] = counts[sale.productCode] || {
				productCode: sale.productCode,
				productName: sale.productName,
				count: 0
			};
			counts[sale.productCode].count++;
			return counts;
		}, {} as Record<string, { productCode: string; productName: string; count: number }>);

		return Object.values(productCounts).reduce((most, current) =>
			current.count > most.count ? current : most
		);
	}

	getTodaysRevenue(): number {
		const today = new Date().toISOString().split('T')[0];
		return this.getSalesTotal(today);
	}

	getTodaysSalesCount(): number {
		const today = new Date().toISOString().split('T')[0];
		return this.getLogsByDate(today).filter(log => log.type === 'SALE').length;
	}

	getTodaysErrorCount(): number {
		const today = new Date().toISOString().split('T')[0];
		return this.getLogsByDate(today).filter(log => log.type === 'ERROR').length;
	}
}