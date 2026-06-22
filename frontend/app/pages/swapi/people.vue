<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { apiFetch } = useApi()

interface Person {
  uid: string
  name: string
  url: string
}
interface PeopleResponse {
  page: number
  totalPages: number
  totalRecords: number
  results: Person[]
}

const data = ref<PeopleResponse | null>(null)
const loading = ref(true)
const error = ref('')
const page = ref(1)

// Detail panel state
const selected = ref<Record<string, string> | null>(null)
const detailLoading = ref(false)

async function load() {
  loading.value = true
  error.value = ''
  try {
    data.value = await apiFetch<PeopleResponse>(`/swapi/people?page=${page.value}&limit=20`)
  } catch {
    error.value = 'Failed to load characters.'
  } finally {
    loading.value = false
  }
}

// Fetch full details of one character directly from SWAPI
async function openDetails(person: Person) {
  selected.value = null
  detailLoading.value = true
  try {
    const res = await $fetch<{ result: { properties: Record<string, string> } }>(person.url)
    selected.value = res.result.properties
  } catch {
    selected.value = null
  } finally {
    detailLoading.value = false
  }
}

function changePage(next: number) {
  page.value = next
  load()
}

onMounted(load)

const detailFields = [
  ['height', 'Height'],
  ['mass', 'Mass'],
  ['birth_year', 'Birth year'],
  ['gender', 'Gender'],
  ['eye_color', 'Eye color'],
  ['hair_color', 'Hair color'],
] as const
</script>

<template>
  <div class="flex flex-1 flex-col">
    <div class="mb-6">
      <h1 class="sw-display text-2xl font-bold tracking-wide" style="color: var(--accent)">
        Characters
      </h1>
      <p class="mt-1 min-h-5 text-sm" style="color: var(--text-muted)">
        <template v-if="data">{{ data.totalRecords }} characters · page {{ data.page }} of {{ data.totalPages }}</template>
      </p>
    </div>

    <div class="grid flex-1 gap-6 lg:grid-cols-3">
      <!-- List -->
      <div class="flex flex-col lg:col-span-2">
        <div v-if="loading" class="grid flex-1 gap-2 sm:grid-cols-2 lg:auto-rows-fr">
          <div v-for="n in 20" :key="n" class="min-h-9 max-h-12 animate-pulse rounded-lg border" style="background: var(--surface); border-color: var(--border)" />
        </div>

        <div v-else-if="error" class="rounded-xl border border-red-500/40 bg-red-950/40 p-4 text-sm text-red-300">
          {{ error }}
          <button class="ml-2 font-medium underline" @click="load">Retry</button>
        </div>

        <div v-else class="grid flex-1 gap-2 sm:grid-cols-2 lg:auto-rows-fr">
          <button
            v-for="p in data?.results"
            :key="p.uid"
            class="flex min-h-9 max-h-12 items-center justify-between rounded-lg border px-3 text-left backdrop-blur transition hover:scale-[1.02]"
            style="background: var(--surface); border-color: var(--border)"
            :class="{ 'ring-1': selected && selected.name === p.name }"
            @click="openDetails(p)"
          >
            <span class="sw-display truncate text-xs font-medium" style="color: var(--text-strong)">{{ p.name }}</span>
            <span class="ml-2 shrink-0 text-[11px]" style="color: var(--text-muted)">#{{ p.uid }}</span>
          </button>
        </div>

        <!-- Pagination -->
        <div v-if="data" class="mt-4 flex items-center justify-center gap-2">
          <button
            class="rounded-md border px-3 py-1.5 text-sm font-medium backdrop-blur transition hover:opacity-80 disabled:opacity-40"
            style="background: var(--surface); border-color: var(--border); color: var(--text-strong)"
            :disabled="page <= 1"
            @click="changePage(page - 1)"
          >
            ← Prev
          </button>
          <span class="px-2 text-sm" style="color: var(--text-muted)">{{ data.page }} / {{ data.totalPages }}</span>
          <button
            class="rounded-md border px-3 py-1.5 text-sm font-medium backdrop-blur transition hover:opacity-80 disabled:opacity-40"
            style="background: var(--surface); border-color: var(--border); color: var(--text-strong)"
            :disabled="page >= data.totalPages"
            @click="changePage(page + 1)"
          >
            Next →
          </button>
        </div>
      </div>

      <!-- Detail panel (transparent, lighter type) -->
      <aside class="p-1">
        <h2 class="sw-display text-sm font-bold uppercase tracking-wider" style="color: var(--accent)">Details</h2>

        <!-- Skeleton mirrors the loaded layout exactly to avoid layout shift -->
        <div v-if="detailLoading" class="mt-4">
          <div class="h-7 w-2/3 animate-pulse rounded bg-white/10" />
          <div class="mt-3 space-y-2">
            <div v-for="n in 6" :key="n" class="flex justify-between border-b border-white/5 pb-2">
              <div class="h-4 w-20 animate-pulse rounded bg-white/10" />
              <div class="h-4 w-12 animate-pulse rounded bg-white/10" />
            </div>
          </div>
        </div>

        <div v-else-if="selected" class="mt-4">
          <p class="sw-display min-h-7 text-lg font-semibold leading-7" style="color: var(--text-strong)">{{ selected.name }}</p>
          <dl class="mt-3 space-y-2">
            <div v-for="[key, lbl] in detailFields" :key="key" class="flex justify-between border-b border-white/5 pb-2 text-sm">
              <dt style="color: var(--text-muted)">{{ lbl }}</dt>
              <dd class="font-medium" style="color: var(--text-strong)">{{ selected[key] || '—' }}</dd>
            </div>
          </dl>
        </div>

        <p v-else class="mt-4 text-sm" style="color: var(--text-muted)">
          Select a character to see details.
        </p>
      </aside>
    </div>
  </div>
</template>
