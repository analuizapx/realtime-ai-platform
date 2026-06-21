<script setup lang="ts">
const auth = useAuthStore()
const route = useRoute()

// Switch only the content area to the Star Wars theme on SWAPI routes
const isStarWars = computed(() => route.path.startsWith('/swapi'))

// Make sure we know who is logged in when the layout mounts
onMounted(() => {
  if (!auth.user) auth.fetchUser()
})

const navLinks = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/users', label: 'Users' },
  { to: '/swapi/people', label: 'Characters' },
  { to: '/swapi/films', label: 'Films' },
]
</script>

<template>
  <div class="flex min-h-screen flex-col text-slate-800">
    <!-- Top navigation bar: always the light corporate theme -->
    <header class="border-b border-base-200 bg-white">
      <nav class="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <NuxtLink to="/dashboard" class="flex items-center gap-2.5">
          <span class="brand-gradient brand-halo h-3 w-3 animate-pulse rounded-full" />
          <span class="text-lg font-semibold tracking-tight text-slate-900">RealtimeAI</span>
        </NuxtLink>

        <div v-if="auth.isLoggedIn" class="flex items-center gap-1">
          <NuxtLink
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            class="rounded-md px-3 py-1.5 text-sm font-medium text-slate-500 transition hover:bg-base-100 hover:text-slate-900"
            active-class="!bg-signal/10 !text-signal"
          >
            {{ link.label }}
          </NuxtLink>
        </div>

        <div v-if="auth.isLoggedIn" class="flex items-center gap-3">
          <img
            v-if="auth.user?.picture"
            :src="auth.user.picture"
            :alt="auth.user?.name"
            class="h-8 w-8 rounded-full border border-base-200"
          >
          <span class="hidden text-sm font-medium text-slate-600 sm:block">{{ auth.user?.name }}</span>
          <button
            class="rounded-md border border-base-200 px-3 py-1.5 text-sm font-medium text-slate-500 transition hover:bg-base-100 hover:text-slate-900"
            @click="auth.logout()"
          >
            Logout
          </button>
        </div>
      </nav>
    </header>

    <!-- Content area: gets the Star Wars theme only on SWAPI routes -->
    <div
      class="flex flex-1 flex-col transition-colors duration-500"
      :class="{ 'theme-sw': isStarWars }"
    >
      <main class="mx-auto flex w-full max-w-7xl flex-1 flex-col px-6 py-8">
        <slot />
      </main>
    </div>
  </div>
</template>
