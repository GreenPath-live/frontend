<script setup lang="ts">
withDefaults(
  defineProps<{
    word?: string;
    placement?: 'main' | 'side';
  }>(),
  {
    word: 'SHADEO',
    placement: 'main',
  }
);
</script>

<template>
  <span :class="['brand-watermark', `brand-watermark--${placement}`]" aria-hidden="true">
    {{ word }}
  </span>
</template>

<style scoped>
.brand-watermark {
  position: absolute;
  z-index: 0;
  font-family: var(--font-body);
  font-weight: 950;
  line-height: 0.78;
  letter-spacing: -0.06em;
  pointer-events: none;
  user-select: none;
  white-space: nowrap;
}

.brand-watermark--main {
  top: clamp(24px, 5vw, 70px);
  left: max(24px, calc((100vw - 1280px) / 2));
  color: var(--brand-watermark);
  font-size: clamp(7rem, 20vw, 21rem);
}

.brand-watermark--side {
  right: clamp(18px, 4vw, 52px);
  bottom: clamp(24px, 5vw, 68px);
  writing-mode: vertical-rl;
  color: var(--brand-watermark-side);
  font-size: clamp(4rem, 9vw, 9rem);
  letter-spacing: -0.04em;
}

@media (max-width: 640px) {
  .brand-watermark--side {
    display: none;
  }
}
</style>
