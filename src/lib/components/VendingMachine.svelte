<script lang="ts">
	import { onMount } from 'svelte';
	import { TestVendingMachineFactory } from '../../core/factories/VendingMachineFactory';
	import Logger from '$lib/components/Logger.svelte';

	interface AppError {
		message: string;
	}

	type MessageType = "success" | "error" | "info";

	const factory = new TestVendingMachineFactory();
	const vendingMachine = factory.createVendingMachine();

	const products = $state(vendingMachine.getProducts());

	let totalInserted: number = $state(0);
	let selectedProductInfo: { code: string; name: string; price: number } | null = $state(null);
	let message: {message: string, type: MessageType} | null = $state(null);
	let sessionPurchases: number = $state(0);
	let changeCoins: number[] = $state([]);
	let showChange: boolean = $state(false);

	let currentView: 'machine' | 'logs' = $state('machine');

	onMount(() => {
		updateInsertedAmount();
		showMessage('🎉 Machine initialisée ! Prête à fonctionner !', 'success');
	});

	function updateInsertedAmount() {
		totalInserted = vendingMachine.getTotalInserted();
	}

	function handleInsertMoney(amount: number) {
		try {
			vendingMachine.insertMoney(amount);
			updateInsertedAmount();
			const coinName = formatCoin(amount);
			showMessage(`💰 ${coinName} inséré !`, 'success');
		} catch (error: unknown) {
			const appError = error as AppError;
			showMessage(`❌ ${appError.message}`, 'error');
		}
	}

	function handleSelectProduct(code: string) {
		try {
			const product = vendingMachine.selectProduct(code);
			selectedProductInfo = { code, name: product.name, price: product.price };
			showMessage(`✅ ${product.name} sélectionné !`, 'success');
		} catch (error: unknown) {
			const appError = error as AppError;
			showMessage(`❌ ${appError.message}`, 'error');
			selectedProductInfo = null;
		}
	}

	function handleCompletePurchase() {
		try {
			const result = vendingMachine.completePurchase();

			const selectedProductIndex = products.findIndex(p => p.code === selectedProductInfo?.code);
			if (selectedProductIndex === -1) return;

			products[selectedProductIndex].stock--;
			sessionPurchases++;
			updateInsertedAmount();

			if ('remainingCredit' in result) {
				showMessage(
					`🎉 ${result.productDispensed} acheté ! Crédit restant: ${formatEuros(result.remainingCredit)}`,
					'success'
				);
			}

			selectedProductInfo = null;
		} catch (error: unknown) {
			const appError = error as AppError;
			showMessage(`❌ ${appError.message}`, 'error');
		}
	}

	function handleRefundMoney() {
		try {
			if (typeof vendingMachine.refundMoney === 'function') {
				const result = vendingMachine.refundMoney();
				showMessage(`💰 ${formatEuros(result.refundedAmount)} remboursé !`, 'success');

				if (result.changeCoins && result.changeCoins.length > 0) {
					changeCoins = result.changeCoins;
					showChange = true;
					setTimeout(() => { showChange = false; }, 5000);
				}

				sessionPurchases = 0;
				updateInsertedAmount();
			}
		} catch (error: unknown) {
			const appError = error as AppError;
			showMessage(`❌ ${appError.message}`, 'error');
		}
	}

	function showMessage(msg: string, type: MessageType) {
		message = {message: msg, type};
		setTimeout(() => { message = null; }, 3000);
	}

	function formatEuros(cents: number): string {
		return (cents / 100).toFixed(2) + '€';
	}

	function formatCoin(cents: number): string {
		if (cents >= 100) {
			return (cents / 100) + '€';
		} else {
			return cents + 'c';
		}
	}

	function getProductColor(code: string): string {
		const colors: Record<string, string> = { 'A1': 'red', 'A2': 'blue', 'B1': 'yellow' };
		return colors[code] || 'gray';
	}

	function getProductIcon(code: string): string {
		const icons: Record<string, string> = { 'A1': '🥤', 'A2': '🥤', 'B1': '🍫', 'B2': '🍫', 'C1': '🥤', 'C2': '🍊' };
		return icons[code] || '📦';
	}

	function getCoinColor(value: number): string {
		if (value >= 100) return 'from-yellow-400 to-yellow-600 text-black';
		if (value >= 50) return 'from-gray-300 to-gray-500 text-black';
		return 'from-gray-500 to-gray-700 text-white';
	}

	function getMessageColor(type: 'success' | 'error' | 'info'): string {
		const colors: Record<string, string> = { success: 'green', error: 'red', info: 'blue' };
		return colors[type] || 'blue';
	}

	let canPurchase = $derived.by(() => {
		return totalInserted >= (selectedProductInfo ? selectedProductInfo.price : 0)
	});
	let remainingAmount = $derived.by(() => {
		return selectedProductInfo ? Math.max(0, selectedProductInfo.price - totalInserted) : 0
	});
	let canRefund = $derived(totalInserted > 0);
</script>

<div class="bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 min-h-screen">

	<nav class="bg-gray-800/50 backdrop-blur-lg border-b border-gray-700 p-4">
		<div class="max-w-4xl mx-auto flex justify-between items-center">
			<h1 class="text-2xl font-bold text-white">🏪 DISTRIBUTEUR</h1>
			<div class="flex gap-2">
				<button
					class="px-4 py-2 rounded-lg font-medium transition-colors {currentView === 'machine'
						? 'bg-blue-600 text-white'
						: 'bg-gray-700 text-gray-300 hover:bg-gray-600'}"
					onclick={() => currentView = 'machine'}
				>
					🏪 Machine
				</button>
				<button
					class="px-4 py-2 rounded-lg font-medium transition-colors {currentView === 'logs'
						? 'bg-purple-600 text-white'
						: 'bg-gray-700 text-gray-300 hover:bg-gray-600'}"
					onclick={() => currentView = 'logs'}
				>
					📊 Logs
				</button>
			</div>
		</div>
	</nav>

	{#if currentView === 'machine'}
		<div class="p-4">
			<div class="max-w-4xl mx-auto">

				<div class="bg-gray-800/50 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-gray-700">

					<div class="mb-8">
						<h2 class="text-2xl font-bold text-white mb-4 flex items-center">
							📦 Produits disponibles
						</h2>
						<div class="grid grid-cols-1 md:grid-cols-3 gap-4">

							{#each products as product (product.code)}
								<button
									class="product-card bg-{getProductColor(product.code)}-600/20 border border-{getProductColor(product.code)}-500/30 rounded-xl p-4 hover:bg-{getProductColor(product.code)}-600/30 transition-all cursor-pointer transform hover:scale-105 {selectedProductInfo?.code === product.code ? 'ring-2 ring-blue-400' : ''}"
									onclick={() => handleSelectProduct(product.code)}
								>
									<div class="text-center">
										<div class="text-4xl mb-2">{getProductIcon(product.code)}</div>
										<h3 class="text-white font-bold">{product.code} - {product.name}</h3>
										<p class="text-{getProductColor(product.code)}-300 text-2xl font-bold">{formatEuros(product.price)}</p>
										{#if product.stock === 0}
											<div class="text-red-400 text-sm">❌ Plus en stock (cheh)</div>
										{:else }
											<div class="text-green-400 text-sm">✅ En stock</div>
										{/if}
									</div>
								</button>
							{/each}
						</div>
					</div>

					<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">

						<div class="space-y-6">
							<h2 class="text-2xl font-bold text-white flex items-center">
								💰 Insérer les pièces
							</h2>

							<div class="grid grid-cols-3 gap-3">
								{#each [200, 100, 50, 20, 10, 5, 2, 1] as coinValue (coinValue)}
									<button
										class="coin-btn bg-gradient-to-br {getCoinColor(coinValue)} font-bold py-4 px-6 rounded-xl hover:scale-110 transition-transform shadow-lg active:animate-bounce"
										onclick={() => handleInsertMoney(coinValue)}
									>
										<div class="text-xl">🪙</div>
										<div>{formatCoin(coinValue)}</div>
									</button>
								{/each}
							</div>
						</div>

						<div class="space-y-6">
							<h2 class="text-2xl font-bold text-white">📊 État de la machine</h2>

							<div class="bg-black/30 rounded-xl p-6 space-y-4">
								<div class="flex justify-between items-center">
									<span class="text-gray-300">Total inséré:</span>
									<span class="text-green-400 text-2xl font-bold">{formatEuros(totalInserted)}</span>
								</div>

								<div class="flex justify-between items-center">
									<span class="text-gray-300">Produit sélectionné:</span>
									<span class="text-blue-400 font-bold">{selectedProductInfo?.name || 'Aucun'}</span>
								</div>

								<div class="flex justify-between items-center">
									<span class="text-gray-300">Prix:</span>
									<span class="text-yellow-400 font-bold">{selectedProductInfo ? formatEuros(selectedProductInfo.price) : '-'}</span>
								</div>

								<div class="flex justify-between items-center">
									<span class="text-gray-300">Reste à payer:</span>
									<span class="text-red-400 font-bold">{selectedProductInfo ? formatEuros(remainingAmount) : '-'}</span>
								</div>

								<div class="flex justify-between items-center">
									<span class="text-gray-300">Produits achetés:</span>
									<span class="text-purple-400 font-bold">{sessionPurchases}</span>
								</div>
							</div>

							<div class="space-y-3">
								<button
									class="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-4 px-8 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
									disabled={!canPurchase}
									onclick={handleCompletePurchase}
								>
									🛒 ACHETER
								</button>

								<button
									class="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold py-3 px-8 rounded-xl hover:from-orange-600 hover:to-red-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
									disabled={!canRefund}
									onclick={handleRefundMoney}
								>
									💰 RÉCUPÉRER LA MONNAIE
								</button>
							</div>

							{#if message}
								{@const messageColor = getMessageColor(message.type)}
								<div class="bg-{messageColor}-900/50 border border-{messageColor}-500/50 text-{messageColor}-400 border rounded-lg p-3 animate-pulse">
									{message.message}
								</div>
							{/if}

							{#if showChange && changeCoins.length > 0}
								<div class="bg-green-900/30 border border-green-500/50 rounded-xl p-4 animate-pulse">
									<h3 class="text-green-400 font-bold mb-2">🪙 Votre monnaie:</h3>
									<div class="text-white">
										{changeCoins.map(coin => formatCoin(coin)).join(' + ')}
									</div>
								</div>
							{/if}
						</div>
					</div>
				</div>
			</div>
		</div>

	{:else if currentView === 'logs'}
		<Logger />
	{/if}
</div>

<style>
    :global(body) {
        margin: 0;
        padding: 0;
    }

    .product-card {
        transition: all 0.3s ease;
    }

    .coin-btn {
        transition: transform 0.2s ease;
    }

    .coin-btn:active {
        animation: bounce 0.5s ease-in-out;
    }

    @keyframes bounce {
        0%, 20%, 53%, 80%, 100% {
            transform: translate3d(0,0,0);
        }
        40%, 43% {
            transform: translate3d(0, -15px, 0);
        }
        70% {
            transform: translate3d(0, -7px, 0);
        }
        90% {
            transform: translate3d(0, -2px, 0);
        }
    }
</style>