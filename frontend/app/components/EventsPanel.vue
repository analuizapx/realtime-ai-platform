<script setup lang="ts">
import type { StreamFrame } from '~/composables/useInferenceStream'

const props = defineProps<{ frames: StreamFrame[] }>()

function time(ts: string) {
  return new Date(ts).toLocaleTimeString('en-GB')
}
</script>

<template>
  <div class="flex h-full flex-col rounded-xl border border-base-200 bg-white shadow-sm">
    <div class="flex items-center justify-between border-b border-base-200 px-4 py-3">
      <h2 class="text-sm font-semibold uppercase tracking-wider text-slate-400">Recent Events</h2>
      <span class="rounded-full bg-base-100 px-2 py-0.5 font-mono text-[11px] text-slate-500">
        {{ props.frames.length }}
      </span>
    </div>

    <div class="min-h-0 max-h-[28rem] flex-1 divide-y divide-base-100 overflow-y-auto lg:max-h-none">
      <div
        v-for="frame in props.frames"
        :key="frame.frameId"
        class="flex items-center justify-between gap-2 px-4 py-2.5"
      >
        <div class="min-w-0">
          <p class="truncate text-sm font-medium text-slate-700">
            {{ frame.overlay.emotions[0]?.label ?? '—' }}
            <span v-if="frame.overlay.risk.reasons.length" class="text-slate-400">
              · {{ frame.overlay.risk.reasons.join(', ') }}
            </span>
          </p>
          <p class="font-mono text-[11px] text-slate-400">{{ time(frame.ts) }}</p>
        </div>
        <RiskBadge :level="frame.overlay.risk.level" />
      </div>

      <div v-if="!props.frames.length" class="px-4 py-8 text-center text-sm text-slate-400">
        Waiting for events…
      </div>
    </div>
  </div>
</template>
