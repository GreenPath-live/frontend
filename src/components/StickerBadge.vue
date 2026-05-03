<script setup lang="ts">
withDefaults(
  defineProps<{
    tone?: 'sage' | 'sun' | 'sky' | 'peach' | 'cream';
    label?: string;
    value?: string;
  }>(),
  { tone: 'cream' }
);
</script>

<template>
  <div :class="['sticker', `sticker--${tone}`]">
    <span class="sticker__icon"><slot name="icon" /></span>
    <span class="sticker__text">
      <span class="sticker__value" v-if="value">{{ value }}</span>
      <span class="sticker__label">{{ label }}<slot /></span>
    </span>
  </div>
</template>

<style scoped>
.sticker {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 10px 18px 10px 12px;
  border-radius: var(--r-pill);
  background: var(--surface);
  border: 1.5px solid rgba(31, 42, 30, 0.06);
  box-shadow: var(--sh-clay), var(--sh-inset-sun);
  font-weight: 500;
}
.sticker__icon {
  width: 36px; height: 36px;
  border-radius: 50%;
  background: var(--shade-mist);
  display: grid; place-items: center;
  font-size: 18px;
}
.sticker__text { display: inline-flex; flex-direction: column; line-height: 1.15; }
.sticker__value {
  font-family: var(--font-display);
  font-size: 1.15rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--ink);
}
.sticker__label {
  font-size: 0.78rem;
  color: var(--ink-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.sticker--sage  .sticker__icon { background: var(--shade-soft); }
.sticker--sun   .sticker__icon { background: var(--sun-soft); }
.sticker--sky   .sticker__icon { background: var(--sky); }
.sticker--peach .sticker__icon { background: var(--peach-soft); }
.sticker--cream .sticker__icon { background: var(--canvas-deep); }
</style>
