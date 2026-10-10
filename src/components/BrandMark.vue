<script setup lang="ts">
// The Palisades TBM cutterhead, face-on: centre plate, eight muck buckets near
// the rim, and two disc-cutter housings between each pair.
// Reference: gatewayprogram.org/wp-content/uploads/2025/12/S-1432-PEP-109.jpg
const BUCKETS = [0, 45, 90, 135, 180, 225, 270, 315]
const CUTTERS = BUCKETS.map((a) => a + 22.5)
</script>

<template>
  <svg class="brand-mark" viewBox="0 0 40 40" aria-hidden="true">
    <defs>
      <mask id="cutterhead-mask">
        <rect width="40" height="40" fill="white" />
        <g fill="black">
          <rect
            v-for="a in BUCKETS"
            :key="`b${a}`"
            x="18.7"
            y="4"
            width="2.6"
            height="4.6"
            rx="1.3"
            :transform="`rotate(${a} 20 20)`"
          />
          <template v-for="a in CUTTERS" :key="`c${a}`">
            <rect x="18.55" y="7.3" width="2.9" height="2.0" rx="0.7" :transform="`rotate(${a} 20 20)`" />
            <rect x="18.3" y="4.2" width="3.4" height="2.0" rx="0.7" :transform="`rotate(${a} 20 20)`" />
          </template>
        </g>
        <circle cx="20" cy="20" r="7" fill="none" stroke="black" stroke-width="1.3" />
      </mask>
    </defs>
    <circle cx="20" cy="20" r="19" fill="currentColor" mask="url(#cutterhead-mask)" />
  </svg>
</template>

<style scoped>
.brand-mark {
  display: block;
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  animation: cutterhead-spin 48s linear infinite;
}

@keyframes cutterhead-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .brand-mark {
    animation: none;
  }
}
</style>
