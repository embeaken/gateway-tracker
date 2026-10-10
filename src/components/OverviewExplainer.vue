<script setup lang="ts">
import { ref } from "vue";
import { tbms } from "../assets/data";
import { formatLongDate, parseDate } from "../dates";
import { useModal } from "../useModal";

// "What is this?": a slide-out drawer with the backstory and overview video.
const props = defineProps<{ open: boolean }>();
const emit = defineEmits<{ (e: "close"): void }>();

const VIDEO_URL = "https://www.youtube.com/embed/slP5zyoLpk4";
const firstLaunch = tbms[0]?.launched;

const closeBtn = ref<HTMLButtonElement | null>(null);
useModal(() => props.open, closeBtn, () => emit("close"));
</script>

<template>
  <Teleport to="body">
    <Transition name="drawer">
      <div v-if="open" class="drawer-root">
        <div class="scrim" @click="emit('close')"></div>
        <aside
          id="overview-explainer"
          class="drawer"
          role="dialog"
          aria-modal="true"
          aria-labelledby="explainer-title"
        >
          <div class="drawer-head">
            <h2 id="explainer-title">What is this?</h2>
            <button ref="closeBtn" type="button" class="close" aria-label="Close" @click="emit('close')">
              <svg viewBox="0 0 14 14" aria-hidden="true">
                <path d="M2 2l10 10M12 2L2 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
              </svg>
            </button>
          </div>

          <div class="drawer-body">
            <h3 class="lede">This website is tracking the construction of a new rail tunnel under the Hudson River.</h3>

            <div class="video-wrapper">
              <iframe
                :src="VIDEO_URL"
                title="Gateway Program overview video"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
              ></iframe>
            </div>

            <div class="copy">
              <p>
                The North River Tunnels, built in 1910, carry Amtrak and NJ Transit trains under the Hudson
                River, connecting New York and New Jersey. These tunnels have exceeded their useful lifespan
                after serving the region for over a century, and are now at risk of catastrophic failure.
              </p>
              <p>
                To keep safely serving the region by rail, NY and NJ are building two new tunnels under the
                Hudson River, then gut-renovating the old ones. This project is called the
                <strong>Gateway Program</strong> and it's the largest infrastructure project in America,
                expected to create 95,000 jobs and generate $19.6 billion in economic activity.
              </p>
              <p>
                Gateway is visible proof that America can still build massive, inspiring public works. These
                tunnels will serve hundreds of thousands of passengers every day for generations to come. Five
                construction sites are currently active<template v-if="firstLaunch">, and on
                {{ formatLongDate(parseDate(firstLaunch)) }} the first tunnel boring machine started drilling
                through the New Jersey Palisades</template>.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.drawer-root {
  position: fixed;
  inset: 0;
  z-index: 100;
}

.scrim {
  position: absolute;
  inset: 0;
  background: rgba(10, 20, 35, 0.45);
}

.drawer {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  width: min(560px, 100vw);
  background: var(--color-card-bg);
  border-left: 3px solid var(--color-accent);
  box-shadow: var(--shadow-lg);
}

.drawer-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid var(--color-border);
}

.drawer-head h2 {
  margin: 0;
  font-size: 28px;
  line-height: 1.1;
}

.close {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border: 1px solid var(--color-border);
  border-radius: 50%;
  background: transparent;
  color: var(--color-text-primary);
  cursor: pointer;
}

.close svg {
  width: 14px;
  height: 14px;
}

.close:hover {
  border-color: var(--color-text-secondary);
}

.close:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-lg);
}

.lede {
  margin: 0 0 var(--spacing-lg);
  color: var(--color-text-primary);
  font-size: 20px;
  font-weight: var(--font-weight-normal);
  line-height: 1.35;
}

.video-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border-radius: var(--radius-md);
  background: #000;
}

.video-wrapper iframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.copy {
  margin-top: var(--spacing-lg);
}

.copy p {
  margin: 0 0 var(--spacing-sm);
  color: var(--color-text-secondary);
  font-size: 16px;
  line-height: 1.65;
}

.copy strong {
  color: var(--color-text-primary);
  font-weight: var(--font-weight-bold);
}

/* Slide in from the right, scrim fades */
.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 220ms ease;
}

.drawer-enter-active .drawer,
.drawer-leave-active .drawer {
  transition: transform 260ms cubic-bezier(0.2, 0.8, 0.2, 1);
}

.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}

.drawer-enter-from .drawer,
.drawer-leave-to .drawer {
  transform: translateX(100%);
}

@media (prefers-reduced-motion: reduce) {
  .drawer-enter-active,
  .drawer-leave-active,
  .drawer-enter-active .drawer,
  .drawer-leave-active .drawer {
    transition: none;
  }
}

@media (max-width: 560px) {
  .drawer {
    border-left: 0;
  }

  .drawer-head,
  .drawer-body {
    padding-left: var(--spacing-md);
    padding-right: var(--spacing-md);
  }

  .drawer-head h2 {
    font-size: 24px;
  }
}
</style>
