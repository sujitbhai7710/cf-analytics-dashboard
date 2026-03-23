<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  
  let { data } = $props();
  
  onMount(() => {
    if (data.user) {
      goto('/dashboard');
    }
  });
</script>

<svelte:head>
  <title>CF Analytics Dashboard</title>
  <meta name="description" content="Monitor your Cloudflare Workers and Pages traffic analytics" />
</svelte:head>

<div class="min-h-screen flex flex-col items-center justify-center px-4">
  <div class="max-w-4xl mx-auto text-center">
    <!-- Logo -->
    <div class="mb-8">
      <h1 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
        CF Analytics
      </h1>
      <p class="text-xl text-gray-600 dark:text-gray-400">
        Monitor your Cloudflare Workers & Pages traffic
      </p>
    </div>
    
    <!-- Features -->
    <div class="grid md:grid-cols-3 gap-6 mb-12">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4 mx-auto">
          <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Traffic Analytics</h3>
        <p class="text-gray-600 dark:text-gray-400 text-sm">Track requests, response times, and errors across all your workers</p>
      </div>
      
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div class="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4 mx-auto">
          <svg class="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Bot Detection</h3>
        <p class="text-gray-600 dark:text-gray-400 text-sm">Identify bots, scrapers, and suspicious traffic patterns</p>
      </div>
      
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div class="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4 mx-auto">
          <svg class="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Cache Insights</h3>
        <p class="text-gray-600 dark:text-gray-400 text-sm">Optimize cache hit rates and improve performance</p>
      </div>
    </div>
    
    <!-- CTA -->
    <div class="flex flex-col sm:flex-row gap-4 justify-center">
      <a href="/login" class="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
        Sign In
      </a>
      <a href="/register" class="px-6 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg font-medium border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
        Create Account
      </a>
    </div>
  </div>
</div>
