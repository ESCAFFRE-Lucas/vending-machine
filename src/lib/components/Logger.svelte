<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { TransactionLogger } from '../../core/logger/TransactionLogger';
	import type { ErrorLog, SaleLog, TransactionLog } from '../../core/interfaces/ItransactionLogger';


	let logger: TransactionLogger;
	let logs: TransactionLog[] = [];
	let filterArray = ['ALL', 'SALE', 'ERROR', 'RESTOCK'] as const;

	let filter: typeof filterArray[number] = 'ALL';

	$: salesLogs = logs.filter(log => log.type === 'SALE') as SaleLog[];
	$: errorLogs = logs.filter(log => log.type === 'ERROR') as ErrorLog[];
	$: totalRevenue = salesLogs.reduce((sum, sale) => sum + sale.price, 0);
	$: todaysLogs = logs.filter(log => log.timestamp.startsWith(new Date().toISOString().split('T')[0]));

	$: filteredLogs = filter === 'ALL' ? logs : logs.filter(log => log.type === filter);

	let refreshInterval: number;

	onMount(() => {
		logger = TransactionLogger.getInstance();
		refreshLogs();

		refreshInterval = setInterval(refreshLogs, 3000);

		if (typeof window !== 'undefined') {
			window.addEventListener('transaction-log-added', handleNewLog);
		}
	});

	onDestroy(() => {
		if (refreshInterval) clearInterval(refreshInterval);
		if (typeof window !== 'undefined') {
			window.removeEventListener('transaction-log-added', handleNewLog);
		}
	});

	function handleNewLog(event: Event) {
		const customEvent = event as CustomEvent;
		logs = customEvent.detail.allLogs;
	}

	function refreshLogs() {
		if (logger) {
			logs = logger.getAllLogs().sort((a, b) =>
				new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
			);
		}
	}

	function clearLogs() {
		if (confirm('Supprimer tous les logs ?')) {
			logger.clearLogs();
			logs = [];
		}
	}

	function formatTime(timestamp: string): string {
		return new Date(timestamp).toLocaleString('fr-FR');
	}

	function formatEuros(cents: number): string {
		return (cents / 100).toFixed(2) + '€';
	}

	function getLogColor(type: string): string {
		return type === 'SALE' ? 'text-green-400' :
			type === 'ERROR' ? 'text-red-400' : 'text-blue-400';
	}

	function getLogIcon(type: string): string {
		return type === 'SALE' ? '💰' :
			type === 'ERROR' ? '❌' : '📦';
	}
</script>

<div class="bg-gray-900 min-h-screen p-4">
	<div class="max-w-6xl mx-auto">

		<div class="bg-gray-800 rounded-lg p-6 mb-6">
			<h1 class="text-2xl font-bold text-white mb-4">📊 Logs de la Distributrice</h1>

			<div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
				<div class="bg-green-900/30 rounded p-3">
					<div class="text-green-400 text-sm">Ventes totales</div>
					<div class="text-white text-xl font-bold">{salesLogs.length}</div>
				</div>
				<div class="bg-blue-900/30 rounded p-3">
					<div class="text-blue-400 text-sm">Revenus</div>
					<div class="text-white text-xl font-bold">{formatEuros(totalRevenue)}</div>
				</div>
				<div class="bg-red-900/30 rounded p-3">
					<div class="text-red-400 text-sm">Erreurs</div>
					<div class="text-white text-xl font-bold">{errorLogs.length}</div>
				</div>
				<div class="bg-purple-900/30 rounded p-3">
					<div class="text-purple-400 text-sm">Aujourd'hui</div>
					<div class="text-white text-xl font-bold">{todaysLogs.length}</div>
				</div>
			</div>
		</div>

		<div class="bg-gray-800 rounded-lg p-4 mb-6 flex justify-between items-center">
			<div class="flex gap-2">
				{#each filterArray as filterOption (filterOption)}
					<button
						class="px-4 py-2 rounded {filter === filterOption
							? 'bg-blue-600 text-white'
							: 'bg-gray-700 text-gray-300 hover:bg-gray-600'}"
						onclick={() => filter = filterOption}
					>
						{filterOption === 'ALL' ? 'TOUS' : filterOption}
					</button>
				{/each}
			</div>

			<div class="flex gap-2">
				<button
					onclick={refreshLogs}
					class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
				>
					🔄 Actualiser
				</button>
				<button
					onclick={clearLogs}
					class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
				>
					🗑️ Vider
				</button>
			</div>
		</div>

		<div class="bg-gray-800 rounded-lg p-4">
			<h2 class="text-lg font-bold text-white mb-4">
				Historique ({filteredLogs.length} entrées)
			</h2>

			{#if filteredLogs.length === 0}
				<div class="text-center py-8 text-gray-400">
					Aucun log trouvé
				</div>
			{:else}
				<div class="space-y-2 max-h-96 overflow-y-auto">
					{#each filteredLogs as log (log)}
						<div class="bg-gray-700 rounded p-3 flex items-start gap-3">
							<span class="text-xl">{getLogIcon(log.type)}</span>
							<div class="flex-1">
								<div class="flex justify-between items-start mb-1">
									<span class="font-bold {getLogColor(log.type)}">{log.type}</span>
									<span class="text-xs text-gray-400">{formatTime(log.timestamp)}</span>
								</div>

								{#if log.type === 'SALE'}
									{@const sale = log as SaleLog}
									<div class="text-sm text-gray-300">
										<strong>{sale.productName}</strong> ({sale.productCode}) -
										{formatEuros(sale.price)} -
										Monnaie: {formatEuros(sale.change)}
									</div>
								{:else if log.type === 'ERROR'}
									{@const error = log as ErrorLog}
									<div class="text-sm text-gray-300">
										<strong>{error.errorType.replace('_', ' ')}</strong>
										{#if error.context.productCode}
											- Produit: {error.context.productCode}
										{/if}
									</div>
								{:else if log.type === 'RESTOCK'}
									{@const restock = log as RestockLog}
									<div class="text-sm text-gray-300">
										<strong>{restock.productCode}</strong> +{restock.quantityAdded}
										(Stock: {restock.newStock})
									</div>
								{/if}

								{#if log.sessionId}
									<div class="text-xs text-gray-500 mt-1">
										Session: {log.sessionId.slice(-8)}
									</div>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>

		<div class="text-center mt-4 text-gray-400 text-sm">
			🔄 Actualisation automatique toutes les 3 secondes
		</div>
	</div>
</div>