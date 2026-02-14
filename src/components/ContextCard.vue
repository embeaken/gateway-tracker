<script setup lang="ts">
// "What's going on?" context for sidebar
</script>

<template>
  <div class="context-card">
    <h3 class="context-title">What's going on?</h3>

    <div class="context-body">
      <div class="context-section">
        <p>
          The North River Tunnels, built in <strong>1910</strong>, carry Amtrak and NJ Transit trains under the Hudson River, connecting New York and New Jersey.
          These tunnels have exceeded their useful lifespan after serving the region for over a century, and are <strong>at risk of catastrophic failure</strong>.
        </p>
      </div>

      <div class="context-section">
        <p>
          To keep safely serving the region by rail, <strong>we're building two new tunnels under the Hudson River</strong>, then gut-renovating the old ones.
          It's called the <strong>Gateway Program</strong> and it's the largest infrastructure project in America, expected to create <strong>95,000 jobs</strong> and generate <strong>$19.6 billion</strong> in economic activity.
        </p>
      </div>

      <div class="context-section">
        <p>
          Gateway is visible proof that America can still build massive, inspiring public works.
          These tunnels will serve <strong>hundreds of thousands of passengers</strong> every day for generations to come.
          Five construction sites are currently active. The first tunnel boring machines are about to start drilling through the New Jersey Palisades.
          <strong>This is happening.</strong>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.context-card {
  background: var(--color-card-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
}

.context-title {
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-md) 0;
  padding-bottom: var(--spacing-sm);
  border-bottom: 2px solid var(--color-primary);
}

.context-body {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.context-section p {
  line-height: var(--line-height-relaxed);
  margin: 0;
}

.context-section strong {
  color: var(--color-text-primary);
  font-weight: var(--font-weight-bold);
}

.learn-more {
  display: inline-block;
  margin-top: var(--spacing-md);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-border);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-primary);
  text-decoration: none;
}

.learn-more:hover {
  text-decoration: underline;
}
</style>
