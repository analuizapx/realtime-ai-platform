<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const auth = useAuthStore()
</script>

<template>
  <div>
    <div class="flex items-center gap-3">
      <h1 class="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
      <span class="flex items-center gap-1.5 rounded-full border border-signal/30 bg-signal/10 px-2.5 py-0.5 text-xs font-semibold text-signal">
        <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-signal" /> Live
      </span>
    </div>
    <p class="mt-1 text-sm text-slate-500">
      Operator: {{ auth.user?.name }} · {{ auth.user?.email }}
    </p>
    <div class="mt-6 rounded-xl border border-base-200 bg-white p-6 text-slate-500 shadow-sm">
      Real-time monitoring panel coming next…
    </div>
  </div>
</template>
