<script setup lang="ts">
import type { ConnectionStatus } from '~/composables/useInferenceStream'

const props = defineProps<{ status: ConnectionStatus }>()

// Label + color per connection state
const map: Record<ConnectionStatus, { label: string; dot: string; text: string }> = {
  connecting: { label: 'Connecting…', dot: 'bg-amber-500 animate-pulse', text: 'text-amber-700' },
  connected: { label: 'Connected', dot: 'bg-emerald-500', text: 'text-emerald-700' },
  reconnecting: { label: 'Reconnecting…', dot: 'bg-amber-500 animate-pulse', text: 'text-amber-700' },
  error: { label: 'Connection error', dot: 'bg-red-500', text: 'text-red-700' },
  disconnected: { label: 'Disconnected', dot: 'bg-slate-400', text: 'text-slate-500' },
}

const current = computed(() => map[props.status])
</script>

<template>
  <span class="inline-flex items-center gap-2 rounded-full border border-base-200 bg-white px-3 py-1 text-xs font-medium" :class="current.text">
    <span class="h-2 w-2 rounded-full" :class="current.dot" />
    {{ current.label }}
  </span>
</template>
