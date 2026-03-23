<script lang="ts">
  let { data } = $props();
</script>

<svelte:head>
  <title>Settings - CF Analytics</title>
</svelte:head>

{#if data.user}
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <header class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <h1 class="text-xl font-bold text-gray-900 dark:text-white">CF Analytics</h1>
        <div class="flex items-center gap-4">
          <span class="text-sm text-gray-600 dark:text-gray-400">{data.user.email}</span>
          <form action="/api/auth/logout" method="POST">
            <button type="submit" class="text-sm text-gray-600 hover:text-gray-900">Sign Out</button>
          </form>
        </div>
      </div>
    </header>
    
    <nav class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex gap-4">
          <a href="/dashboard" class="px-3 py-3 text-sm font-medium text-gray-600 hover:text-gray-900">Overview</a>
          <a href="/accounts" class="px-3 py-3 text-sm font-medium text-gray-600 hover:text-gray-900">Accounts</a>
          <a href="/analytics" class="px-3 py-3 text-sm font-medium text-gray-600 hover:text-gray-900">Analytics</a>
          <a href="/settings" class="px-3 py-3 text-sm font-medium text-blue-600 border-b-2 border-blue-600">Settings</a>
        </div>
      </div>
    </nav>
    
    <main class="max-w-7xl mx-auto px-4 py-8">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Settings</h2>
      
      <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
        <div class="px-6 py-4">
          <h3 class="font-medium text-gray-900 dark:text-white">Account</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Email: {data.user.email}</p>
        </div>
        
        <div class="px-6 py-4">
          <h3 class="font-medium text-gray-900 dark:text-white">API Tokens</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Manage your API tokens for programmatic access</p>
          <p class="text-xs text-gray-500 mt-1">Coming soon...</p>
        </div>
        
        <div class="px-6 py-4">
          <h3 class="font-medium text-gray-900 dark:text-white">Notifications</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Configure email notifications for alerts</p>
          <p class="text-xs text-gray-500 mt-1">Coming soon...</p>
        </div>
        
        <div class="px-6 py-4">
          <h3 class="font-medium text-gray-900 dark:text-white">Danger Zone</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Delete your account and all associated data</p>
          <button class="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">Delete Account</button>
        </div>
      </div>
    </main>
  </div>
{/if}
