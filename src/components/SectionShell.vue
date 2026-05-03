<script setup lang="ts">
withDefaults(
  defineProps<{
    id: string;
    eyebrow?: string;
    align?: 'left' | 'right';     /* which side text sits on */
    tone?: 'canvas' | 'cream' | 'sage' | 'sky' | 'sun';
    snap?: boolean;
  }>(),
  { align: 'left', tone: 'canvas', snap: true }
);
</script>

<template>
  <section
    :id="id"
    :class="[
      'shell',
      `shell--${tone}`,
      `shell--${align}`,
      { 'shell--snap': snap }
    ]"
  >
    <div class="shell__bg" aria-hidden="true">
      <slot name="bg" />
    </div>

    <div class="shell__inner container">
      <div class="shell__copy">
        <span v-if="eyebrow" class="shell__eyebrow"><slot name="eyebrow">{{ eyebrow }}</slot></span>
        <slot name="copy" />
      </div>

      <div class="shell__media">
        <slot name="media" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.shell {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  padding: calc(var(--nav-h) + var(--s-7)) 0 var(--s-7);
  overflow: hidden;
}
.shell--snap { scroll-snap-align: start; scroll-snap-stop: always; }
.shell--cream  { background: var(--canvas-warm); }
.shell--sage   { background: var(--shade-mist); }
.shell--sky    { background: var(--sky-soft); }
.shell--sun    { background: var(--sun-soft); }

.shell__bg {
  position: absolute; inset: 0; z-index: 0;
  pointer-events: none;
}
.shell__inner {
  position: relative; z-index: 1;
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr);
  gap: clamp(40px, 6vw, 96px);
  align-items: center;
  width: 100%;
}
.shell--right .shell__inner {
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.05fr);
}
.shell--right .shell__copy { order: 2; }
.shell--right .shell__media { order: 1; }

.shell__copy {
  display: flex;
  flex-direction: column;
  gap: var(--s-5);
  max-width: 560px;
}
.shell__eyebrow {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: var(--r-pill);
  background: var(--surface);
  border: 1px solid rgba(31, 42, 30, 0.08);
  box-shadow: var(--sh-clay-sm);
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--ink-soft);
}
.shell__eyebrow::before {
  content: "";
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--shade);
}

.shell__media { position: relative; }

@media (max-width: 900px) {
  .shell { min-height: auto; padding: calc(var(--nav-h) + var(--s-6)) 0 var(--s-7); }
  .shell--snap { scroll-snap-align: none; }
  .shell__inner,
  .shell--right .shell__inner {
    grid-template-columns: 1fr;
    gap: var(--s-6);
  }
  .shell--right .shell__copy { order: 1; }
  .shell--right .shell__media { order: 2; }
}
</style>
