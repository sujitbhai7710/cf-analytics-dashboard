<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  
  let { data } = $props();
  
  onMount(() => {
    if (!data.user) {
      goto('/login');
    }
  });
  
  let analytics = $state<any>(null);
  let loading = $state(true);
  let period = $state('24h');
  
  async function fetchAnalytics() {
    loading = true;
    try {
      const res = await fetch(`/api/analytics/overview?period=${period}`);
      analytics = await res.json();
    } catch (e) {
      console.error('Failed to fetch analytics:', e);
    } finally {
      loading = false;
    }
  }
  
  $effect(() => {
    if (data.user) {
      fetchAnalytics();
    }
  });
</script>

<svelte:head>
  <title>Dashboard - CF Analytics</title>
</svelte:head>

{#if data.user}
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Header -->
    <header class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <h1 class="text-xl font-bold text-gray-900 dark:text-white">CF Analytics</h1>
        <div class="flex items-center gap-4">
          <span class="text-sm text-gray-600 dark:text-gray-400">{data.user.email}</span>
          <form action="/api/auth/logout" method="POST">
            <button type="submit" class="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
              Sign Out
            </button>
          </form>
        </div>
      </div>
    </header>
    
    <!-- Navigation -->
    <nav class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex gap-4">
          <a href="/dashboard" class="px-3 py-3 text-sm font-medium text-blue-600 border-b-2 border-blue-600">Overview</a>
          <a href="/accounts" class="px-3 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Accounts</a>
          <a href="/analytics" class="px-3 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Analytics</a>
          <a href="/settings" class="px-3 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Settings</a>
        </div>
      </div>
    </nav>
    
    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Period Selector -->
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Overview</h2>
        <select bind:value={period} onchange={fetchAnalytics}
          class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
        </select>
      </div>
      
      {#if loading}
        <div class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      {:else if analytics}
        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <p class="text-sm text-gray-600 dark:text-gray-400">Total Requests</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{analytics.totalRequests?.toLocaleString() || 0}</p>
          </div>
          
          <div class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <p class="text-sm text-gray-600 dark:text-gray-400">Total Errors</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{analytics.totalErrors?.toLocaleString() || 0}</p>
          </div>
          
          <div class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <p class="text-sm text-gray-600 dark:text-gray-400">Error Rate</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">
              {analytics.totalRequests > 0 ? ((analytics.totalErrors / analytics.totalRequests) * 100).toFixed(2) : 0}%
            </p>
          </div>
          
          <div class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <p class="text-sm text-gray-600 dark:text-gray-400">Avg CPU Time</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{analytics.avgCpuTime?.toFixed(2) || 0}ms</p>
          </div>
        </div>
        
        <!-- Accounts List -->
        <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Cloudflare Accounts</h3>
          </div>
          
          {#if analytics.accounts?.length > 0}
            <div class="divide-y divide-gray-200 dark:divide-gray-700">
              {#each analytics.accounts as account}
                <div class="px-6 py-4">
                  <div class="flex justify-between items-start">
                    <div>
                      <h4 class="font-medium text-gray-900 dark:text-white">{account.accountName}</h4>
                      <p class="text-sm text-gray-600 dark:text-gray-400">Account ID: {account.cfAccountId}</p>
                    </div>
                    <div class="text-right">
                      <p class="text-sm text-gray-600 dark:text-gray-400">{account.workers?.length || 0} workers</p>
                    </div>
                  </div>
                  
                  {#if account.workers?.length > 0}
                    <div class="mt-3 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                      {#each account.workers.slice(0, 3) as worker}
                        <p class="text-sm text-gray-600 dark:text-gray-400 py-1">
                          <span class="font-medium text-gray-900 dark:text-white">{worker.name}</span>
                          - {worker.data?.reduce((sum: number, d: any) => sum + (d.sum?.requests || 0), 0)} requests
                        </p>
                      {/each}
                    </div>
                  {/if}
                </div>
              {/each}
            </div>
          {:else}
            <div class="px-6 py-12 text-center">
              <p class="text-gray-600 dark:text-gray-400">No accounts configured</p>
              <a href="/accounts" class="mt-2 inline-block text-blue-600 hover:text-blue-500">Add a Cloudflare account</a>
            </div>
          {/if}
        </div>
      {/if}
    </main>
  </div>
{/if}
