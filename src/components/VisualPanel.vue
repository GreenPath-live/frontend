<script setup lang="ts">
withDefaults(
  defineProps<{
    tone?: 'paper' | 'white' | 'clear';
    padded?: boolean;
  }>(),
  {
    tone: 'paper',
    padded: false,
  }
);
</script>

<template>
  <div :class="['visual-panel', `visual-panel--${tone}`, { 'visual-panel--padded': padded }]">
    <slot />
  </div>
</template>

<style scoped>
.visual-panel {
  width: 100%;
  min-height: 430px;
  position: relative;
  z-index: 1;
  overflow: hidden;
  border-radius: 38px;
  border: 1px solid var(--brand-line);
  box-shadow: var(--brand-shadow-panel);
}

.visual-panel--paper {
  background: rgba(252, 247, 235, 0.68);
}

.visual-panel--white {
  background: rgba(255, 255, 255, 0.58);
}

.visual-panel--clear {
  background: transparent;
  border-color: transparent;
  box-shadow: none;
}

.visual-panel--padded {
  padding: clamp(24px, 3.5vw, 44px);
}

@media (max-width: 980px) {
  .visual-panel {
    min-height: 350px;
  }
}

@media (max-width: 640px) {
  .visual-panel {
    min-height: 310px;
    border-radius: 28px;
  }
}
</style>
