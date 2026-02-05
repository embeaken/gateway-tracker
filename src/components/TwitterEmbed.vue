<script setup lang="ts">
import { onMounted } from 'vue'

onMounted(() => {
  // Load Twitter widget script
  const script = document.createElement('script')
  script.src = 'https://platform.twitter.com/widgets.js'
  script.async = true
  script.charset = 'utf-8'
  document.body.appendChild(script)
})
</script>

<template>
  <div class="twitter-embed">
    <h3 class="twitter-title">Latest Updates</h3>
    <a
      class="twitter-timeline"
      data-height="800"
      data-theme="light"
      data-chrome="noheader nofooter noborders"
      href="https://twitter.com/GatewayProgNews?ref_src=twsrc%5Etfw"
    >
      Tweets by @GatewayProgNews
    </a>
  </div>
</template>

<style scoped>
.twitter-embed {
  width: 100%;
}

.twitter-title {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-md) 0;
}

.twitter-timeline {
  display: block;
}

@media (max-width: 1023px) {
  .twitter-embed {
    margin-top: var(--spacing-md);
  }
}

@media (max-width: 768px) {
  .twitter-title {
    font-size: var(--font-size-base);
  }
}
</style>
