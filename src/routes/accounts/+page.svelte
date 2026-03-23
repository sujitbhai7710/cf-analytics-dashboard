<script lang="ts">
  let { data } = $props();
  
  let accounts = $state<any[]>([]);
  let loading = $state(true);
  let showAddForm = $state(false);
  let newAccount = $state({ accountName: '', accountId: '', apiToken: '' });
  let formError = $state('');
  let formLoading = $state(false);
  let deleteId = $state<string | null>(null);
  
  async function fetchAccounts() {
    loading = true;
    try {
      const res = await fetch('/api/accounts');
      const result = await res.json();
      accounts = result.accounts || [];
    } catch (e) {
      console.error('Failed to fetch accounts:', e);
    } finally {
      loading = false;
    }
  }
  
  async function addAccount(e: Event) {
    e.preventDefault();
    formError = '';
    formLoading = true;
    
    try {
      const res = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAccount)
      });
      
      const result = await res.json();
      
      if (!res.ok) {
        formError = result.message || 'Failed to add account';
      } else {
        accounts = [...accounts, result.account];
        showAddForm = false;
        newAccount = { accountName: '', accountId: '', apiToken: '' };
      }
    } catch (e) {
      formError = 'An error occurred';
    } finally {
      formLoading = false;
    }
  }
  
  async function deleteAccount(id: string) {
    if (!confirm('Are you sure you want to delete this account?')) return;
    
    try {
      const res = await fetch('/api/accounts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId: id })
      });
      
      if (res.ok) {
        accounts = accounts.filter(a => a.id !== id);
      }
    } catch (e) {
      console.error('Failed to delete account:', e);
    }
  }
  
  $effect(() => {
    if (data.user) fetchAccounts();
  });
</script>

<svelte:head>
  <title>Accounts - CF Analytics</title>
</svelte:head>

{#if data.user}
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <header class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <h1 class="text-xl font-bold text-gray-900 dark:text-white">CF Analytics</h1>
        <div class="flex items-center gap-4">
          <span class="text-sm text-gray-600 dark:text-gray-400">{data.user.email}</span>
          <form action="/api/auth/logout" method="POST">
            <button type="submit" class="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900">Sign Out</button>
          </form>
        </div>
      </div>
    </header>
    
    <nav class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex gap-4">
          <a href="/dashboard" class="px-3 py-3 text-sm font-medium text-gray-600 hover:text-gray-900">Overview</a>
          <a href="/accounts" class="px-3 py-3 text-sm font-medium text-blue-600 border-b-2 border-blue-600">Accounts</a>
          <a href="/analytics" class="px-3 py-3 text-sm font-medium text-gray-600 hover:text-gray-900">Analytics</a>
        </div>
      </div>
    </nav>
    
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Cloudflare Accounts</h2>
        <button onclick={() => showAddForm = !showAddForm}
          class="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
          {showAddForm ? 'Cancel' : 'Add Account'}
        </button>
      </div>
      
      {#if showAddForm}
        <form onsubmit={addAccount} class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 mb-6">
          {#if formError}
            <div class="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-700 dark:text-red-400 text-sm">{formError}</div>
          {/if}
          
          <!-- Instructions -->
          <div class="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 class="font-medium text-blue-900 dark:text-blue-200 mb-2">How to create an API Token:</h3>
            <ol class="text-sm text-blue-800 dark:text-blue-300 space-y-1 list-decimal list-inside">
              <li>Go to <a href="https://dash.cloudflare.com/profile/api-tokens" target="_blank" class="underline">Cloudflare API Tokens</a></li>
              <li>Click "Create Token"</li>
              <li>Use "Custom token" template</li>
              <li>Add permissions: <span class="font-mono bg-blue-100 dark:bg-blue-800 px-1 rounded">Account Analytics:Read</span> and <span class="font-mono bg-blue-100 dark:bg-blue-800 px-1 rounded">Workers Scripts:Read</span></li>
              <li>Copy the token and paste below</li>
            </ol>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="accountName" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Account Name</label>
              <input type="text" id="accountName" bind:value={newAccount.accountName} required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                placeholder="My Cloudflare Account" />
            </div>
            
            <div>
              <label for="accountId" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Account ID</label>
              <input type="text" id="accountId" bind:value={newAccount.accountId} required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Found in Cloudflare Dashboard URL" />
            </div>
          </div>
          
          <div class="mt-4">
            <label for="apiToken" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">API Token</label>
            <input type="password" id="apiToken" bind:value={newAccount.apiToken} required
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Your API Token (kept encrypted)" />
            <p class="mt-1 text-xs text-gray-500">Your token is encrypted and stored securely. We never store it in plain text.</p>
          </div>
          
          <div class="mt-6">
            <button type="submit" disabled={formLoading}
              class="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
              {formLoading ? 'Verifying...' : 'Add Account'}
            </button>
          </div>
        </form>
      {/if}
      
      {#if loading}
        <div class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      {:else if accounts.length > 0}
        <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
          {#each accounts as account}
            <div class="px-6 py-4 flex justify-between items-center">
              <div>
                <h3 class="font-medium text-gray-900 dark:text-white">{account.accountName}</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">Account ID: {account.accountId}</p>
              </div>
              <div class="flex items-center gap-4">
                <span class="px-2 py-1 text-xs rounded-full {account.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800'}">
                  {account.isActive ? 'Active' : 'Inactive'}
                </span>
                <button onclick={() => deleteAccount(account.id)}
                  class="text-sm text-red-600 hover:text-red-800">
                  Remove
                </button>
              </div>
            </div>
          {/each}
        </div>
      {:else}
        <div class="bg-white dark:bg-gray-800 rounded-lg p-12 border border-gray-200 dark:border-gray-700 text-center">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">No accounts</h3>
          <p class="mt-1 text-sm text-gray-500">Get started by adding a Cloudflare account.</p>
          <div class="mt-6">
            <button onclick={() => showAddForm = true}
              class="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
              Add Account
            </button>
          </div>
        </div>
      {/if}
    </main>
  </div>
{/if}
