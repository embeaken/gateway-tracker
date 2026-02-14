<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') emit('close')
}

watch(() => props.open, (isOpen) => {
  document.body.style.overflow = isOpen ? 'hidden' : ''
})

onMounted(() => document.addEventListener('keydown', onKeydown))
onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="modal-overlay" @click="emit('close')">
      <div class="modal-content" @click.stop>
        <button class="close-button" @click="emit('close')">×</button>

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
    </div>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--color-lightbox-overlay);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--spacing-lg);
  cursor: pointer;
}

.modal-content {
  position: relative;
  background: var(--color-card-bg);
  border-radius: var(--radius-md);
  padding: var(--spacing-xl);
  max-width: 640px;
  width: 100%;
  max-height: 85vh;
  overflow-y: auto;
  cursor: default;
}

.close-button {
  position: absolute;
  top: var(--spacing-sm);
  right: var(--spacing-sm);
  width: 36px;
  height: 36px;
  background: transparent;
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
  border-radius: 50%;
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background var(--transition-base), color var(--transition-base);
}

.close-button:hover {
  background: var(--color-background-alt);
  color: var(--color-text-primary);
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

@media (max-width: 768px) {
  .modal-overlay {
    padding: var(--spacing-md);
  }

  .modal-content {
    padding: var(--spacing-lg);
  }
}
</style>
