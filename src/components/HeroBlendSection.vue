<script setup lang="ts">
import BrandWatermark from './BrandWatermark.vue';

withDefaults(
  defineProps<{
    id?: string;
    imageSrc: string;
    imageAlt?: string;
    sideLabel?: string;
  }>(),
  {
    id: 'hero',
    imageAlt: '',
    sideLabel: '',
  }
);
</script>

<template>
  <section :id="id" class="hero-blend">
    <BrandWatermark />
    <span v-if="sideLabel" class="hero-blend__side-label">{{ sideLabel }}</span>

    <div class="hero-blend__art" aria-hidden="true">
      <img :src="imageSrc" :alt="imageAlt" />
    </div>

    <div class="hero-blend__copy" data-rise>
      <slot />
    </div>
  </section>
</template>

<style scoped>
.hero-blend {
  min-height: 100vh;
  scroll-snap-align: start;
  position: relative;
  overflow: hidden;
  isolation: isolate;
  display: grid;
  align-items: center;
  padding: calc(var(--nav-h) + 56px) max(var(--gutter), calc((100vw - 1280px) / 2)) 58px;
  background:
    radial-gradient(circle at 78% 38%, var(--brand-glow-lime), transparent 0 28%, transparent 48%),
    var(--brand-paper-white);
}

.hero-blend__side-label {
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

.hero-blend__art {
  position: absolute;
  inset:
    calc(var(--nav-h) + 34px)
    max(18px, calc((100vw - 1280px) / 2))
    28px
    max(18px, calc((100vw - 1280px) / 2));
  z-index: 1;
  border-radius: 58px;
  overflow: hidden;
  opacity: 1;
}

.hero-blend__art::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 1;
  background:
    linear-gradient(90deg, rgba(251, 250, 247, 0.98) 0%, rgba(251, 250, 247, 0.92) 26%, rgba(251, 250, 247, 0.56) 46%, rgba(251, 250, 247, 0.12) 66%, transparent 82%),
    linear-gradient(0deg, rgba(251, 250, 247, 0.82) 0%, rgba(251, 250, 247, 0.18) 22%, transparent 44%);
  pointer-events: none;
}

.hero-blend__art img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: right center;
}

.hero-blend__copy {
  position: relative;
  z-index: 2;
  width: min(45vw, 610px);
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.hero-blend :slotted(h1) {
  max-width: 10.5ch;
  color: var(--brand-ink);
  font-family: var(--font-body);
  font-size: clamp(3.9rem, 6.2vw, 7.1rem);
  font-weight: 950;
  line-height: 0.98;
  letter-spacing: 0;
}

.hero-blend :slotted(p) {
  max-width: 38ch;
  color: var(--brand-ink-muted);
  font-size: clamp(1.08rem, 1.35vw, 1.34rem);
  font-weight: 650;
  line-height: 1.5;
}

@media (max-width: 980px) {
  .hero-blend {
    min-height: auto;
    padding-top: calc(var(--nav-h) + 44px);
    padding-bottom: 430px;
  }

  .hero-blend__copy {
    width: min(100%, 680px);
  }

  .hero-blend__art {
    inset: auto var(--gutter) 28px var(--gutter);
    height: 410px;
    border-radius: 42px;
  }

  .hero-blend :slotted(h1) {
    max-width: 9.5ch;
    font-size: clamp(3.2rem, 13vw, 5.8rem);
  }
}

@media (max-width: 640px) {
  .hero-blend {
    padding-inline: var(--gutter);
    padding-bottom: 340px;
  }

  .hero-blend__art {
    height: 320px;
    border-radius: 30px;
  }

  .hero-blend__side-label {
    display: none;
  }
}
</style>
