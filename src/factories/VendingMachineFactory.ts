import { IInventory } from "../interfaces/Iinventory";
import { VendingMachine } from "../vendingMachine";
import { Inventory } from "../inventory";

export interface IVendingMachineFactory {
    createVendingMachine(customInventory?: IInventory): VendingMachine;
}

export class TestVendingMachineFactory implements IVendingMachineFactory {
    public createVendingMachine(customInventory?: IInventory): VendingMachine {
        console.log("🧪 Test: Creating Test Vending Machine");
        const inventory = customInventory || new Inventory();
        return new VendingMachine(inventory);
    }
}

export class CashVendingMachineFactory implements IVendingMachineFactory {
    public createVendingMachine(customInventory?: IInventory): VendingMachine {
        console.log("💰 Cash: Creating Cash-Only Vending Machine");
        const inventory = customInventory || new Inventory();
        //const paymentProcessor = new CashPaymentProcessor();
        return new VendingMachine(inventory);
    }
}

export const VendingMachineFactory = new TestVendingMachineFactory();