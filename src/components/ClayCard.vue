<script setup lang="ts">
withDefaults(
  defineProps<{
    tone?: 'cream' | 'sage' | 'sky' | 'sun' | 'peach' | 'white';
    radius?: 'lg' | 'xl' | '2xl';
    padded?: boolean;
    interactive?: boolean;
  }>(),
  { tone: 'white', radius: 'xl', padded: true, interactive: false }
);
</script>

<template>
  <div
    :class="[
      'clay',
      `clay--${tone}`,
      `clay--r-${radius}`,
      { 'clay--padded': padded, 'clay--interactive': interactive }
    ]"
  >
    <slot />
  </div>
</template>

<style scoped>
.clay {
  position: relative;
  border-radius: var(--r-xl);
  background: var(--surface);
  box-shadow: var(--sh-clay), var(--sh-inset-sun);
  border: 1px solid rgba(31, 42, 30, 0.05);
  isolation: isolate;
  overflow: hidden;
}
.clay::before {
  /* faint inner gloss */
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(120% 60% at 50% 0%, rgba(255,255,255,0.55), transparent 60%);
  pointer-events: none;
  z-index: 0;
}
.clay > :deep(*) { position: relative; z-index: 1; }

.clay--padded { padding: clamp(20px, 3vw, 36px); }
.clay--r-lg  { border-radius: var(--r-lg); }
.clay--r-xl  { border-radius: var(--r-xl); }
.clay--r-2xl { border-radius: var(--r-2xl); }

.clay--cream { background: var(--canvas-warm); }
.clay--sage  { background: var(--shade-mist); border-color: rgba(91, 140, 97, 0.18); }
.clay--sky   { background: var(--sky-soft);   border-color: rgba(120, 164, 184, 0.22); }
.clay--sun   { background: var(--sun-soft);   border-color: rgba(232, 165, 58, 0.28); }
.clay--peach { background: var(--peach-soft); border-color: rgba(244, 183, 158, 0.35); }
.clay--white { background: var(--surface); }

.clay--interactive { cursor: pointer; transition: transform var(--d-base) var(--ease-out-expo), box-shadow var(--d-base) var(--ease-out-expo); }
.clay--interactive:hover { transform: translateY(-4px); box-shadow: var(--sh-clay-lg), var(--sh-inset-sun); }
</style>
