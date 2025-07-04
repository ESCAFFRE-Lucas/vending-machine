import type {IProduct} from "./interfaces/Iproduct";
import type { IInventory } from './interfaces/Iinventory';
import {CoinStock} from "./money/CoinStock";
import type { TransactionLogger } from './logger/TransactionLogger';
import type { ProductDisplay } from './entities/ProductDisplay';

export class VendingMachine {
    private totalInserted: number = 0;
    private selectedProduct: IProduct | null = null;
    private selectedProductCode: string | null = null;
    private coinStock: CoinStock;
    private logger: TransactionLogger | null = null;
    private readonly sessionId: string;

    constructor(public inventory: IInventory, coinStock?: CoinStock) {
        this.coinStock = coinStock || new CoinStock();
        this.sessionId = this.generateSessionId();
    }

    private generateSessionId(): string {
        return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    setLogger(logger: TransactionLogger): void {
        this.logger = logger;
    }

    insertMoney(amount: number) {
        if (amount <= 0) {
            this.logger?.logError({
                errorType: 'INSUFFICIENT_MONEY',
                context: {
                    action: 'insertMoney',
                    amount: amount,
                    reason: 'Invalid amount - must be positive'
                },
                sessionId: this.sessionId
            });
            throw new Error('Invalid amount. Please insert a positive amount.');
        }
        this.totalInserted += amount;
    }

    getTotalInserted(): number {
        return this.totalInserted;
    }

    selectProduct(code: string): IProduct {
        const product = this.inventory.getProduct(code);
        if (!product) {
            this.logger?.logError({
                errorType: 'PRODUCT_NOT_FOUND',
                context: {
                    productCode: code,
                    action: 'selectProduct'
                },
                sessionId: this.sessionId
            });
            throw new Error('Product not found');
        }
        this.selectedProduct = product;
        this.selectedProductCode = code;
        return product;
    }

    completePurchase() {
        if (!this.selectedProduct || !this.selectedProductCode) {
            this.logger?.logError({
                errorType: 'PRODUCT_NOT_FOUND',
                context: {
                    action: 'completePurchase',
                    reason: 'No product selected'
                },
                sessionId: this.sessionId
            });
            throw new Error('No product selected');
        }

        if (!this.inventory.hasStock(this.selectedProductCode)) {
            this.logger?.logError({
                errorType: 'OUT_OF_STOCK',
                context: {
                    productCode: this.selectedProductCode,
                    productName: this.selectedProduct.name
                },
                sessionId: this.sessionId
            });
            throw new Error('Out of stock');
        }

        if (this.totalInserted < this.selectedProduct.price) {
            this.logger?.logError({
                errorType: 'INSUFFICIENT_MONEY',
                context: {
                    productCode: this.selectedProductCode,
                    productPrice: this.selectedProduct.price,
                    amountInserted: this.totalInserted,
                    shortfall: this.selectedProduct.price - this.totalInserted
                },
                sessionId: this.sessionId
            });
            throw new Error('Insufficient money');
        }

        const changeNeeded = this.totalInserted - this.selectedProduct.price;

        if (changeNeeded > 0 && !this.coinStock.canMakeChange(changeNeeded)) {
            this.logger?.logError({
                errorType: 'CANNOT_MAKE_CHANGE',
                context: {
                    productCode: this.selectedProductCode,
                    changeNeeded: changeNeeded,
                    availableCoins: Object.fromEntries(this.coinStock.getAllCoins())
                },
                sessionId: this.sessionId
            });
            throw new Error('Cannot provide change - exact payment required');
        }

        const changeCoins = changeNeeded > 0 ? this.coinStock.makeChange(changeNeeded) || [] : [];

        this.logger?.logSale({
            productCode: this.selectedProductCode,
            productName: this.selectedProduct.name,
            price: this.selectedProduct.price,
            amountPaid: this.totalInserted,
            change: changeNeeded,
            changeCoins: changeCoins,
            sessionId: this.sessionId
        });

        this.totalInserted -= this.selectedProduct.price;
        this.inventory.removeItem(this.selectedProductCode);

        return {
            success: true,
            change: changeNeeded,
            remainingCredit: this.totalInserted,
            productDispensed: this.selectedProduct.name
        };
    }

    refundMoney() {
        if (this.totalInserted === 0) {
            this.logger?.logError({
                errorType: 'INSUFFICIENT_MONEY',
                context: {
                    action: 'refundMoney',
                    reason: 'No credit to refund'
                },
                sessionId: this.sessionId
            });
            throw new Error('No credit to refund');
        }

        const changeCoins = this.coinStock.makeChange(this.totalInserted);
        if (!changeCoins) {
            this.logger?.logError({
                errorType: 'CANNOT_MAKE_CHANGE',
                context: {
                    action: 'refundMoney',
                    amountToRefund: this.totalInserted,
                    availableCoins: Object.fromEntries(this.coinStock.getAllCoins())
                },
                sessionId: this.sessionId
            });
            throw new Error('Cannot provide change - exact payment required');
        }

        const refundedAmount = this.totalInserted;
        this.totalInserted = 0;

        return {
            success: true,
            refundedAmount: refundedAmount,
            changeCoins: changeCoins
        };
    }

    getProducts(): ProductDisplay[] {
        return this.inventory.getAllProducts();
    }

    getLogger(): TransactionLogger | null {
        return this.logger;
    }

    getCurrentSessionId(): string {
        return this.sessionId;
    }

    getCoinStock(): CoinStock {
        return this.coinStock;
    }
}