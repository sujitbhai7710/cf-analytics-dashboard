<script lang="ts">
  let { data } = $props();
</script>

<svelte:head>
  <title>Analytics - CF Analytics</title>
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
          <a href="/analytics" class="px-3 py-3 text-sm font-medium text-blue-600 border-b-2 border-blue-600">Analytics</a>
          <a href="/settings" class="px-3 py-3 text-sm font-medium text-gray-600 hover:text-gray-900">Settings</a>
        </div>
      </div>
    </nav>
    
    <main class="max-w-7xl mx-auto px-4 py-8">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Analytics</h2>
      
      <div class="bg-white dark:bg-gray-800 rounded-lg p-8 border border-gray-200 dark:border-gray-700">
        <p class="text-gray-600 dark:text-gray-400">Detailed analytics coming soon...</p>
        <p class="text-sm text-gray-500 mt-2">This page will show:</p>
        <ul class="text-sm text-gray-500 mt-2 list-disc pl-5">
          <li>Page-level traffic breakdown</li>
          <li>Bot detection analysis</li>
          <li>Cache performance metrics</li>
          <li>Geographic distribution</li>
          <li>Response time trends</li>
        </ul>
      </div>
    </main>
  </div>
{/if}
