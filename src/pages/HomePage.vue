<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import AppNav from '../components/AppNav.vue';
import AppButton from '../components/AppButton.vue';
import HeroBlendSection from '../components/HeroBlendSection.vue';
import PageSection from '../components/PageSection.vue';
import SectionKicker from '../components/SectionKicker.vue';
import VisualPanel from '../components/VisualPanel.vue';

const root = ref<HTMLElement | null>(null);
let cleanupSectionScroller: (() => void) | undefined;

const sectionIds = ['hero', 'intro', 'navigation', 'awareness', 'self-check'];

const easeInOutCubic = (t: number) => (
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
);

const getNearestSectionIndex = () => {
  const viewportMiddle = window.scrollY + window.innerHeight / 2;
  let nearest = 0;
  let nearestDistance = Number.POSITIVE_INFINITY;

  sectionIds.forEach((id, index) => {
    const el = document.getElementById(id);
    if (!el) return;

    const sectionMiddle = el.offsetTop + el.offsetHeight / 2;
    const distance = Math.abs(sectionMiddle - viewportMiddle);
    if (distance < nearestDistance) {
      nearest = index;
      nearestDistance = distance;
    }
  });

  return nearest;
};

const setupSectionScroller = () => {
  const canUseControlledScroll = window.matchMedia('(min-width: 900px) and (pointer: fine)').matches
    && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!canUseControlledScroll) return undefined;

  let currentIndex = getNearestSectionIndex();
  let isAnimating = false;
  let animationFrame = 0;
  let wheelRemainder = 0;

  const animateTo = (targetIndex: number) => {
    const target = document.getElementById(sectionIds[targetIndex]);
    if (!target || targetIndex === currentIndex) return;

    window.cancelAnimationFrame(animationFrame);
    isAnimating = true;
    currentIndex = targetIndex;

    const start = window.scrollY;
    const end = target.offsetTop;
    const distance = end - start;
    const duration = Math.min(920, Math.max(620, Math.abs(distance) * 0.42));
    const startedAt = performance.now();

    const frame = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      window.scrollTo(0, start + distance * easeInOutCubic(progress));

      if (progress < 1) {
        animationFrame = window.requestAnimationFrame(frame);
      } else {
        isAnimating = false;
        wheelRemainder = 0;
      }
    };

    animationFrame = window.requestAnimationFrame(frame);
  };

  const onWheel = (event: WheelEvent) => {
    const target = event.target as HTMLElement | null;
    if (target?.closest('input, textarea, select, button, a, [data-native-scroll]')) return;

    event.preventDefault();
    if (isAnimating) return;

    wheelRemainder += event.deltaY;
    if (Math.abs(wheelRemainder) < 42) return;

    currentIndex = getNearestSectionIndex();
    const direction = wheelRemainder > 0 ? 1 : -1;
    const nextIndex = Math.max(0, Math.min(sectionIds.length - 1, currentIndex + direction));
    wheelRemainder = 0;
    animateTo(nextIndex);
  };

  const onKeydown = (event: KeyboardEvent) => {
    const keys = ['PageDown', 'PageUp', 'ArrowDown', 'ArrowUp', 'Home', 'End'];
    if (!keys.includes(event.key) || isAnimating) return;

    currentIndex = getNearestSectionIndex();
    let nextIndex = currentIndex;

    if (event.key === 'PageDown' || event.key === 'ArrowDown') nextIndex += 1;
    if (event.key === 'PageUp' || event.key === 'ArrowUp') nextIndex -= 1;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = sectionIds.length - 1;

    nextIndex = Math.max(0, Math.min(sectionIds.length - 1, nextIndex));
    if (nextIndex === currentIndex) return;

    event.preventDefault();
    animateTo(nextIndex);
  };

  window.addEventListener('wheel', onWheel, { passive: false });
  window.addEventListener('keydown', onKeydown);

  return () => {
    window.cancelAnimationFrame(animationFrame);
    window.removeEventListener('wheel', onWheel);
    window.removeEventListener('keydown', onKeydown);
  };
};

onMounted(() => {
  const els = root.value?.querySelectorAll('[data-rise]') ?? [];
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.16 });

  els.forEach((el) => io.observe(el));
  cleanupSectionScroller = setupSectionScroller();
});

onBeforeUnmount(() => {
  cleanupSectionScroller?.();
});
</script>

<template>
  <div ref="root" class="home">
    <AppNav />

    <main>
      <HeroBlendSection
        id="hero"
        side-label="Section 01 - Home"
        image-src="/herosection.png"
      >
        <SectionKicker>For cooler days and stronger connections</SectionKicker>
        <h1>Helping seniors stay cool outdoors.</h1>
        <p>
          Shadeo helps older adults and carers understand heat risk, find cooler places,
          and make safer walking decisions before the day gets too hot.
        </p>
      </HeroBlendSection>

      <PageSection id="intro" tone="warm" side-label="Section 02 - Why">
        <template #copy>
          <SectionKicker>Why we built this</SectionKicker>
          <h2>Heat advice should feel clear before it feels urgent.</h2>
          <p>
            Shadeo turns heat safety into a calm sequence of decisions: check today's risk,
            understand what makes a place harder on the body, and choose support nearby.
          </p>
          <div class="section-actions">
            <AppButton href="#navigation">See the Website Flow</AppButton>
          </div>
        </template>

        <template #visual>
          <VisualPanel padded>
            <div class="number-card">
              <span>01</span>
              <strong>Know the heat risk</strong>
              <small>Plain-language guidance before going outside.</small>
            </div>
            <div class="number-card">
              <span>02</span>
              <strong>Find cooler options</strong>
              <small>Shade, water, seats, and support in one journey.</small>
            </div>
            <div class="number-card">
              <span>03</span>
              <strong>Act earlier</strong>
              <small>Simple next steps for safer movement in hot weather.</small>
            </div>
          </VisualPanel>
        </template>
      </PageSection>

      <PageSection id="navigation" tone="lime" side-label="Section 03 - Journey">
        <template #copy>
          <SectionKicker>The journey</SectionKicker>
          <h2>Each section points to one useful screen.</h2>
          <p>
            The homepage works like a guided path: learn why heat matters, explore cooler
            places, view awareness data, then complete the heat vulnerability self-check.
          </p>
          <div class="section-actions">
            <AppButton href="#awareness">View Awareness</AppButton>
          </div>
        </template>

        <template #visual>
          <VisualPanel tone="paper" class="video-visual">
            <video src="/final.mp4" autoplay muted loop playsinline preload="metadata" />
          </VisualPanel>
        </template>
      </PageSection>

      <PageSection id="awareness" tone="warm" side-label="Section 04 - Awareness">
        <template #copy>
          <SectionKicker>Raising awareness</SectionKicker>
          <h2>Make heat exposure visible street by street.</h2>
          <p>
            Shadeo shows how shade, rest stops, water access, and time outside can change
            the comfort of a walk. The aim is awareness that leads directly to action.
          </p>
          <div class="section-actions">
            <AppButton href="#self-check">Start Self-Check</AppButton>
          </div>
        </template>

        <template #visual>
          <VisualPanel class="awareness-visual">
            <div class="route-line" aria-hidden="true">
              <span class="stop stop--one" />
              <span class="stop stop--two" />
              <span class="stop stop--three" />
            </div>
            <div class="awareness-panel">
              <div>
                <strong>38C</strong>
                <span>street surface</span>
              </div>
              <div>
                <strong>22%</strong>
                <span>tree canopy</span>
              </div>
              <div>
                <strong>6</strong>
                <span>cool stops nearby</span>
              </div>
            </div>
          </VisualPanel>
        </template>
      </PageSection>

      <PageSection id="self-check" tone="lime" side-label="Section 05 - Self-check">
        <template #copy>
          <SectionKicker>Heat vulnerability self-check</SectionKicker>
          <h2>A short check for rest, water, and help.</h2>
          <p>
            The self-check stays quick and calm: a few plain questions, one risk level, and
            practical next steps for safer decisions in hot weather.
          </p>
          <div class="section-actions">
            <AppButton href="#hero">Back to Top</AppButton>
          </div>
        </template>

        <template #visual>
          <VisualPanel class="selfcheck-visual">
            <div class="check-panel">
              <span>60-second check</span>
              <h3>Today's heat risk</h3>
              <div class="risk-meter" aria-hidden="true"><i /></div>
              <ul>
                <li>Outside longer than 30 minutes?</li>
                <li>Dizzy, weak, or nauseous?</li>
                <li>Shade and water nearby?</li>
              </ul>
              <strong>Moderate risk</strong>
            </div>
          </VisualPanel>
        </template>
      </PageSection>
    </main>
  </div>
</template>

<style scoped>
.home {
  min-height: 100vh;
  color: var(--brand-ink);
  background:
    radial-gradient(circle at 22% -8%, rgba(155, 224, 111, 0.14), transparent 32%),
    linear-gradient(180deg, var(--brand-paper-white) 0%, var(--brand-paper) 100%);
}

.number-card {
  display: grid;
  grid-template-columns: 78px 1fr;
  gap: 7px 20px;
  align-content: center;
  min-height: 118px;
  padding: 24px;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.56);
  border: 1px solid var(--brand-line-soft);
}

.number-card + .number-card {
  margin-top: 18px;
}

.number-card span {
  grid-row: 1 / span 2;
  color: var(--brand-lime);
  font-size: 2.4rem;
  font-weight: 950;
  line-height: 1;
  -webkit-text-stroke: 1px rgba(35, 45, 39, 0.52);
}

.number-card strong {
  color: var(--brand-ink-soft);
  font-size: clamp(1.28rem, 1.7vw, 1.58rem);
  line-height: 1.15;
}

.number-card small {
  color: var(--brand-ink-muted);
  font-size: 1rem;
  line-height: 1.45;
}

.video-visual video {
  width: 100%;
  height: 100%;
  min-height: inherit;
  object-fit: cover;
}

.awareness-visual {
  display: grid;
  align-items: end;
  padding: clamp(26px, 4vw, 50px);
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.5), transparent 48%),
    rgba(252, 247, 235, 0.68);
}

.route-line {
  position: absolute;
  inset: 18% 12% 28%;
  border: 4px solid transparent;
  border-left-color: #243028;
  border-bottom-color: #243028;
  border-radius: 52% 36% 42% 28%;
}

.route-line::before {
  content: "";
  position: absolute;
  inset: 14% 10% 20% 24%;
  border-top: 4px solid var(--brand-lime);
  border-right: 4px solid var(--brand-lime);
  border-radius: 50%;
  transform: rotate(-10deg);
}

.stop {
  position: absolute;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--brand-gold);
  border: 4px solid var(--brand-paper-soft);
  box-shadow: 0 0 0 2px rgba(35, 45, 39, 0.12);
}

.stop--one {
  left: -10px;
  bottom: 4%;
}

.stop--two {
  left: 42%;
  top: 5%;
  background: var(--brand-sage);
}

.stop--three {
  right: 7%;
  top: 54%;
  background: var(--brand-sky);
}

.awareness-panel {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.awareness-panel div {
  padding: 18px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.62);
  border: 1px solid var(--brand-line-soft);
}

.awareness-panel strong {
  display: block;
  color: var(--brand-ink-soft);
  font-size: clamp(1.8rem, 3vw, 2.35rem);
  line-height: 1;
}

.awareness-panel span {
  color: var(--brand-ink-muted);
  font-size: 0.95rem;
}

.selfcheck-visual {
  display: grid;
  place-items: center;
  padding: clamp(26px, 4vw, 52px);
}

.check-panel {
  width: min(100%, 430px);
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: clamp(26px, 4vw, 42px);
  border-radius: 32px;
  background: rgba(252, 247, 235, 0.78);
  border: 1px solid var(--brand-line);
}

.check-panel span {
  color: #1d371f;
  font-size: 0.9rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.check-panel h3 {
  color: var(--brand-ink-soft);
  font-family: var(--font-body);
  font-size: clamp(2rem, 3vw, 2.6rem);
  font-weight: 950;
  letter-spacing: 0;
}

.risk-meter {
  height: 18px;
  border-radius: var(--r-pill);
  background: linear-gradient(90deg, var(--brand-lime), #f0c46a, #d77252);
  padding: 3px;
}

.risk-meter i {
  display: block;
  width: 16px;
  height: 12px;
  margin-left: 58%;
  border-radius: var(--r-pill);
  background: #fff;
}

.check-panel ul {
  list-style: none;
  display: grid;
  gap: 12px;
  color: var(--brand-ink-muted);
  font-weight: 650;
}

.check-panel li {
  padding: 14px 16px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid var(--brand-line-soft);
}

.check-panel strong {
  width: fit-content;
  padding: 10px 18px;
  border-radius: var(--r-pill);
  background: var(--brand-gold);
  color: #17150f;
}

[data-rise] {
  opacity: 0;
  transform: translateY(18px);
  transition:
    opacity var(--d-long) var(--ease-out-expo) var(--rise-delay, 0ms),
    transform var(--d-long) var(--ease-out-expo) var(--rise-delay, 0ms);
}

[data-rise].is-in {
  opacity: 1;
  transform: none;
}

@media (max-width: 640px) {
  .number-card,
  .awareness-panel {
    grid-template-columns: 1fr;
  }
}

@media (prefers-reduced-motion: reduce) {
  [data-rise] {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
</style>
