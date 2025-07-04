import type { IInventory } from "../interfaces/Iinventory";
import { VendingMachine } from "../vendingMachine";
import { Inventory } from "../inventory";
import { CoinStock } from "../money/CoinStock";
import { TransactionLogger } from "../logger/TransactionLogger";

export interface IVendingMachineFactory {
    createVendingMachine(customInventory?: IInventory): VendingMachine;
}

export class TestVendingMachineFactory implements IVendingMachineFactory {
    public createVendingMachine(inventory?: IInventory): VendingMachine {
        const defaultInventory = inventory || new Inventory();

        const coinStock = new CoinStock();
        coinStock.addCoins(200, 10);
        coinStock.addCoins(100, 10);
        coinStock.addCoins(50, 10);
        coinStock.addCoins(20, 10);
        coinStock.addCoins(10, 10);

        const vendingMachine = new VendingMachine(defaultInventory, coinStock);

        TransactionLogger.initWithVendingMachine(vendingMachine);

        return vendingMachine;
    }
}

export class CashVendingMachineFactory implements IVendingMachineFactory {
    public createVendingMachine(inventory?: IInventory): VendingMachine {
        const defaultInventory = inventory || new Inventory();

        const coinStock = new CoinStock();
        coinStock.addCoins(200, 10);
        coinStock.addCoins(100, 10);
        coinStock.addCoins(50, 10);
        coinStock.addCoins(20, 10);
        coinStock.addCoins(10, 10);

        const vendingMachine = new VendingMachine(defaultInventory, coinStock);

        TransactionLogger.initWithVendingMachine(vendingMachine);

        return vendingMachine;
    }
}

export const VendingMachineFactory = new TestVendingMachineFactory();