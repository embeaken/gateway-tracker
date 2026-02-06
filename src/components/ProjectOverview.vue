<script setup lang="ts">
// Overview section explaining the Gateway Project to newcomers
</script>

<template>
  <section class="project-overview">
    <div class="container">
      <div class="overview-content">
        <h2 class="section-title">What's going on?</h2>
        <p class="overview-text">
          The only rail tunnel connecting New Jersey to Manhattan was built in <strong>1910</strong> and is failing after Superstorm Sandy flooded it with corrosive saltwater.
          If it shuts down, 200,000 daily commuters lose their route and the region that produces 20% of America's GDP grinds to a halt.
        </p>
        <p class="overview-text">
          The Gateway Program is the solution: <strong>two new tunnel tubes under the Hudson River</strong>, 9 miles of new track, and a full rehabilitation of the old tunnel.
          It's the largest infrastructure project in the country, with 20,000 workers actively building it right now.
        </p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.project-overview {
  padding: var(--spacing-xl) 0;
  background: var(--color-background-alt);
  border-bottom: 1px solid var(--color-border);
}

.overview-content {
  max-width: 900px;
}

.section-title {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-sm) 0;
}

.overview-text {
  font-size: var(--font-size-base);
  line-height: var(--line-height-relaxed);
  color: var(--color-text-secondary);
  margin: 0 0 var(--spacing-sm) 0;
}

.overview-text:last-child {
  margin-bottom: 0;
}

.overview-text strong {
  color: var(--color-text-primary);
  font-weight: var(--font-weight-bold);
}

@media (max-width: 768px) {
  .project-overview {
    padding: var(--spacing-lg) 0;
  }

  .section-title {
    font-size: var(--font-size-base);
  }

  .overview-text {
    font-size: var(--font-size-sm);
  }
}
</style>
