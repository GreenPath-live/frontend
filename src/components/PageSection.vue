<script setup lang="ts">
import BrandWatermark from './BrandWatermark.vue';

withDefaults(
  defineProps<{
    id: string;
    sideLabel?: string;
    tone?: 'warm' | 'lime' | 'plain';
    align?: 'left' | 'right';
    watermark?: boolean;
    sideWatermark?: boolean;
  }>(),
  {
    tone: 'warm',
    align: 'left',
    watermark: true,
    sideWatermark: true,
  }
);
</script>

<template>
  <section :id="id" :class="['page-section', `page-section--${tone}`, `page-section--${align}`]">
    <BrandWatermark v-if="watermark" />
    <BrandWatermark v-if="sideWatermark" placement="side" />
    <span v-if="sideLabel" class="page-section__side-label">{{ sideLabel }}</span>

    <div class="page-section__copy" data-rise>
      <slot name="copy" />
    </div>

    <div class="page-section__visual" data-rise style="--rise-delay: 90ms">
      <slot name="visual" />
    </div>
  </section>
</template>

<style scoped>
.page-section {
  min-height: 100vh;
  scroll-snap-align: start;
  position: relative;
  overflow: hidden;
  isolation: isolate;
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(360px, 1fr);
  align-items: center;
  gap: clamp(44px, 6vw, 92px);
  padding: calc(var(--nav-h) + 54px) max(var(--gutter), calc((100vw - 1180px) / 2)) 58px;
}

.page-section--warm {
  background:
    radial-gradient(circle at 78% 24%, rgba(155, 224, 111, 0.1), transparent 32%),
    linear-gradient(180deg, var(--brand-paper-white) 0%, #f7f2e8 100%);
}

.page-section--lime {
  background:
    radial-gradient(circle at 76% 42%, rgba(155, 224, 111, 0.24), transparent 0 26%, transparent 48%),
    linear-gradient(180deg, var(--brand-paper-white) 0%, rgba(228, 248, 213, 0.46) 100%);
}

.page-section--plain {
  background: linear-gradient(180deg, var(--brand-paper-white) 0%, var(--brand-paper) 100%);
}

.page-section--right .page-section__copy {
  order: 2;
}

.page-section--right .page-section__visual {
  order: 1;
}

.page-section__side-label {
  position: absolute;
  left: 16px;
  top: 50%;
  z-index: 2;
  transform: translateY(-50%) rotate(-90deg);
  transform-origin: left center;
  color: rgba(35, 45, 39, 0.36);
  font-size: 0.82rem;
  font-weight: 900;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.page-section__copy {
  max-width: 560px;
  display: flex;
  flex-direction: column;
  gap: 22px;
  z-index: 2;
}

.page-section__visual {
  position: relative;
  z-index: 1;
}

.page-section :slotted(h2) {
  max-width: 12.5ch;
  color: var(--brand-ink);
  font-family: var(--font-body);
  font-size: clamp(2.8rem, 4.2vw, 5rem);
  font-weight: 950;
  line-height: 1.02;
  letter-spacing: 0;
}

.page-section :slotted(p) {
  max-width: 47ch;
  color: var(--brand-ink-muted);
  font-size: clamp(1.08rem, 1.35vw, 1.34rem);
  font-weight: 650;
  line-height: 1.5;
}

.page-section :slotted(.section-actions) {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  padding-top: 10px;
}

@media (max-width: 980px) {
  .page-section {
    min-height: auto;
    grid-template-columns: 1fr;
    gap: 34px;
    padding-top: calc(var(--nav-h) + 44px);
  }

  .page-section--right .page-section__copy,
  .page-section--right .page-section__visual {
    order: initial;
  }

  .page-section :slotted(h2) {
    max-width: 13ch;
  }
}

@media (max-width: 640px) {
  .page-section {
    padding-inline: var(--gutter);
    padding-bottom: 42px;
  }

  .page-section__side-label {
    display: none;
  }

  .page-section :slotted(.section-actions) {
    flex-direction: column;
  }

  .page-section :slotted(.section-actions .btn) {
    width: 100%;
  }
}
</style>
