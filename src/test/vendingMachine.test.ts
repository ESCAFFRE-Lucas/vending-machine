import {describe, vitest, it, beforeEach, vi, expect, Mocked} from "vitest";
import {Inventory} from "../inventory";
import {IInventory} from "../interfaces/Iinventory";
import { VendingMachineFactory } from "../factories/VendingMachineFactory";

describe('Product Selection', () => {
    it('should select a valid product and return its details', () => {
        const vendingMachine = VendingMachineFactory.createVendingMachine();

        const result = vendingMachine.selectProduct('A1');

        expect(result).toEqual({ name: 'Coca Cola', price: 150, category: 'Soda' });
    });

    it('should print exact product price to client when valid product is selected', () => {
        const vendingMachine = VendingMachineFactory.createVendingMachine();

        const result = vendingMachine.selectProduct('A1');

        expect(result.price).toBe(150);
        expect(result.name).toBe('Coca Cola');
    });

    it('should throw error when invalid product code is selected', () => {
        const vendingMachine = VendingMachineFactory.createVendingMachine();

        expect(() => {
            vendingMachine.selectProduct('Z9');
        }).toThrow('Product not found');
    });

    it('should accept money from client and track total inserted', () => {
        const vendingMachine = VendingMachineFactory.createVendingMachine();

        vendingMachine.insertMoney(100);
        vendingMachine.insertMoney(50);

        expect(vendingMachine.getTotalInserted()).toBe(150);
    });

    it('should reject invalid money amounts', () => {
        const vendingMachine = VendingMachineFactory.createVendingMachine();

        expect(() => {
            vendingMachine.insertMoney(-10);
        }).toThrow('Invalid amount');

        expect(() => {
            vendingMachine.insertMoney(0);
        }).toThrow('Invalid amount');
    });
});

describe('Product Purchase', () => {
    it('should require product selection before purchase', () => {
        const vendingMachine = VendingMachineFactory.createVendingMachine();
        vendingMachine.insertMoney(200);

        expect(() => {
            vendingMachine.completePurchase();
        }).toThrow('No product selected');
    });

    it('should complete purchase when sufficient money is inserted', () => {
        const vendingMachine = VendingMachineFactory.createVendingMachine();
        vendingMachine.selectProduct('A1');
        vendingMachine.insertMoney(200);

        const result = vendingMachine.completePurchase();

        expect(result.success).toBe(true);
        expect(result.change).toBe(50);
        expect(result.productDispensed).toBe('Coca Cola');
        expect(vendingMachine.getTotalInserted()).toBe(0);
    });

    it('should reject purchase when insufficient money is inserted', () => {
        const vendingMachine = VendingMachineFactory.createVendingMachine();
        vendingMachine.selectProduct('A1');
        vendingMachine.insertMoney(100);

        expect(() => {
            vendingMachine.completePurchase();
        }).toThrow('Insufficient money');
    });
});

describe('Stock Management', () => {
    it('should reject purchase when product is out of stock', () => {
        const mockInventory: IInventory = {
            hasStock: vi.fn().mockReturnValue(false),
            getStock: vi.fn().mockReturnValue(0),
            removeItem: vi.fn(),
            addStock: vi.fn(),
            getProduct: vi.fn().mockReturnValue({ name: 'Coca Cola', price: 150, category: 'Soda' })
        };

        const vendingMachine = VendingMachineFactory.createVendingMachine(mockInventory);
        vendingMachine.selectProduct('A1');
        vendingMachine.insertMoney(200);

        expect(() => {
            vendingMachine.completePurchase();
        }).toThrow('Out of stock');
    });

    it('should reduce stock when product is purchased', () => {
        const inventory = new Inventory();
        const vendingMachine = VendingMachineFactory.createVendingMachine(inventory);

        const initialStock = inventory.getStock('A1');

        vendingMachine.selectProduct('A1');
        vendingMachine.insertMoney(200);
        vendingMachine.completePurchase();

        expect(inventory.getStock('A1')).toBe(initialStock - 1);
    });

    it('should verify stock is removed after purchase', () => {
        const mockInventory: IInventory = {
            hasStock: vi.fn().mockReturnValue(true),
            getStock: vi.fn().mockReturnValue(5),
            removeItem: vi.fn(),
            addStock: vi.fn(),
            getProduct: vi.fn().mockReturnValue({ name: 'Coca Cola', price: 150, category: 'Soda' })
        };

        const vendingMachine = VendingMachineFactory.createVendingMachine(mockInventory);
        vendingMachine.selectProduct('A1');
        vendingMachine.insertMoney(200);

        vendingMachine.completePurchase();

        expect(mockInventory.removeItem).toHaveBeenCalledWith('A1');
    });
});