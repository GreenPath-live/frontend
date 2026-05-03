<script setup lang="ts">
withDefaults(
  defineProps<{ tone?: 'sage' | 'sun' | 'sky' | 'peach' | 'ink' }>(),
  { tone: 'sage' }
);
</script>

<template>
  <span :class="['pill', `pill--${tone}`]"><slot /></span>
</template>

<style scoped>
.pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px 6px 12px;
  border-radius: var(--r-pill);
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  background: var(--shade-mist);
  color: var(--shade-deep);
  border: 1px solid rgba(91, 140, 97, 0.22);
}
.pill::before {
  content: "";
  width: 6px; height: 6px;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.7;
}
.pill--sun   { background: var(--sun-soft);   color: #8a5a14; border-color: rgba(232,165,58,0.35); }
.pill--sky   { background: var(--sky-soft);   color: #2f5d72; border-color: rgba(91,140,170,0.30); }
.pill--peach { background: var(--peach-soft); color: #8b3f25; border-color: rgba(192,90,55,0.30); }
.pill--ink   { background: rgba(31,42,30,0.08); color: var(--ink); border-color: rgba(31,42,30,0.12); }
</style>
