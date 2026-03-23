<script lang="ts">
  let email = $state('');
  let password = $state('');
  let name = $state('');
  let error = $state('');
  let loading = $state(false);
  
  async function handleSubmit(e: Event) {
    e.preventDefault();
    loading = true;
    error = '';
    
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        error = data.error || 'Registration failed';
      } else {
        window.location.href = '/dashboard';
      }
    } catch (e) {
      error = 'An error occurred';
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Register - CF Analytics</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center px-4">
  <div class="max-w-md w-full">
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Create Account</h1>
      <p class="mt-2 text-gray-600 dark:text-gray-400">Get started with CF Analytics</p>
    </div>
    
    <form onsubmit={handleSubmit} class="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm border border-gray-200 dark:border-gray-700">
      {#if error}
        <div class="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
          {error}
        </div>
      {/if}
      
      <div class="space-y-4">
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
          <input type="text" id="name" bind:value={name}
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" />
        </div>
        
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
          <input type="email" id="email" bind:value={email} required
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" />
        </div>
        
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
          <input type="password" id="password" bind:value={password} required minlength={8}
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" />
        </div>
        
        <button type="submit" disabled={loading}
          class="w-full py-2 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </div>
      
      <p class="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
        Already have an account? <a href="/login" class="text-blue-600 hover:text-blue-500">Sign in</a>
      </p>
    </form>
  </div>
</div>
