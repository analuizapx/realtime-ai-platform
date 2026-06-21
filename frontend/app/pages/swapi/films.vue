<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { apiFetch } = useApi()

interface Film {
  uid: string
  title: string
  episodeId: number
  director: string
  producer: string
  releaseDate: string
  openingCrawl: string
}

const films = ref<Film[]>([])
const loading = ref(true)
const error = ref('')
const expanded = ref<string | null>(null)

async function load() {
  loading.value = true
  error.value = ''
  try {
    films.value = await apiFetch<Film[]>('/swapi/films')
  } catch {
    error.value = 'Failed to load films.'
  } finally {
    loading.value = false
  }
}

function toggle(uid: string) {
  expanded.value = expanded.value === uid ? null : uid
}

// Split into two independent columns so expanding one doesn't move the other.
// First half goes left, second half right (keeps reading order on mobile too).
const columns = computed(() => {
  const half = Math.ceil(films.value.length / 2)
  return [films.value.slice(0, half), films.value.slice(half)]
})

const roman = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX']

onMounted(load)
</script>

<template>
  <div>
    <div class="mb-6">
      <h1 class="sw-display text-2xl font-bold tracking-wide" style="color: var(--accent)">Films</h1>
      <p class="mt-1 text-sm" style="color: var(--text-muted)">Click a film to read its opening crawl.</p>
    </div>

    <div v-if="loading" class="grid gap-4 md:grid-cols-2">
      <div v-for="n in 6" :key="n" class="h-32 animate-pulse rounded-xl border" style="background: var(--surface); border-color: var(--border)" />
    </div>

    <div v-else-if="error" class="rounded-xl border border-red-500/40 bg-red-950/40 p-4 text-sm text-red-300">
      {{ error }}
      <button class="ml-2 font-medium underline" @click="load">Retry</button>
    </div>

    <!-- Two independent columns: expanding a card only pushes cards in its own column -->
    <div v-else class="grid items-start gap-4 md:grid-cols-2">
      <div v-for="(column, ci) in columns" :key="ci" class="flex flex-col gap-4">
        <article
          v-for="film in column"
          :key="film.uid"
          class="cursor-pointer rounded-xl border p-5 backdrop-blur transition hover:scale-[1.01]"
          style="background: var(--surface); border-color: var(--border)"
          @click="toggle(film.uid)"
        >
          <div class="flex items-start justify-between gap-3">
            <div>
              <span class="sw-display text-xs font-bold uppercase tracking-wider" style="color: var(--accent)">
                Episode {{ roman[film.episodeId] }}
              </span>
              <h2 class="sw-display text-lg font-semibold" style="color: var(--text-strong)">{{ film.title }}</h2>
            </div>
            <span class="shrink-0 rounded-md px-2 py-1 text-xs font-medium" style="background: rgba(255,232,31,0.1); color: var(--accent)">
              {{ film.releaseDate }}
            </span>
          </div>

          <p class="mt-2 text-sm" style="color: var(--text-muted)">
            Directed by <span class="font-medium" style="color: var(--text-strong)">{{ film.director }}</span>
          </p>

          <!-- Opening crawl, expandable inline -->
          <Transition name="fade">
            <p
              v-if="expanded === film.uid"
              class="mt-3 whitespace-pre-line border-t pt-3 text-sm italic leading-relaxed"
              style="border-color: var(--border); color: var(--accent)"
            >
              {{ film.openingCrawl }}
            </p>
          </Transition>

          <p v-if="expanded !== film.uid" class="mt-3 text-xs font-medium" style="color: var(--accent)">
            Read opening crawl →
          </p>
        </article>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
