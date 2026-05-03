<script setup lang="ts">
import AppNav from '../components/AppNav.vue';
import AppButton from '../components/AppButton.vue';
import HeroFullSection from '../components/HeroFullSection.vue';
import PageSection from '../components/PageSection.vue';
import SectionKicker from '../components/SectionKicker.vue';
import VisualPanel from '../components/VisualPanel.vue';
</script>

<template>
  <div class="why-page">
    <AppNav />

    <main>
      <HeroFullSection
        id="why-hero"
        image-src="/whypage.png"
        image-alt="An older woman stands in a warm sunny landscape surrounded by shaded paths, a heat map, and a health checklist — representing the challenges Shadeo helps navigate."
      >
        <h1>Heat hits harder as we age.</h1>
      </HeroFullSection>

      <PageSection id="daily-routes" tone="warm" side-label="Problem 01 - Daily trips">
        <template #copy>
          <SectionKicker>Cooler daily routes</SectionKicker>
          <h2>Essentials should stay reachable.</h2>
          <p>
            On hot days, buying groceries, visiting a cafe, reaching a library, or attending
            an appointment can become difficult. Shadeo starts from common daily needs,
            then compares nearby options and route comfort.
          </p>
          <div class="section-actions">
            <AppButton href="/#navigation" variant="feature">See route concept</AppButton>
          </div>
        </template>

        <template #visual>
          <VisualPanel padded>
            <div class="route-card route-card--active">
              <span>Grocery</span>
              <strong>Up to five nearby choices</strong>
              <small>Ranked by walking distance first, then route comfort.</small>
            </div>
            <div class="route-card">
              <span>Cafe</span>
              <strong>Short route, shade score</strong>
              <small>Shade cover, benches, water, and toilets improve the score.</small>
            </div>
            <div class="route-card">
              <span>Library</span>
              <strong>Cooler place nearby</strong>
              <small>Useful for rest, connection, and time out of the heat.</small>
            </div>
          </VisualPanel>
        </template>
      </PageSection>

      <PageSection id="awareness-story" tone="lime" side-label="Problem 02 - Awareness">
        <template #copy>
          <SectionKicker>Who may need more care</SectionKicker>
          <h2>Risk is more than a hot number.</h2>
          <p>
            Shadeo looks at the things that make hot days harder: high heat, fewer trees,
            fewer cooling places, more older residents, mobility barriers, and limited
            support. The goal is to show where extra care may be needed.
          </p>
          <div class="section-actions">
            <AppButton href="/#awareness" variant="feature">View awareness section</AppButton>
          </div>
        </template>

        <template #visual>
          <VisualPanel class="awareness-board">
            <div class="heat-grid" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>
            <div class="data-strip">
              <div>
                <strong>Heat pressure</strong>
                <small>Hotter streets and fewer trees</small>
              </div>
              <div>
                <strong>Older residents</strong>
                <small>Where heat may affect more people</small>
              </div>
              <div>
                <strong>Nearby support</strong>
                <small>Cool places, water, seats, check-ins</small>
              </div>
            </div>
          </VisualPanel>
        </template>
      </PageSection>

      <PageSection id="self-check-story" tone="warm" side-label="Problem 03 - Personal risk">
        <template #copy>
          <SectionKicker>Heat vulnerability self-check</SectionKicker>
          <h2>Personal risk is more than the weather.</h2>
          <p>
            A safer decision depends on the area, the body, the home, mobility, and whether
            someone can check in. Shadeo keeps the result non-medical and turns it into
            practical preparation steps.
          </p>
          <div class="section-actions">
            <AppButton href="/#self-check" variant="feature">Start self-check</AppButton>
          </div>
        </template>

        <template #visual>
          <VisualPanel padded>
            <div class="factor-list">
              <span>Local heat exposure</span>
              <span>Personal heat sensitivity</span>
              <span>Home cooling capacity</span>
              <span>Mobility and daily access</span>
              <span>Check-ins and support network</span>
            </div>
          </VisualPanel>
        </template>
      </PageSection>

      <PageSection id="connection-story" tone="lime" side-label="Problem 04 - Connection">
        <template #copy>
          <SectionKicker>Social connection</SectionKicker>
          <h2>Staying cool should not mean staying alone.</h2>
          <p>
            Heat can make people avoid going out, which can deepen isolation. Shadeo can
            support cooler social routines: choosing reachable community places, planning
            low-risk outings, and reminding users to arrange check-ins.
          </p>
          <div class="section-actions">
            <AppButton href="/#hero" variant="feature">Back to home</AppButton>
          </div>
        </template>

        <template #visual>
          <VisualPanel padded>
            <div class="connection-card">
              <strong>Connection is part of heat safety.</strong>
              <p>
                The product should never label someone as lonely. It should ask gentle
                support questions and offer concrete actions: choose a cool public place,
                invite someone, or set a heatwave check-in person.
              </p>
            </div>
          </VisualPanel>
        </template>
      </PageSection>
    </main>
  </div>
</template>

<style scoped>
.why-page {
  min-height: 100vh;
  color: var(--brand-ink);
  background: var(--brand-paper-white);
}

.route-card,
.connection-card {
  padding: 24px;
  border-radius: 28px;
  border: 1px solid var(--brand-line-soft);
  background: rgba(255, 255, 255, 0.62);
}

.route-card + .route-card {
  margin-top: 18px;
}

.route-card span {
  display: inline-flex;
  min-height: 42px;
  align-items: center;
  padding: 0 16px;
  margin-bottom: 14px;
  border-radius: var(--r-pill);
  background: rgba(155, 224, 111, 0.24);
  color: var(--brand-ink-soft);
  font-size: var(--brand-fs-small);
  font-weight: 900;
}

.route-card strong,
.connection-card strong {
  display: block;
  color: var(--brand-ink-soft);
  font-size: clamp(1.35rem, 1.8vw, 1.7rem);
  line-height: 1.15;
}

.route-card small,
.connection-card p {
  display: block;
  margin-top: 10px;
  color: var(--brand-ink-muted);
  font-size: var(--brand-fs-body);
  line-height: var(--brand-lh-copy);
}

.awareness-board {
  display: grid;
  align-content: end;
  gap: 24px;
  padding: clamp(26px, 4vw, 50px);
}

.heat-grid {
  min-height: 270px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.heat-grid span {
  border-radius: 24px;
  background: rgba(155, 224, 111, 0.24);
}

.heat-grid span:nth-child(2),
.heat-grid span:nth-child(6) {
  background: rgba(239, 166, 43, 0.34);
}

.heat-grid span:nth-child(4),
.heat-grid span:nth-child(8) {
  background: rgba(216, 114, 82, 0.34);
}

.data-strip,
.factor-list {
  display: grid;
  gap: 12px;
}

.data-strip {
  grid-template-columns: repeat(3, 1fr);
}

.data-strip div,
.factor-list span {
  padding: 18px;
  border-radius: 22px;
  border: 1px solid var(--brand-line-soft);
  background: rgba(255, 255, 255, 0.62);
}

.data-strip strong {
  display: block;
  color: var(--brand-ink-soft);
  font-size: 1.25rem;
  line-height: 1.15;
}

.data-strip small {
  display: block;
  margin-top: 8px;
  color: var(--brand-ink-muted);
  font-size: var(--brand-fs-small);
  line-height: 1.4;
}

.factor-list span {
  color: var(--brand-ink-soft);
  font-size: var(--brand-fs-body);
  font-weight: 800;
}

@media (max-width: 640px) {
  .data-strip {
    grid-template-columns: 1fr;
  }

  .heat-grid {
    min-height: 220px;
  }
}
</style>
