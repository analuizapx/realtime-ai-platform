<script setup lang="ts">
import type { StreamFrame, ConnectionStatus } from '~/composables/useInferenceStream'

const props = defineProps<{
  frame: StreamFrame | null
  status: ConnectionStatus
}>()

// The mock bbox is [x, y, w, h] in a roughly 0..220 space.
// Convert to percentages so boxes scale with the responsive player.
const SPACE = 220
function boxStyle(bbox: [number, number, number, number]) {
  const [x, y, w, h] = bbox
  return {
    left: `${(x / SPACE) * 100}%`,
    top: `${(y / SPACE) * 100}%`,
    width: `${(w / SPACE) * 100}%`,
    height: `${(h / SPACE) * 100}%`,
  }
}

// Distinct color per PPE class, so each detection box stands out
const classColors: Record<string, { border: string; bg: string }> = {
  helmet: { border: '#38bdf8', bg: '#0ea5e9' }, // sky
  vest: { border: '#fbbf24', bg: '#f59e0b' }, // amber
  gloves: { border: '#a78bfa', bg: '#8b5cf6' }, // violet
}
function colorFor(cls: string) {
  return classColors[cls] ?? { border: '#2dd4bf', bg: '#0d9488' } // teal fallback
}
</script>

<template>
  <div class="relative aspect-video w-full overflow-hidden rounded-xl border border-base-200 bg-slate-900">
    <!-- Simulated camera scene (gradient + grid, stands in for a video feed) -->
    <div class="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950" />
    <div
      class="absolute inset-0 opacity-30"
      style="background-image: linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px); background-size: 32px 32px;"
    />

    <!-- Top-left: camera indicator + frame id -->
    <div class="absolute left-3 top-3 space-y-1">
      <div class="flex items-center gap-1.5 text-xs font-medium text-white/80">
        <span class="h-2 w-2 animate-pulse rounded-full bg-red-500" />
        <span class="font-mono">CAM-01 · LIVE</span>
      </div>
      <p v-if="props.frame" class="font-mono text-[10px] text-white/40">{{ props.frame.frameId }}</p>
    </div>

    <!-- Top-right: connection status -->
    <div class="absolute right-3 top-3">
      <ConnectionStatus :status="props.status" />
    </div>

    <!-- Bounding boxes overlay (one color per object class) -->
    <template v-if="props.frame">
      <div
        v-for="(box, i) in props.frame.overlay.boxes"
        :key="i"
        class="absolute rounded border-2"
        :style="{ ...boxStyle(box.bbox), borderColor: colorFor(box.class).border }"
      >
        <span
          class="absolute -top-5 left-0 whitespace-nowrap rounded px-1.5 py-0.5 text-[10px] font-semibold text-white"
          :style="{ backgroundColor: colorFor(box.class).bg }"
        >
          {{ box.class }} {{ (box.score * 100).toFixed(0) }}%
        </span>
      </div>
    </template>

    <!-- Bottom overlay: current emotion + risk -->
    <div
      v-if="props.frame"
      class="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 bg-gradient-to-t from-black/70 to-transparent p-3"
    >
      <div class="flex items-center gap-2">
        <span
          v-for="(e, i) in props.frame.overlay.emotions"
          :key="i"
          class="rounded-md bg-white/10 px-2 py-1 text-xs font-medium text-white backdrop-blur"
        >
          {{ e.label }} · {{ (e.score * 100).toFixed(0) }}%
        </span>
      </div>
      <RiskBadge :level="props.frame.overlay.risk.level" :score="props.frame.overlay.risk.score" />
    </div>

    <!-- Waiting state -->
    <div v-if="!props.frame" class="absolute inset-0 flex items-center justify-center text-sm text-white/40">
      Waiting for stream…
    </div>
  </div>
</template>
