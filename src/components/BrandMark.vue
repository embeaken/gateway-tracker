<script setup lang="ts">
// A tunnel boring machine cutterhead, face-on: a solid steel face with muck
// openings (slots) and disc cutters (dots). Inherits colour from `currentColor`.
</script>

<template>
  <svg class="brand-mark" viewBox="0 0 40 40" aria-hidden="true">
    <defs>
      <mask id="cutterhead-mask">
        <rect width="40" height="40" fill="white" />
        <g fill="black">
          <rect x="18.4" y="5.2" width="3.2" height="9" rx="1.6" transform="rotate(45 20 20)" />
          <rect x="18.4" y="5.2" width="3.2" height="9" rx="1.6" transform="rotate(135 20 20)" />
          <rect x="18.4" y="5.2" width="3.2" height="9" rx="1.6" transform="rotate(225 20 20)" />
          <rect x="18.4" y="5.2" width="3.2" height="9" rx="1.6" transform="rotate(315 20 20)" />
          <circle cx="20.00" cy="11.40" r="1.5" />
          <circle cx="20.00" cy="5.80" r="1.5" />
          <circle cx="28.60" cy="20.00" r="1.5" />
          <circle cx="34.20" cy="20.00" r="1.5" />
          <circle cx="20.00" cy="28.60" r="1.5" />
          <circle cx="20.00" cy="34.20" r="1.5" />
          <circle cx="11.40" cy="20.00" r="1.5" />
          <circle cx="5.80" cy="20.00" r="1.5" />
          <circle cx="20" cy="20" r="2.4" />
        </g>
        <circle cx="20" cy="20" r="17" fill="none" stroke="black" stroke-width="1" />
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
