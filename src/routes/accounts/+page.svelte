<script lang="ts">
  let { data } = $props();
  
  let accounts = $state<any[]>([]);
  let loading = $state(true);
  let showAddForm = $state(false);
  let newAccount = $state({ accountName: '', accountId: '', apiToken: '' });
  let formError = $state('');
  let formLoading = $state(false);
  
  async function fetchAccounts() {
    loading = true;
    try {
      const res = await fetch('/api/accounts');
      const data = await res.json();
      accounts = data.accounts || [];
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
      
      const data = await res.json();
      
      if (!res.ok) {
        formError = data.error || 'Failed to add account';
      } else {
        accounts = [...accounts, data.account];
        showAddForm = false;
        newAccount = { accountName: '', accountId: '', apiToken: '' };
      }
    } catch (e) {
      formError = 'An error occurred';
    } finally {
      formLoading = false;
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
          <a href="/settings" class="px-3 py-3 text-sm font-medium text-gray-600 hover:text-gray-900">Settings</a>
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
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Account Name</label>
              <input type="text" bind:value={newAccount.accountName} required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
                placeholder="My Cloudflare Account" />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cloudflare Account ID</label>
              <input type="text" bind:value={newAccount.accountId} required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Your Cloudflare Account ID" />
            </div>
          </div>
          
          <div class="mt-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">API Token</label>
            <input type="password" bind:value={newAccount.apiToken} required
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Your Cloudflare API Token" />
            <p class="mt-1 text-xs text-gray-500">Create an API token with Workers Scripts:Read and Account Analytics:Read permissions</p>
          </div>
          
          <div class="mt-4">
            <button type="submit" disabled={formLoading}
              class="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">
              {formLoading ? 'Adding...' : 'Add Account'}
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
                <h3 class="font-medium text-gray-900 dark:text-white">{account.account_name}</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">Account ID: {account.account_id}</p>
              </div>
              <div class="flex items-center gap-2">
                <span class="px-2 py-1 text-xs rounded-full {account.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800'}">
                  {account.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          {/each}
        </div>
      {:else}
        <div class="bg-white dark:bg-gray-800 rounded-lg p-12 border border-gray-200 dark:border-gray-700 text-center">
          <p class="text-gray-600 dark:text-gray-400">No Cloudflare accounts configured yet</p>
          <p class="text-sm text-gray-500 mt-2">Add an account to start tracking analytics</p>
        </div>
      {/if}
    </main>
  </div>
{/if}
