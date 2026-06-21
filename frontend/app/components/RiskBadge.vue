<script setup lang="ts">
const props = defineProps<{
  level: 'LOW' | 'MEDIUM' | 'HIGH'
  score?: number
}>()

// Traffic-light semantics: green (safe) -> orange -> red (danger)
const styles = {
  LOW: { label: 'bg-green-600', score: 'bg-green-800' },
  MEDIUM: { label: 'bg-orange-500', score: 'bg-orange-700' },
  HIGH: { label: 'bg-red-600', score: 'bg-red-800' },
}
</script>

<template>
  <span
    class="inline-flex items-stretch overflow-hidden rounded-full text-[11px] font-bold uppercase tracking-wider text-white shadow-sm"
    :class="{ 'animate-pulse': props.level === 'HIGH' }"
  >
    <!-- Level label -->
    <span class="px-2.5 py-0.5" :class="styles[props.level].label">
      {{ props.level }}
    </span>
    <!-- Score readout in a darker inset -->
    <span v-if="props.score !== undefined" class="px-2 py-0.5 tabular-nums" :class="styles[props.level].score">
      {{ (props.score * 100).toFixed(0) }}
    </span>
  </span>
</template>
