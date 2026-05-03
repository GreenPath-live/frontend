<script setup lang="ts">
defineProps<{
  as?: string;
}>();
</script>

<template>
  <component :is="as || 'span'" class="section-kicker">
    <slot />
  </component>
</template>

<style scoped>
.section-kicker {
  color: #1d371f;
  font-size: clamp(1rem, 1.05vw, 1.125rem);
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
</style>
