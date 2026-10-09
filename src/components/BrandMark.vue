<script setup lang="ts">
// The Palisades TBM cutterhead (Herrenknecht S-1432), face-on, simplified for
// small sizes: the large centre plate, eight muck buckets just inside the rim,
// and two disc-cutter housings between each pair. Inherits colour from `currentColor`.
// Reference: gatewayprogram.org/wp-content/uploads/2025/12/S-1432-PEP-109.jpg
</script>

<template>
  <svg class="brand-mark" viewBox="0 0 40 40" aria-hidden="true">
    <defs>
      <mask id="cutterhead-mask">
        <rect width="40" height="40" fill="white" />
        <g fill="black">
          <rect x="18.7" y="4" width="2.6" height="4.6" rx="1.3" transform="rotate(0 20 20)" />
          <rect x="18.7" y="4" width="2.6" height="4.6" rx="1.3" transform="rotate(45 20 20)" />
          <rect x="18.7" y="4" width="2.6" height="4.6" rx="1.3" transform="rotate(90 20 20)" />
          <rect x="18.7" y="4" width="2.6" height="4.6" rx="1.3" transform="rotate(135 20 20)" />
          <rect x="18.7" y="4" width="2.6" height="4.6" rx="1.3" transform="rotate(180 20 20)" />
          <rect x="18.7" y="4" width="2.6" height="4.6" rx="1.3" transform="rotate(225 20 20)" />
          <rect x="18.7" y="4" width="2.6" height="4.6" rx="1.3" transform="rotate(270 20 20)" />
          <rect x="18.7" y="4" width="2.6" height="4.6" rx="1.3" transform="rotate(315 20 20)" />
          <rect x="18.55" y="7.3" width="2.9" height="2.0" rx="0.7" transform="rotate(22.5 20 20)" />
          <rect x="18.55" y="7.3" width="2.9" height="2.0" rx="0.7" transform="rotate(67.5 20 20)" />
          <rect x="18.55" y="7.3" width="2.9" height="2.0" rx="0.7" transform="rotate(112.5 20 20)" />
          <rect x="18.55" y="7.3" width="2.9" height="2.0" rx="0.7" transform="rotate(157.5 20 20)" />
          <rect x="18.55" y="7.3" width="2.9" height="2.0" rx="0.7" transform="rotate(202.5 20 20)" />
          <rect x="18.55" y="7.3" width="2.9" height="2.0" rx="0.7" transform="rotate(247.5 20 20)" />
          <rect x="18.55" y="7.3" width="2.9" height="2.0" rx="0.7" transform="rotate(292.5 20 20)" />
          <rect x="18.55" y="7.3" width="2.9" height="2.0" rx="0.7" transform="rotate(337.5 20 20)" />
          <rect x="18.3" y="4.2" width="3.4" height="2.0" rx="0.7" transform="rotate(22.5 20 20)" />
          <rect x="18.3" y="4.2" width="3.4" height="2.0" rx="0.7" transform="rotate(67.5 20 20)" />
          <rect x="18.3" y="4.2" width="3.4" height="2.0" rx="0.7" transform="rotate(112.5 20 20)" />
          <rect x="18.3" y="4.2" width="3.4" height="2.0" rx="0.7" transform="rotate(157.5 20 20)" />
          <rect x="18.3" y="4.2" width="3.4" height="2.0" rx="0.7" transform="rotate(202.5 20 20)" />
          <rect x="18.3" y="4.2" width="3.4" height="2.0" rx="0.7" transform="rotate(247.5 20 20)" />
          <rect x="18.3" y="4.2" width="3.4" height="2.0" rx="0.7" transform="rotate(292.5 20 20)" />
          <rect x="18.3" y="4.2" width="3.4" height="2.0" rx="0.7" transform="rotate(337.5 20 20)" />
        </g>
        <!-- Gap that sets off the centre plate -->
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
  /* Always turning, like the real thing — slow enough to be ambient. */
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
