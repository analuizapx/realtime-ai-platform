<script setup lang="ts">
const props = defineProps<{
  level: 'LOW' | 'MEDIUM' | 'HIGH'
  score?: number
}>()

// Color mapping per risk level
const styles = {
  LOW: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  MEDIUM: 'bg-amber-50 text-amber-700 border-amber-200',
  HIGH: 'bg-red-50 text-red-700 border-red-200',
}
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold"
    :class="styles[props.level]"
  >
    <span
      class="h-1.5 w-1.5 rounded-full"
      :class="{
        'bg-emerald-500': props.level === 'LOW',
        'bg-amber-500': props.level === 'MEDIUM',
        'bg-red-500 animate-pulse': props.level === 'HIGH',
      }"
    />
    {{ props.level }}
    <span v-if="props.score !== undefined" class="font-mono opacity-70">
      {{ (props.score * 100).toFixed(0) }}%
    </span>
  </span>
</template>
