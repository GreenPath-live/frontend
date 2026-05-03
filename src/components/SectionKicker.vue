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
  font-size: clamp(0.9rem, 1.1vw, 1rem);
  font-weight: 900;
  letter-spacing: 0.09em;
  text-transform: uppercase;
}
</style>
