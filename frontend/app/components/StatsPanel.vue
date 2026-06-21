<script setup lang="ts">
const { apiFetch } = useApi()

interface Stats {
  totalEvents: number
  ppeDistribution: { class: string; count: number; percentage: number }[]
  emotionDistribution: { emotion: string; count: number }[]
  avgTimeBetweenHighRisk: { avgSeconds: number | null; samples: number }
}

const stats = ref<Stats | null>(null)
let timer: ReturnType<typeof setInterval> | null = null

async function load() {
  try {
    stats.value = await apiFetch<Stats>('/events/stats')
  } catch {
    // keep previous values on a transient error
  }
}

onMounted(() => {
  load()
  // Refresh the aggregations every 3s so the dashboard stays live
  timer = setInterval(load, 3000)
})
onBeforeUnmount(() => timer && clearInterval(timer))

// Max emotion count for drawing simple bars
const maxEmotion = computed(() =>
  Math.max(1, ...(stats.value?.emotionDistribution.map((e) => e.count) ?? [])),
)
</script>

<template>
  <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
    <!-- Two compact metric tiles, centered with an accent icon -->
    <div class="grid grid-cols-2 gap-4 sm:col-span-2 lg:col-span-2">
      <!-- Total events -->
      <div class="flex flex-col items-center justify-center rounded-xl border border-base-200 bg-white p-4 text-center shadow-sm">
        <span class="flex h-9 w-9 items-center justify-center rounded-lg bg-signal/10 text-signal">
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 12h4l2 7 4-14 2 7h4" />
          </svg>
        </span>
        <p class="mt-2 text-3xl font-semibold leading-none text-slate-900">{{ stats?.totalEvents ?? '—' }}</p>
        <p class="mt-1.5 text-xs text-slate-500">Events processed</p>
      </div>

      <!-- Avg time between high risk -->
      <div class="flex flex-col items-center justify-center rounded-xl border border-base-200 bg-white p-4 text-center shadow-sm">
        <span class="flex h-9 w-9 items-center justify-center rounded-lg bg-signal/10 text-signal">
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
          </svg>
        </span>
        <p class="mt-2 text-3xl font-semibold leading-none text-slate-900">
          {{ stats?.avgTimeBetweenHighRisk.avgSeconds ?? '—' }}<span class="text-base text-slate-400">s</span>
        </p>
        <p class="mt-1.5 text-xs text-slate-500">Avg gap · high risk</p>
      </div>
    </div>

    <!-- PPE distribution -->
    <div class="flex flex-col rounded-xl border border-base-200 bg-white p-4 shadow-sm">
      <div class="flex items-center gap-2 text-slate-700">
        <svg class="h-4 w-4 text-signal" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2 4 5v6c0 5 3.5 8 8 11 4.5-3 8-6 8-11V5z" />
        </svg>
        <span class="text-sm font-semibold text-slate-700">PPE detections</span>
      </div>
      <div class="mt-3 flex flex-1 flex-col justify-center gap-1.5">
        <div v-for="p in stats?.ppeDistribution" :key="p.class" class="flex items-center justify-between text-sm">
          <span class="capitalize text-slate-600">{{ p.class }}</span>
          <span class="font-mono font-medium text-slate-900">{{ p.percentage }}%</span>
        </div>
        <p v-if="!stats?.ppeDistribution?.length" class="text-center text-xs text-slate-400">No data yet</p>
      </div>
    </div>

    <!-- Emotion distribution -->
    <div class="flex flex-col rounded-xl border border-base-200 bg-white p-4 shadow-sm">
      <div class="flex items-center gap-2 text-slate-700">
        <svg class="h-4 w-4 text-signal" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M8 14s1.5 2 4 2 4-2 4-2" />
          <path d="M9 9h.01M15 9h.01" />
        </svg>
        <span class="text-sm font-semibold text-slate-700">Emotions</span>
      </div>
      <div class="mt-3 flex flex-1 flex-col justify-center gap-1.5">
        <div v-for="e in stats?.emotionDistribution" :key="e.emotion" class="text-sm">
          <div class="flex items-center justify-between">
            <span class="capitalize text-slate-600">{{ e.emotion }}</span>
            <span class="font-mono text-xs text-slate-500">{{ e.count }}</span>
          </div>
          <div class="mt-0.5 h-1.5 overflow-hidden rounded-full bg-base-100">
            <div class="h-full rounded-full bg-signal" :style="{ width: `${(e.count / maxEmotion) * 100}%` }" />
          </div>
        </div>
        <p v-if="!stats?.emotionDistribution?.length" class="text-xs text-slate-400">No data yet</p>
      </div>
    </div>
  </div>
</template>
