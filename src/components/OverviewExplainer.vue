<script setup lang="ts">
const VIDEO_URL = "https://www.youtube.com/embed/slP5zyoLpk4";
</script>

<template>
  <section id="overview-explainer" class="overview-explainer">
    <div class="container overview-explainer-grid">
      <div class="video-panel">
        <div class="video-wrapper">
          <iframe
            :src="VIDEO_URL"
            title="Gateway Program overview video"
            frameborder="0"
            allow="
              accelerometer;
              autoplay;
              clipboard-write;
              encrypted-media;
              gyroscope;
              picture-in-picture;
            "
            allowfullscreen
            loading="lazy"
          ></iframe>
        </div>
      </div>

      <div class="overview-copy">
        <h3>What's going on?</h3>
        <p>
          The North River Tunnels, built in <strong>1910</strong>, carry Amtrak and NJ Transit
          trains under the Hudson River, connecting New York and New Jersey. These tunnels have
          exceeded their useful lifespan after serving the region for over a century, and are
          <strong>at risk of catastrophic failure</strong>.
        </p>
        <p>
          To keep safely serving the region by rail,
          <strong>we're building two new tunnels under the Hudson River</strong>, then
          gut-renovating the old ones. It's called the <strong>Gateway Program</strong> and it's the
          largest infrastructure project in America, expected to create
          <strong>95,000 jobs</strong> and generate
          <strong>$19.6 billion in economic activity</strong>.
        </p>
        <p>
          Gateway is visible proof that America can still build massive, inspiring public works.
          These tunnels will serve <strong>hundreds of thousands of passengers</strong> every day
          for generations to come. Five construction sites are currently active. The first tunnel
          boring machines are about to start drilling through the New Jersey Palisades.
          <strong>This is happening.</strong>
        </p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.overview-explainer {
  padding: var(--spacing-lg) 0 var(--spacing-xl);
  background:
    linear-gradient(180deg, rgba(0, 94, 113, 0.03), rgba(0, 94, 113, 0)), var(--color-background);
  scroll-margin-top: var(--spacing-lg);
}

.overview-explainer-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(360px, 0.95fr);
  gap: clamp(var(--spacing-md), 3vw, var(--spacing-xl));
  align-items: start;
}

.overview-copy {
  min-width: 0;
}

.kicker {
  margin: 0 0 6px;
  color: var(--color-primary);
  font-size: 11px;
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.08em;
  line-height: 1;
  text-transform: uppercase;
}

.overview-copy h3 {
  margin: 0 0 var(--spacing-sm);
  font-size: 28px;
  line-height: 1.05;
}

.overview-copy p {
  margin: 0 0 var(--spacing-sm);
  color: var(--color-text-secondary);
  font-size: 16px;
  line-height: 1.65;
}

.overview-copy strong {
  color: var(--color-text-primary);
  font-weight: var(--font-weight-bold);
}

.video-panel {
  min-width: 0;
}

.video-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: #000;
  box-shadow: var(--shadow-lg);
}

.video-wrapper iframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

@media (max-width: 900px) {
  .overview-explainer {
    padding: var(--spacing-md) 0 var(--spacing-lg);
  }

  .overview-explainer-grid {
    grid-template-columns: 1fr;
  }

  .overview-copy h3 {
    font-size: 24px;
  }
}
</style>
