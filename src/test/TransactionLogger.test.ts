import { describe, it, expect, beforeEach } from 'vitest';
import { TransactionLogger } from '../core/logger/TransactionLogger';
import { VendingMachine } from '../core/vendingMachine';
import { Inventory } from '../core/inventory';
import { CoinStock } from '../core/money/CoinStock';

describe('TransactionLogger - User Behavior Tests', () => {
	let logger: TransactionLogger;

	beforeEach(() => {
		logger = new TransactionLogger();
		logger.clearLogs();
	});

	describe('When a customer buys a product', () => {
		it('should track the sale with all purchase details', () => {
			logger.logSale({
				productCode: 'A1',
				productName: 'Coca Cola',
				price: 150,
				amountPaid: 200,
				change: 50,
				changeCoins: [50]
			});

			const logs = logger.getAllLogs();
			expect(logs).toHaveLength(1);

			const sale = logs[0];
			expect(sale.type).toBe('SALE');
			if ('productCode' in sale) {
				expect(sale.productCode).toBe('A1');
			}
			if ('productName' in sale) {
				expect(sale.productName).toBe('Coca Cola');
			}
			if ('price' in sale) {
				expect(sale.price).toBe(150);
			}
			if ('amountPaid' in sale) {
				expect(sale.amountPaid).toBe(200);
			}
			if ('change' in sale) {
				expect(sale.change).toBe(50);
			}
			if ('changeCoins' in sale) {
				expect(sale.changeCoins).toEqual([50]);
			}
			expect(sale.timestamp).toBeDefined();
		});
	});

	describe('When the machine encounters problems', () => {
		it('should record when customer does not have enough money', () => {
			logger.logError({
				errorType: 'INSUFFICIENT_MONEY',
				context: {
					productCode: 'A1',
					productPrice: 150,
					amountInserted: 100
				}
			});

			const errorLogs = logger.getLogsByType('ERROR');
			expect(errorLogs).toHaveLength(1);
			expect(errorLogs[0].errorType).toBe('INSUFFICIENT_MONEY');
			expect(errorLogs[0].context.productCode).toBe('A1');
			expect(errorLogs[0].context.amountInserted).toBe(100);
		});

		it('should record when a product is out of stock', () => {
			logger.logError({
				errorType: 'OUT_OF_STOCK',
				context: {
					productCode: 'B1',
					productName: 'Chips'
				}
			});

			const errorLogs = logger.getLogsByType('ERROR');
			expect(errorLogs).toHaveLength(1);
			expect(errorLogs[0].errorType).toBe('OUT_OF_STOCK');
			expect(errorLogs[0].context.productCode).toBe('B1');
		});

		it('should record when machine cannot make change', () => {
			logger.logError({
				errorType: 'CANNOT_MAKE_CHANGE',
				context: {
					productCode: 'A1',
					changeNeeded: 75
				}
			});

			const errorLogs = logger.getLogsByType('ERROR');
			expect(errorLogs).toHaveLength(1);
			expect(errorLogs[0].errorType).toBe('CANNOT_MAKE_CHANGE');
		});
	});

	describe('When restocking the machine', () => {
		it('should track restocking operations', () => {
			logger.logRestock({
				productCode: 'A1',
				quantityAdded: 10,
				newStock: 15,
				sessionId: 'manager-001'
			});

			const restockLogs = logger.getLogsByType('RESTOCK');
			expect(restockLogs).toHaveLength(1);
			expect(restockLogs[0].productCode).toBe('A1');
			expect(restockLogs[0].quantityAdded).toBe(10);
			expect(restockLogs[0].newStock).toBe(15);
			expect(restockLogs[0].sessionId).toBe('manager-001');
		});
	});

	describe('When analyzing business performance', () => {
		beforeEach(() => {
			logger.logSale({
				productCode: 'A1',
				productName: 'Coca Cola',
				price: 150,
				amountPaid: 150,
				change: 0,
				changeCoins: []
			});

			logger.logSale({
				productCode: 'A1',
				productName: 'Coca Cola',
				price: 150,
				amountPaid: 200,
				change: 50,
				changeCoins: [50]
			});

			logger.logSale({
				productCode: 'B1',
				productName: 'Chips',
				price: 200,
				amountPaid: 200,
				change: 0,
				changeCoins: []
			});
		});

		it('should calculate total revenue correctly', () => {
			const totalRevenue = logger.getSalesTotal();
			expect(totalRevenue).toBe(500); // 150 + 150 + 200
		});

		it('should identify the most popular product', () => {
			const mostPopular = logger.getMostPopularProduct();

			expect(mostPopular).toBeDefined();
			expect(mostPopular?.productCode).toBe('A1');
			expect(mostPopular?.productName).toBe('Coca Cola');
			expect(mostPopular?.count).toBe(2);
		});

		it('should filter logs by type for analysis', () => {
			expect(logger.getLogsByType('SALE')).toHaveLength(3);
			expect(logger.getLogsByType('ERROR')).toHaveLength(0);
			expect(logger.getLogsByType('RESTOCK')).toHaveLength(0);
		});

		it('should provide daily statistics', () => {
			const today = new Date().toISOString().split('T')[0];
			const todaysLogs = logger.getLogsByDate(today);

			expect(todaysLogs).toHaveLength(3);
			expect(logger.getTodaysRevenue()).toBe(500);
			expect(logger.getTodaysSalesCount()).toBe(3);
		});
	});

	describe('When reviewing transaction history', () => {
		it('should return all transactions in chronological order', () => {
			logger.logSale({
				productCode: 'A1',
				productName: 'Coca Cola',
				price: 150,
				amountPaid: 150,
				change: 0,
				changeCoins: []
			});

			logger.logError({
				errorType: 'OUT_OF_STOCK',
				context: { productCode: 'B1' }
			});

			const allLogs = logger.getAllLogs();
			expect(allLogs).toHaveLength(2);
			expect(allLogs[0].type).toBe('SALE');
			expect(allLogs[1].type).toBe('ERROR');
		});

		it('should allow clearing history when needed', () => {
			logger.logSale({
				productCode: 'A1',
				productName: 'Coca Cola',
				price: 150,
				amountPaid: 150,
				change: 0,
				changeCoins: []
			});

			expect(logger.getAllLogs()).toHaveLength(1);

			logger.clearLogs();
			expect(logger.getAllLogs()).toHaveLength(0);
		});
	});
});

describe('VendingMachine - Customer Experience with Logging', () => {
	let vendingMachine: VendingMachine;
	let inventory: Inventory;
	let coinStock: CoinStock;
	let logger: TransactionLogger;

	beforeEach(() => {
		inventory = new Inventory();
		coinStock = new CoinStock();
		coinStock.addCoins(50, 10);
		coinStock.addCoins(100, 10);

		vendingMachine = new VendingMachine(inventory, coinStock);
		logger = TransactionLogger.getInstance();
		logger.clearLogs();
		vendingMachine.setLogger(logger);
	});

	describe('When a customer successfully buys a product', () => {
		it('should log the complete transaction', () => {
			vendingMachine.insertMoney(200);
			vendingMachine.selectProduct('A1');
			vendingMachine.completePurchase();

			const salesLogs = logger.getLogsByType('SALE');
			expect(salesLogs).toHaveLength(1);

			const sale = salesLogs[0];
			expect(sale.productCode).toBe('A1');
			expect(sale.productName).toBe('Coca Cola');
			expect(sale.price).toBe(150);
			expect(sale.amountPaid).toBe(200);
			expect(sale.change).toBe(50);
		});
	});

	describe('When a customer encounters errors', () => {
		it('should log when customer tries to buy without enough money', () => {
			vendingMachine.insertMoney(100);
			vendingMachine.selectProduct('A1');

			expect(() => vendingMachine.completePurchase()).toThrow('Insufficient money');

			const errorLogs = logger.getLogsByType('ERROR');
			expect(errorLogs).toHaveLength(1);
			expect(errorLogs[0].errorType).toBe('INSUFFICIENT_MONEY');
			expect(errorLogs[0].context.productCode).toBe('A1');
			expect(errorLogs[0].context.amountInserted).toBe(100);
		});

		it('should log when customer selects non-existent product', () => {
			expect(() => vendingMachine.selectProduct('Z9')).toThrow('Product not found');

			const errorLogs = logger.getLogsByType('ERROR');
			expect(errorLogs).toHaveLength(1);
			expect(errorLogs[0].errorType).toBe('PRODUCT_NOT_FOUND');
			expect(errorLogs[0].context.productCode).toBe('Z9');
		});

		it('should log when product is out of stock', () => {
			for (let i = 0; i < 10; i++) {
				if (inventory.hasStock('A1')) {
					inventory.removeItem('A1');
				}
			}

			vendingMachine.insertMoney(200);
			vendingMachine.selectProduct('A1');

			expect(() => vendingMachine.completePurchase()).toThrow('Out of stock');

			const errorLogs = logger.getLogsByType('ERROR');
			expect(errorLogs).toHaveLength(1);
			expect(errorLogs[0].errorType).toBe('OUT_OF_STOCK');
			expect(errorLogs[0].context.productCode).toBe('A1');
		});
	});
});