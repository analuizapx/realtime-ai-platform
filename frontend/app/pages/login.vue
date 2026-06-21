<script setup lang="ts">
const auth = useAuthStore()

// If already logged in, skip the login screen
onMounted(async () => {
  await auth.fetchUser()
  if (auth.isLoggedIn) navigateTo('/dashboard')
})
</script>

<template>
  <div class="flex min-h-[75vh] items-center justify-center">
    <div class="w-full max-w-md rounded-xl border border-base-200 bg-white p-8 shadow-sm">
      <div class="mb-6 flex items-center gap-4">
        <span class="brand-gradient brand-halo h-4 w-4 animate-pulse rounded-full" />
        <div>
          <h1 class="text-xl font-semibold leading-tight tracking-tight text-slate-900">
            RealtimeAI
          </h1>
          <p class="text-xs font-medium uppercase tracking-wider text-slate-400">
            Risk Monitoring System
          </p>
        </div>
      </div>

      <p class="text-sm leading-relaxed text-slate-500">
        Real-time risk &amp; emotion analysis for workplace safety.
        Sign in to access the control panel.
      </p>

      <button
        class="mt-6 flex w-full items-center justify-center gap-3 rounded-lg bg-signal px-4 py-3 font-semibold text-white transition hover:bg-signal-soft"
        @click="auth.login()"
      >
        <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" class="h-5 w-5 rounded-full bg-white p-0.5">
        Sign in with Google
      </button>

      <p class="mt-4 text-center text-xs text-slate-400">
        Secure OAuth 2.0 · Session encrypted
      </p>
    </div>
  </div>
</template>
