<script setup lang="ts">
import type { User } from '~/stores/auth'

definePageMeta({ middleware: 'auth' })

const { apiFetch } = useApi()

interface UserRow extends User {
  createdAt: string
}

const users = ref<UserRow[]>([])
const loading = ref(true)
const error = ref('')

async function load() {
  loading.value = true
  error.value = ''
  try {
    users.value = await apiFetch<UserRow[]>('/users')
  } catch {
    error.value = 'Failed to load users.'
  } finally {
    loading.value = false
  }
}

onMounted(load)

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}
</script>

<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-semibold tracking-tight text-slate-900">Registered Users</h1>
      <p class="mt-1 text-sm text-slate-500">
        Everyone who has signed in to the platform.
      </p>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div v-for="n in 6" :key="n" class="h-24 animate-pulse rounded-xl border border-base-200 bg-white" />
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
      {{ error }}
      <button class="ml-2 font-medium underline" @click="load">Retry</button>
    </div>

    <!-- Empty state -->
    <div v-else-if="users.length === 0" class="rounded-xl border border-base-200 bg-white p-8 text-center text-slate-500">
      No users yet.
    </div>

    <!-- User cards -->
    <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="u in users"
        :key="u._id"
        class="flex items-center gap-4 rounded-xl border border-base-200 bg-white p-4 shadow-sm transition hover:shadow-md"
      >
        <img :src="u.picture" :alt="u.name" class="h-12 w-12 rounded-full border border-base-200">
        <div class="min-w-0">
          <p class="truncate font-semibold text-slate-900">{{ u.name }}</p>
          <p class="truncate text-sm text-slate-500">{{ u.email }}</p>
          <p class="mt-0.5 text-xs text-slate-400">Joined {{ formatDate(u.createdAt) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
