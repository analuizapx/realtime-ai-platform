<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { status, latestFrame, recentFrames } = useInferenceStream()
</script>

<template>
  <div>
    <!-- Main grid: left = video + stats, right = events panel matching that height.
         The right panel is absolutely positioned on desktop so it follows the
         left column's height (its bottom aligns with the stats cards). -->
    <div class="grid items-stretch gap-6 lg:grid-cols-3">
      <div class="flex flex-col gap-6 lg:col-span-2">
        <VideoOverlay :frame="latestFrame" :status="status" />
        <StatsPanel />
      </div>
      <div class="relative lg:col-span-1">
        <div class="lg:absolute lg:inset-0">
          <EventsPanel :frames="recentFrames" />
        </div>
      </div>
    </div>
  </div>
</template>
