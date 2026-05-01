<template>
  <main class="route-planner-page enhanced-planner" :class="{ 'is-route-view': isRouteView }">
    <div class="planner-scene" aria-hidden="true"></div>
    <div class="planner-scene-overlay" aria-hidden="true"></div>

    <nav class="planner-step-nav" aria-label="Planner progress">
      <button
        v-for="item in plannerSteps"
        :key="item.id"
        type="button"
        :disabled="!canNavigateToStep(item.id)"
        :class="{ active: currentStep === item.id, done: item.id < currentStep && canNavigateToStep(item.id), locked: !canNavigateToStep(item.id) }"
        @click="jumpToStep(item.id)"
      >
        <span>{{ item.id }}</span>
        <small>{{ item.label }}</small>
      </button>
    </nav>

    <section v-if="!isRouteView" class="planner-shell planner-flow-shell">
      <section class="planner-flow-hero">
        <h1>Plan a comfortable walk</h1>
      </section>

      <article v-if="currentStep === 1" class="planner-card planner-step-card planner-guided-card planner-step-pop" ref="startSectionEl">
        <div class="planner-card-heading">
          <span>1</span>
          <div>
            <h2>Starting point</h2>
            <p>Choose how Shadeo should set where your walk begins.</p>
          </div>
        </div>

        <div class="planner-choice-list">
          <button class="planner-choice-row" :class="{ active: startMode === 'current' }" type="button" @click="useMyLocation">
            <span class="planner-choice-icon" aria-hidden="true">
              <img :src="locationIcon" alt="" />
            </span>
            <span>
              <strong>{{ isLocating ? 'Detecting your current location...' : 'Use my current location' }}</strong>
              <small>Best when you are already at the starting point.</small>
            </span>
          </button>

          <button class="planner-choice-row" :class="{ active: startMode === 'manual' }" type="button" @click="startMode = 'manual'">
            <span class="planner-choice-icon" aria-hidden="true">
              <img :src="searchIcon" alt="" />
            </span>
            <span>
              <strong>Search address or place</strong>
              <small>Type a street address, suburb, or landmark as your starting point.</small>
            </span>
          </button>
        </div>

        <form v-if="startMode === 'manual'" class="planner-search-box" @submit.prevent="runStartSearch">
          <label for="planner-start-query">Enter your starting point</label>
          <div class="planner-search-line">
            <input
              id="planner-start-query"
              v-model.trim="startQuery"
              type="text"
              placeholder="Example: State Library Victoria, 328 Swanston St"
            />
            <button class="btn btn-primary" type="submit" :disabled="!startQuery || isSearchingStart">
              {{ isSearchingStart ? 'Searching...' : 'Search' }}
            </button>
          </div>

        </form>

        <div v-if="startSearchResults.length" class="planner-search-results" aria-label="Start search results">
          <button
            v-for="place in startSearchResults"
            :key="place.id"
            type="button"
            :class="{ active: selectedStart?.id === place.id }"
            @click="selectStartPlace(place)"
          >
            <strong>{{ place.name }}</strong>
            <small>{{ place.address }}</small>
          </button>
        </div>

        <p v-if="selectedStart" class="planner-selection-note">
          Start selected: <strong>{{ selectedStart.name }}</strong>
        </p>
        <p v-if="startValidationMessage" class="planner-selection-note planner-selection-note-error">
          {{ startValidationMessage }}
        </p>
      </article>

      <article v-if="currentStep === 2" class="planner-card planner-step-card planner-guided-card planner-step-pop" ref="destinationSectionEl">
        <button class="planner-step-back-btn" type="button" @click="jumpToStep(1)">
          <span aria-hidden="true">&lt;</span>
          Back to starting point
        </button>

        <div class="planner-card-heading">
          <span>2</span>
          <div>
            <h2>Destination</h2>
            <p>First choose whether you already know the place, or want Shadeo to suggest by category.</p>
          </div>
        </div>

        <div class="planner-segmented">
          <button type="button" :class="{ active: destinationMode === 'category' }" @click="setDestinationMode('category')">
            Choose by type
          </button>
          <button type="button" :class="{ active: destinationMode === 'specific' }" @click="setDestinationMode('specific')">
            Search specific place
          </button>
        </div>

        <div v-if="destinationMode === 'category'" class="planner-category-panel">
          <p class="planner-panel-instruction">Select one destination type. Shadeo will request nearby route options from the backend.</p>
          <div class="planner-type-grid planner-type-grid-clean">
            <button
              v-for="item in destinationTypes"
              :key="item.id"
              class="planner-type-card"
              :class="{ active: selectedType === item.id }"
              type="button"
              @click="chooseDestinationType(item.id)"
            >
              <span class="planner-type-icon" aria-hidden="true">
                <img :src="item.icon" alt="" />
              </span>
              <span class="planner-type-name">{{ item.label }}</span>
            </button>
          </div>
        </div>

        <form v-if="destinationMode === 'specific'" class="planner-search-box" @submit.prevent="runDestinationSearch">
          <label for="planner-destination-query">Search for a specific destination</label>
          <div class="planner-search-line">
            <input
              id="planner-destination-query"
              v-model.trim="destinationQuery"
              type="text"
              placeholder="Example: Chemist Warehouse Melbourne Central"
            />
            <button class="btn btn-primary" type="submit" :disabled="!destinationQuery || isSearchingDestination">
              {{ isSearchingDestination ? 'Searching...' : 'Search' }}
            </button>
          </div>
          <p>Use this path when you already know where you want to go.</p>
        </form>

        <div v-if="destinationSearchResults.length" class="planner-search-results" aria-label="Destination search results">
          <button
            v-for="place in destinationSearchResults"
            :key="place.id"
            type="button"
            :class="{ active: selectedSpecificDestination?.id === place.id }"
            @click="selectSpecificDestination(place)"
          >
            <strong>{{ place.name }}</strong>
            <small>{{ place.address }}</small>
          </button>
        </div>

        <p v-if="destinationReadyLabel" class="planner-selection-note">
          Destination choice: <strong>{{ destinationReadyLabel }}</strong>
        </p>
        <p v-if="destinationValidationMessage" class="planner-selection-note planner-selection-note-error">
          {{ destinationValidationMessage }}
        </p>

        <div class="planner-flow-action">
          <button class="btn btn-primary planner-continue-btn" type="button" :disabled="!canFindRecommendations || isLoadingPlan" @click="requestPlan">
            {{ isLoadingPlan ? 'Requesting route...' : 'Continue to results' }}
            <span aria-hidden="true">&gt;</span>
          </button>
          <p v-if="!canFindRecommendations">Choose a destination path first.</p>
        </div>
      </article>

      <section class="planner-result-anchor" ref="resultsSectionEl">
        <article v-if="currentStep === 3 && isLoadingPlan" class="planner-card planner-result-loading-card planner-step-pop">
          <span class="planner-spinner" aria-hidden="true"></span>
          <h3>Requesting your route...</h3>
          <p>Shadeo is checking the backend planner for the nearest suitable result.</p>
        </article>

        <article v-else-if="currentStep === 3 && hasSearched && recommendations.length && !hasDestination" class="planner-card planner-recommendation-layout planner-step-pop">
          <div class="planner-recommendation-list">
            <button class="planner-step-back-btn" type="button" @click="jumpToStep(2)">
              <span aria-hidden="true">&lt;</span>
              Back to destination
            </button>

            <div class="planner-section-headline">
              <p>Results</p>
              <h3>Compare nearby options</h3>
              <span>Select an option to preview its details.</span>
            </div>
            <article
              v-for="(item, index) in recommendations"
              :key="item.id"
              class="planner-destination-card"
              :class="{ 'is-top-result': index === 0, 'is-selected': highlightedRecommendationId === item.id }"
              @click="highlightRecommendation(item)"
            >
              <span class="planner-destination-rank">{{ index + 1 }}</span>
              <span class="planner-destination-body">
                <span class="planner-destination-topline">
                  <span v-if="index === 0" class="planner-rec-label">Most Recommended</span>
                  <span class="planner-score-badge" :class="scoreTone(item.score)">
                    <span aria-hidden="true">��</span>
                    {{ formatScore(item.score) }}
                  </span>
                </span>
                <strong>{{ item.destination.name }}</strong>
                <small class="planner-destination-address">{{ item.destination.address }}</small>
                <span class="planner-destination-metrics">
                  <span>
                    <img :src="timeIcon" alt="" aria-hidden="true" />
                    {{ formatMinutes(item.metrics.durationMinutes) }} walk
                  </span>
                  <span>
                    <img :src="locationPinIcon" alt="" aria-hidden="true" />
                    {{ formatDistance(item.metrics.distanceMeters) }}
                  </span>
                </span>
                <span class="planner-tag-row">
                  <em v-for="note in item.comfortNotes.slice(0, index === 0 ? 3 : 2)" :key="note">{{ note }}</em>
                </span>
                <button
                  v-if="highlightedRecommendationId === item.id"
                  class="planner-view-details"
                  type="button"
                  @click.stop="selectRecommendation(item)"
                >
                  View details <span aria-hidden="true">&gt;</span>
                </button>
              </span>
            </article>
          </div>
          <div class="planner-mini-map-panel">
            <div class="planner-mini-map-head">
              <strong>Nearby options</strong>
              <span>Backend destination pin and your selected start point</span>
            </div>
            <div ref="miniMapEl" class="planner-mini-map"></div>
          </div>
        </article>

        <article v-else-if="currentStep === 3 && hasSearched && !isLoadingPlan && !recommendations.length" class="planner-card planner-result-loading-card planner-step-pop">
          <button class="planner-step-back-btn" type="button" @click="jumpToStep(2)">
            <span aria-hidden="true">&lt;</span>
            Back to destination
          </button>
          <h3>No route result found</h3>
          <p>{{ planError || 'The backend did not return a suitable destination for this start point and category.' }}</p>
        </article>

        <article v-else-if="currentStep === 3 && hasDestination" class="planner-card planner-recommendation-layout planner-detail-layout planner-step-pop">
          <div class="planner-detail-panel">
            <button class="planner-back-btn" type="button" @click="backToRecommendations">Back to results</button>
            <div class="planner-detail-title-row">
              <img :src="selectedTypeIconUrl" alt="" />
              <div>
                <p>{{ result.destination.address }}</p>
                <h3>{{ result.destination.name }}</h3>
              </div>
            </div>

            <div class="planner-metric-row">
              <span class="planner-metric-chip">
                <img :src="walkIcon" alt="" aria-hidden="true" />
                <strong>{{ distanceMetric.value }}</strong>
                <em>{{ distanceMetric.unit }}</em>
                <small>away</small>
              </span>
              <span class="planner-metric-chip">
                <img :src="timeIcon" alt="" aria-hidden="true" />
                <strong>{{ walkMetric.value }}</strong>
                <em>{{ walkMetric.unit }}</em>
                <small>walk</small>
              </span>
            </div>

            <div class="planner-detail-facilities">
              <h3>Along the way</h3>
              <div class="rv-fac-grid">
                <div class="rv-fac-card rv-fac-bench" v-if="facilityBreakdown.bench > 0">
                  <img :src="benchIcon" alt="" />
                  <div>
                    <strong>{{ facilityBreakdown.bench }}</strong>
                    <span>Benches</span>
                  </div>
                </div>
                <div class="rv-fac-card rv-fac-toilet" v-if="facilityBreakdown.toilet > 0">
                  <img :src="toiletIcon" alt="" />
                  <div>
                    <strong>{{ facilityBreakdown.toilet }}</strong>
                    <span>Toilets</span>
                  </div>
                </div>
                <div class="rv-fac-card rv-fac-fountain" v-if="facilityBreakdown.drinking_fountain > 0">
                  <img :src="fountainIcon" alt="" />
                  <div>
                    <strong>{{ facilityBreakdown.drinking_fountain }}</strong>
                    <span>Fountains</span>
                  </div>
                </div>
                <div
                  v-if="facilityBreakdown.bench === 0 && facilityBreakdown.toilet === 0 && facilityBreakdown.drinking_fountain === 0"
                  class="rv-no-facilities"
                >
                  No support facilities were returned along this route
                </div>
              </div>
            </div>

            <div class="planner-summary-actions">
              <button class="btn btn-primary planner-see-route-btn" @click="openReadinessCheck" :disabled="!canSeeRoute">
                Pre-trip checklist
              </button>
              <button class="btn planner-change-btn" @click="backToRecommendations">
                Change
              </button>
            </div>
          </div>
          <div class="planner-mini-map-panel">
            <div class="planner-mini-map-head">
              <strong>Route preview</strong>
              <span>Start and destination locations only</span>
            </div>
            <div ref="miniMapEl" class="planner-mini-map"></div>
          </div>
        </article>
      </section>
    </section>

    <div v-if="isReadinessOpen" class="planner-readiness-backdrop" role="presentation" @click.self="closeReadinessToResults">
      <section class="planner-readiness-modal" role="dialog" aria-modal="true" aria-labelledby="readiness-title">
        <div class="planner-readiness-head">
          <div>
            <p>Pre-trip Check</p>
            <h2 id="readiness-title">Are you ready to go?</h2>
          </div>
          <button type="button" class="planner-map-picker-close" @click="closeReadinessToResults">Close</button>
        </div>

        <button class="planner-step-back-btn" type="button" @click="closeReadinessToResults">
          <span aria-hidden="true">&lt;</span>
          Back to route details
        </button>

        <div class="planner-readiness-block planner-weather-card">
          <div class="planner-readiness-title-row">
            <h3>Weather before you leave</h3>
            <span v-if="weather.isLoading">Checking weather...</span>
          </div>
          <p class="planner-readiness-advice" :class="{ unwell: weatherAdvice.tone === 'caution' }">
            {{ weatherAdvice.message }}
          </p>
          <ul class="planner-comfort-notes">
            <li v-for="note in weatherAdvice.items" :key="note">{{ note }}</li>
          </ul>
        </div>

        <div class="planner-readiness-block">
          <h3>{{ selectedTypeLabel }} reminders</h3>
          <p class="planner-check-intro">{{ destinationChecklistIntro }}</p>
          <label v-for="item in destinationChecklistItems" :key="item.id" class="planner-check-row">
            <input v-model="readiness.tripItems" type="checkbox" :value="item.label" />
            <span>{{ item.label }}</span>
          </label>
        </div>

        <div v-if="destinationKind === 'grocery'" class="planner-readiness-block">
          <h3>Shopping list</h3>
          <p class="planner-check-intro">Add a few things you want to buy. Your list will stay visible on the route map.</p>
          <form class="planner-shopping-form" @submit.prevent="addShoppingItem">
            <input
              v-model.trim="shoppingInput"
              type="text"
              placeholder="Example: milk, bread, bananas"
              aria-label="Shopping item"
            />
            <button type="submit" aria-label="Add shopping item">+</button>
          </form>
          <ul v-if="shoppingItems.length" class="planner-shopping-list">
            <li v-for="item in shoppingItems" :key="item.id">
              <span>{{ item.text }}</span>
              <button type="button" :aria-label="`Remove ${item.text}`" @click="removeShoppingItem(item.id)">Remove</button>
            </li>
          </ul>
        </div>

        <div class="planner-readiness-block">
          <h3>Everyday items</h3>
          <p class="planner-check-intro">A quick check can help you avoid turning back after you leave.</p>
          <label v-for="item in essentialItems" :key="item.id" class="planner-check-row">
            <input v-model="readiness.essentials" type="checkbox" :value="item.label" />
            <span>{{ item.label }}</span>
          </label>
        </div>

        <div class="planner-readiness-result">
          <strong>{{ readinessResult.title }}</strong>
          <span>{{ readinessResult.copy }}</span>
        </div>

        <div class="planner-summary-actions">
          <button class="btn btn-primary planner-ready-btn" type="button" @click="confirmReadyToGo">Ready to Go</button>
          <button class="btn planner-change-btn" type="button" disabled>Download route summary (coming soon)</button>
        </div>
      </section>
    </div>

    <section v-if="isRouteView" class="planner-route-shell">
      <aside class="planner-route-panel rv-panel">
        <button class="planner-back-btn rv-back-btn" @click="jumpToStep(4)">
          <span class="rv-back-icon" aria-hidden="true">&lt;</span>
          Back to readiness
        </button>

        <div class="rv-dest-header">
          <div class="rv-dest-icon-wrap">
            <img :src="selectedTypeIconUrl" alt="" />
          </div>
          <div class="rv-dest-info">
            <p class="rv-dest-type-label">{{ selectedTypeLabel }}</p>
            <h2 class="rv-dest-name">{{ result.destination?.name }}</h2>
          </div>
        </div>

        <div class="rv-stats-row">
          <div class="rv-stat-card">
            <div class="rv-stat-main">
              <strong>{{ walkMinutes }}</strong>
              <strong>MIN</strong>
            </div>
            <span>Walking time</span>
          </div>
          <div class="rv-stat-card">
            <div class="rv-stat-main">
              <strong>{{ distanceMetric.value }}</strong>
              <strong>{{ distanceMetric.unit.toUpperCase() }}</strong>
            </div>
            <span>Distance away</span>
          </div>
        </div>

        <div class="rv-section">
          <h3>Along the way</h3>
          <div class="rv-fac-grid">
            <div class="rv-fac-card rv-fac-bench" v-if="facilityBreakdown.bench > 0">
              <img :src="benchIcon" alt="" />
              <div>
                <strong>{{ facilityBreakdown.bench }}</strong>
                <span>Benches</span>
              </div>
            </div>
            <div class="rv-fac-card rv-fac-toilet" v-if="facilityBreakdown.toilet > 0">
              <img :src="toiletIcon" alt="" />
              <div>
                <strong>{{ facilityBreakdown.toilet }}</strong>
                <span>Toilets</span>
              </div>
            </div>
            <div class="rv-fac-card rv-fac-fountain" v-if="facilityBreakdown.drinking_fountain > 0">
              <img :src="fountainIcon" alt="" />
              <div>
                <strong>{{ facilityBreakdown.drinking_fountain }}</strong>
                <span>Fountains</span>
              </div>
            </div>
            <div
              v-if="facilityBreakdown.bench === 0 && facilityBreakdown.toilet === 0 && facilityBreakdown.drinking_fountain === 0"
              class="rv-no-facilities"
            >
              No support facilities were returned along this route
            </div>
          </div>
        </div>

        <div class="rv-section rv-legend-section">
          <h3>Map legend</h3>
          <div class="rv-legend-list">
            <div class="rv-legend-row">
              <div class="rv-legend-icon rv-licon-start">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="white"><circle cx="12" cy="4" r="2.5"/><path d="M10 8.5c-1.1 0-2 .9-2 2v4h2v5h4v-5h2v-4c0-1.1-.9-2-2-2h-4z"/></svg>
              </div>
              You (start)
            </div>
            <div class="rv-legend-row">
              <div class="rv-legend-icon rv-licon-dest">
                <img :src="selectedTypeIconUrl" width="15" height="15" style="filter:invert(1)" />
              </div>
              Destination
            </div>
            <div class="rv-legend-row">
              <div class="rv-legend-icon rv-licon-bench">
                <img :src="benchIcon" width="15" height="15" style="filter:invert(1)" />
              </div>
              Bench
            </div>
            <div class="rv-legend-row">
              <div class="rv-legend-icon rv-licon-toilet">
                <img :src="toiletIcon" width="15" height="15" style="filter:invert(1)" />
              </div>
              Toilet
            </div>
            <div class="rv-legend-row">
              <div class="rv-legend-icon rv-licon-fountain">
                <img :src="fountainIcon" width="15" height="15" style="filter:invert(1)" />
              </div>
              Drinking fountain
            </div>
            <div class="rv-legend-row">
              <span class="rv-ldot rv-ldot-route"></span>
              Walking route
            </div>
            <div class="rv-legend-row">
              <span class="rv-ldot rv-ldot-shade"></span>
              Tree canopy shade
            </div>
          </div>
        </div>

        <div class="rv-section">
          <h3>Save route</h3>
          <button class="btn planner-change-btn planner-export-btn" type="button" disabled>Download route summary (coming soon)</button>
        </div>
      </aside>

      <section class="planner-route-map-area">
        <div v-if="isLoadingPlan" class="planner-map-loading" role="status" aria-live="polite">
          <span class="planner-spinner" aria-hidden="true"></span>
          <p>Loading route map...</p>
        </div>
        <aside v-if="showMapShoppingList" class="planner-map-shopping-card" aria-label="Shopping list">
          <strong>Shopping list</strong>
          <ul>
            <li v-for="item in shoppingItems" :key="item.id">{{ item.text }}</li>
          </ul>
        </aside>
        <div ref="mapEl" class="planner-route-map"></div>
      </section>
    </section>
  </main>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, reactive, ref, watch } from 'vue'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { Protocol } from 'pmtiles'
import pharmacyIcon from '../assets/svg/pharmacy.svg'
import groceryIcon from '../assets/svg/grocery.svg'
import clinicIcon from '../assets/svg/clinic.svg'
import parkIcon from '../assets/svg/park.svg'
import cafeIcon from '../assets/svg/break-cafe.svg'
import locationIcon from '../assets/svg/location-icon.svg'
import locationPinIcon from '../assets/svg/location-pin.svg'
import searchIcon from '../assets/svg/search.svg'
import walkIcon from '../assets/svg/walk.svg'
import timeIcon from '../assets/svg/time-icon.svg'
import benchIcon from '../assets/svg/bench-icon.svg'
import toiletIcon from '../assets/svg/toilet-icon.svg'
import fountainIcon from '../assets/svg/drinking-fountain-icon.svg'

const DEFAULT_MAP_CENTER = { lat: -37.8136, lng: 144.9631 }
const MAP_VIEW_BOUNDS = [[-37.895, 144.875], [-37.735, 145.055]]
const MAP_MIN_ZOOM = 12
const MAP_MAX_ZOOM = Number(import.meta.env.VITE_MAP_MAX_ZOOM || 18)
const PMTILES_MAX_DATA_ZOOM = Number(import.meta.env.VITE_PMTILES_MAX_DATA_ZOOM || 14)
const MUNICIPAL_BOUNDARY_URL = '/data/municipal-boundary.geojson'
const SUPPORTED_AREA_ERROR = 'This location is outside the supported Central Melbourne area.'
const MAP_STYLE_URL = import.meta.env.VITE_MAP_STYLE_URL || '/styles/positron/style.json'
const PMTILES_URL = import.meta.env.VITE_PMTILES_URL || 'https://pub-64269a193cf745e5b366a287e94c5196.r2.dev/maps/melbourne.pmtiles'
const MAP_GLYPHS_URL = import.meta.env.VITE_MAP_GLYPHS_URL || '/fonts/{fontstack}/{range}.pbf'
const MAP_SPRITE_URL = import.meta.env.VITE_MAP_SPRITE_URL || '/styles/positron/sprite'
const ROUTE_SERVICE_URL = import.meta.env.VITE_ROUTE_SERVICE_URL || 'https://krdihvgnt5.execute-api.ap-southeast-2.amazonaws.com/default/new-route-service'
const PLACE_SEARCH_URL = import.meta.env.VITE_PLACE_SEARCH_URL || 'https://t0413oh804.execute-api.ap-southeast-2.amazonaws.com/default/place-search-service'
const CANOPY_QUERY_URL = import.meta.env.VITE_CANOPY_QUERY_URL || 'https://ev1dboadg5.execute-api.ap-southeast-2.amazonaws.com/default/canopy-query-service'
const DEBUG_PLANNER = import.meta.env.DEV || import.meta.env.VITE_DEBUG_PLANNER === 'true'

const pmtilesProtocol = new Protocol()
maplibregl.addProtocol('pmtiles', pmtilesProtocol.tile)

const plannerSteps = [
  { id: 1, label: 'Start' },
  { id: 2, label: 'Destination' },
  { id: 3, label: 'Results' },
  { id: 4, label: 'Readiness' },
  { id: 5, label: 'Route' }
]

const destinationTypes = [
  { id: 'pharmacy', label: 'Pharmacy', icon: pharmacyIcon },
  { id: 'clinic', label: 'Clinic', icon: clinicIcon },
  { id: 'grocery', label: 'Grocery', icon: groceryIcon },
  { id: 'cafe', label: 'Cafe', icon: cafeIcon },
  { id: 'park', label: 'Park', icon: parkIcon }
]

const essentialItems = [
  { id: 'keys', label: 'Keys' },
  { id: 'phone', label: 'Charged mobile phone' },
  { id: 'wallet', label: 'Wallet, bank card, or transport card' },
  { id: 'water', label: 'Water bottle' },
  { id: 'glasses', label: 'Glasses, hearing aids, or walking aid if you use them' },
  { id: 'shoes', label: 'Comfortable shoes' },
  { id: 'home', label: 'Door locked and stove or appliances turned off' },
  { id: 'share', label: 'Tell someone where you are going if that helps you feel safer' }
]

const destinationChecklistByType = {
  grocery: {
    intro: 'A small list can make shopping easier and reduce the chance of forgetting something.',
    items: [
      { id: 'bag', label: 'Reusable shopping bag or trolley' },
      { id: 'payment', label: 'Payment card or cash' },
      { id: 'loyalty', label: 'Store card, discount card, or coupons if you use them' },
      { id: 'weight', label: 'Plan to buy only what feels comfortable to carry home' }
    ]
  },
  pharmacy: {
    intro: 'Before visiting the pharmacy, check the items that help staff support you quickly.',
    items: [
      { id: 'prescription', label: 'Prescription, refill notice, or medicine box' },
      { id: 'medicine-list', label: 'List of medicines you currently take' },
      { id: 'medicare', label: 'Medicare card, concession card, or pharmacy card' },
      { id: 'questions', label: 'Questions you want to ask the pharmacist' }
    ]
  },
  clinic: {
    intro: 'For a clinic visit, bring the information your doctor or nurse may need.',
    items: [
      { id: 'appointment', label: 'Appointment time and clinic details' },
      { id: 'medicare', label: 'Medicare card and any health insurance card' },
      { id: 'referral', label: 'Referral letter, test results, or previous reports if you have them' },
      { id: 'medicines', label: 'Current medicine list and allergy information' },
      { id: 'notes', label: 'Notes about symptoms or questions you want to discuss' }
    ]
  },
  cafe: {
    intro: 'For a cafe stop, check a few small things before you go.',
    items: [
      { id: 'payment', label: 'Payment card or cash' },
      { id: 'booking', label: 'Booking details if you made a reservation' },
      { id: 'glasses', label: 'Reading glasses if you need them for the menu' },
      { id: 'diet', label: 'Any diet or allergy notes you may want to mention' }
    ]
  },
  park: {
    intro: 'For a park visit, prepare for comfort outdoors.',
    items: [
      { id: 'sun', label: 'Hat, sunglasses, or sunscreen' },
      { id: 'layer', label: 'Light jacket or umbrella if the weather may change' },
      { id: 'seat', label: 'Check where benches or rest spots are along the way' },
      { id: 'support', label: 'Walking aid or support item if you use one' }
    ]
  },
  default: {
    intro: 'Check the items that may help with this trip.',
    items: [
      { id: 'details', label: 'Destination address or appointment details' },
      { id: 'payment', label: 'Payment card or cash if needed' },
      { id: 'notes', label: 'Any notes or documents for this visit' }
    ]
  }
}

const startMode = ref('')
const destinationMode = ref('category')
const selectedStart = ref(null)
const selectedSpecificDestination = ref(null)
const selectedType = ref('')
const startQuery = ref('')
const destinationQuery = ref('')
const startSearchResults = ref([])
const destinationSearchResults = ref([])
const recommendations = ref([])
const highlightedRecommendationId = ref('')
const isSearchingStart = ref(false)
const isSearchingDestination = ref(false)
const isLoadingPlan = ref(false)
const isLocating = ref(false)
const isReadinessOpen = ref(false)
const isRouteView = ref(false)
const hasSearched = ref(false)
const planError = ref('')
const startValidationMessage = ref('')
const destinationValidationMessage = ref('')
const visibleStep = ref(1)
const maxReachableStep = ref(1)

const readiness = reactive({ tripItems: [], essentials: [] })
const weather = reactive({ isLoading: false, error: '', current: null, daily: null })
const shoppingInput = ref('')
const shoppingItems = ref([])
const result = reactive({
  destination: null,
  facilities: [],
  route: [],
  metrics: { distanceMeters: null, durationMinutes: null },
  score: null,
  scoreBreakdown: {},
  facilitySummary: {},
  canopy: null,
  comfortNotes: [],
  instructions: []
})

const startSectionEl = ref(null)
const destinationSectionEl = ref(null)
const resultsSectionEl = ref(null)
const miniMapEl = ref(null)
const mapEl = ref(null)

let miniMap = null
let map = null
let boundaryGeoJsonPromise = null
let mapStylePromise = null
let routeDashFrame = null
let routeDashOffset = 0
const miniMapMarkers = []
const routeMapMarkers = []

const hasDestination = computed(() => !!result.destination)
const destinationKind = computed(() => selectedType.value || result.destination?.type || selectedSpecificDestination.value?.type || '')
const selectedTypeLabel = computed(() => destinationTypes.find((d) => d.id === selectedType.value)?.label || selectedSpecificDestination.value?.type || 'Destination')
const selectedTypeIconUrl = computed(() => destinationTypes.find((d) => d.id === selectedType.value || d.id === selectedSpecificDestination.value?.type)?.icon || parkIcon)
const destinationReadyLabel = computed(() => {
  if (destinationMode.value === 'specific') return selectedSpecificDestination.value?.name || ''
  return selectedType.value ? selectedTypeLabel.value : ''
})
const canFindRecommendations = computed(() => !!selectedStart.value && (destinationMode.value === 'specific' ? !!selectedSpecificDestination.value : !!selectedType.value))
const currentStep = computed(() => {
  if (isRouteView.value) return 5
  if (isReadinessOpen.value) return 4
  return visibleStep.value
})
const routeDistanceMeters = computed(() => Number.isFinite(result.metrics.distanceMeters) ? result.metrics.distanceMeters : 0)
const distanceMetric = computed(() => routeDistanceMeters.value >= 1000
  ? { value: (routeDistanceMeters.value / 1000).toFixed(2), unit: 'km' }
  : { value: `${Math.round(routeDistanceMeters.value || 0)}`, unit: 'm' })
const walkMinutes = computed(() => Number.isFinite(result.metrics.durationMinutes) ? `${Math.max(1, Math.round(result.metrics.durationMinutes))}` : '--')
const walkMetric = computed(() => ({ value: walkMinutes.value, unit: 'min' }))
const facilityBreakdown = computed(() => {
  const output = { bench: 0, drinking_fountain: 0, toilet: 0 }
  Object.entries(result.facilitySummary || {}).forEach(([key, value]) => {
    if (output[key] !== undefined && Number.isFinite(Number(value))) output[key] = Number(value)
  })
  if (Object.values(output).some((value) => value > 0)) return output
  result.facilities.forEach((item) => {
    if (output[item.type] !== undefined) output[item.type] += 1
  })
  return output
})
const routeComfortNotes = computed(() => result.comfortNotes.length ? result.comfortNotes : readinessRouteAlerts.value)
const scoreBreakdownRows = computed(() => [
  { key: 'distance', label: 'Distance and time', value: result.scoreBreakdown.distance ?? '--' },
  { key: 'bench', label: 'Bench coverage', value: result.scoreBreakdown.bench ?? '--' },
  { key: 'toilet', label: 'Toilet coverage', value: result.scoreBreakdown.toilet ?? '--' },
  { key: 'drinking_fountain', label: 'Water access', value: result.scoreBreakdown.drinking_fountain ?? '--' },
  { key: 'shade', label: 'Shade', value: result.scoreBreakdown.shade ?? '--' },
  { key: 'slope', label: 'Slope comfort', value: result.scoreBreakdown.slope ?? '--' }
])
const destinationChecklist = computed(() => destinationChecklistByType[destinationKind.value] || destinationChecklistByType.default)
const destinationChecklistIntro = computed(() => destinationChecklist.value.intro)
const destinationChecklistItems = computed(() => destinationChecklist.value.items)
const weatherCodeLabel = (code) => {
  if ([0, 1].includes(code)) return 'mostly clear'
  if ([2, 3].includes(code)) return 'cloudy'
  if ([45, 48].includes(code)) return 'foggy'
  if ([51, 53, 55, 56, 57].includes(code)) return 'drizzly'
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return 'rainy'
  if ([95, 96, 99].includes(code)) return 'stormy'
  return 'changeable'
}
const weatherAdvice = computed(() => {
  if (weather.isLoading) {
    return {
      tone: 'normal',
      message: 'Checking the latest weather for your starting area.',
      items: ['Please wait a moment before you leave.']
    }
  }
  if (weather.error || !weather.current) {
    return {
      tone: 'normal',
      message: 'Weather advice is not available right now.',
      items: ['Please check the sky before leaving.', 'Bring water and sun or rain protection if needed.']
    }
  }
  const temperature = Math.round(Number(weather.current.temperature_2m))
  const apparent = Math.round(Number(weather.current.apparent_temperature))
  const wind = Math.round(Number(weather.current.wind_speed_10m))
  const precipitation = Number(weather.current.precipitation ?? weather.current.rain ?? 0)
  const dailyRainChance = Number(weather.daily?.precipitation_probability_max?.[0])
  const code = Number(weather.current.weather_code)
  const items = []
  let tone = 'normal'

  if (temperature >= 28 || apparent >= 30) {
    tone = 'caution'
    items.push('It may feel warm. Take water, wear a hat, and rest in shade when you can.')
  } else if (temperature <= 12) {
    items.push('It may feel cool. A warm layer can make the walk more comfortable.')
  } else {
    items.push('The temperature looks comfortable for a short walk.')
  }
  if (precipitation > 0 || dailyRainChance >= 40 || [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
    tone = 'caution'
    items.push('Rain is possible. Bring an umbrella or rain jacket, and take care on wet paths.')
  }
  if (wind >= 28) {
    tone = 'caution'
    items.push('It may be windy. Walk slowly and avoid carrying loose items.')
  }
  items.push('If the weather changes, it is okay to pause or choose another time.')

  return {
    tone,
    message: `Current weather looks ${weatherCodeLabel(code)}, about ${temperature}��C.`,
    items
  }
})
const readinessRouteAlerts = computed(() => [
  'This route can include backend comfort markers for benches, toilets, and drinking fountains.',
  'Tree canopy shade is displayed on the final route map when available.'
])
const readinessResult = computed(() => {
  return { title: 'Ready when you are', copy: 'Use this list as a gentle reminder. You can still decide what applies to you today.' }
})
const routeInstructions = computed(() => result.instructions.length ? result.instructions : [
  { text: `Start from ${selectedStart.value?.name || 'your start point'}.`, distanceMeters: 0 },
  { text: `Follow the highlighted route to ${result.destination?.name || 'your destination'}.`, distanceMeters: result.metrics.distanceMeters },
  { text: 'Check the route notes before leaving.', distanceMeters: null }
])
const canSeeRoute = computed(() => !!result.destination && result.route.length > 1)
const showMapShoppingList = computed(() => destinationKind.value === 'grocery' && shoppingItems.value.length > 0)

const formatScore = (score) => Number.isFinite(Number(score)) ? `${Math.round(Number(score))}/100` : 'Score --'
const scoreTone = (score) => {
  const value = Number(score)
  if (value >= 80) return 'score-high'
  if (value >= 68) return 'score-medium'
  return 'score-low'
}
const formatMinutes = (minutes) => Number.isFinite(Number(minutes)) ? `${Math.max(1, Math.round(Number(minutes)))} min` : '-- min'
const formatDistance = (meters) => {
  const value = Number(meters)
  if (!Number.isFinite(value)) return '-- m'
  return value >= 1000 ? `${(value / 1000).toFixed(2)} km` : `${Math.round(value)} m`
}
const firstComfortNote = (recommendation) => recommendation.comfortNotes?.[0] || 'Comfort score based on distance and route support'
const scrollTo = (el) => el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
const unlockStep = (id) => {
  maxReachableStep.value = Math.max(maxReachableStep.value, id)
}
const lockAfterStep = (id) => {
  maxReachableStep.value = Math.min(maxReachableStep.value, id)
}
const canNavigateToStep = (id) => id <= maxReachableStep.value
const showStep = async (id) => {
  visibleStep.value = id
  isReadinessOpen.value = false
  isRouteView.value = false
  await nextTick()
  if (id === 1) scrollTo(startSectionEl.value)
  if (id === 2) scrollTo(destinationSectionEl.value)
  if (id === 3) {
    drawMiniMap()
    scrollTo(resultsSectionEl.value)
  }
}
const invalidateFromStartChange = () => {
  selectedType.value = ''
  selectedSpecificDestination.value = null
  destinationSearchResults.value = []
  clearPlanOnly()
  maxReachableStep.value = 2
}
const invalidateFromDestinationChange = () => {
  clearPlanOnly()
  lockAfterStep(2)
}
const samePlace = (left, right) => left?.id === right?.id
const pointInMapBounds = (place) => {
  const lat = Number(place?.lat)
  const lng = Number(place?.lng)
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false
  const [[south, west], [north, east]] = MAP_VIEW_BOUNDS
  return lat >= south && lat <= north && lng >= west && lng <= east
}
const pointInRing = ([lng, lat], ring) => {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i]
    const [xj, yj] = ring[j]
    const intersects = ((yi > lat) !== (yj > lat)) && (lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi)
    if (intersects) inside = !inside
  }
  return inside
}
const pointInPolygon = (point, rings) => {
  if (!rings?.length || !pointInRing(point, rings[0])) return false
  return !rings.slice(1).some((ring) => pointInRing(point, ring))
}
const geometryContainsPoint = (geometry, point) => {
  if (!geometry) return false
  if (geometry.type === 'Polygon') return pointInPolygon(point, geometry.coordinates)
  if (geometry.type === 'MultiPolygon') return geometry.coordinates.some((polygon) => pointInPolygon(point, polygon))
  if (geometry.type === 'GeometryCollection') return geometry.geometries?.some((item) => geometryContainsPoint(item, point)) || false
  return false
}
const geoJsonContainsPlace = (geoJson, place) => {
  const lat = Number(place?.lat)
  const lng = Number(place?.lng)
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false
  const point = [lng, lat]
  if (geoJson?.type === 'FeatureCollection') {
    return geoJson.features?.some((feature) => geometryContainsPoint(feature.geometry, point)) || false
  }
  if (geoJson?.type === 'Feature') return geometryContainsPoint(geoJson.geometry, point)
  return geometryContainsPoint(geoJson, point)
}
const isPlaceInSupportedArea = async (place) => {
  if (!pointInMapBounds(place)) return false
  const boundary = await loadBoundaryGeoJson()
  return boundary ? geoJsonContainsPlace(boundary, place) : true
}
const setSelectedStart = async (place) => {
  startValidationMessage.value = ''
  const isSupported = await isPlaceInSupportedArea(place)
  if (!isSupported) {
    startValidationMessage.value = SUPPORTED_AREA_ERROR
    selectedStart.value = null
    selectedType.value = ''
    selectedSpecificDestination.value = null
    destinationSearchResults.value = []
    clearPlanOnly()
    maxReachableStep.value = 1
    return
  }
  if (!samePlace(selectedStart.value, place)) invalidateFromStartChange()
  selectedStart.value = place
  unlockStep(2)
  visibleStep.value = 2
  await nextTick()
  scrollTo(destinationSectionEl.value)
}

const routePlanEndpoint = () => ROUTE_SERVICE_URL
const placeSearchEndpoint = (text) => {
  const url = new URL(PLACE_SEARCH_URL, window.location.origin)
  url.searchParams.set('mode', 'text')
  url.searchParams.set('text', text)
  return url.toString()
}
const readJsonResponse = async (response) => {
  const text = await response.text()
  if (!text) return {}
  try {
    return JSON.parse(text)
  } catch {
    return { message: text }
  }
}
const inferDestinationType = (place) => {
  const source = [
    place?.type,
    ...(Array.isArray(place?.categories) ? place.categories : [])
  ].join(' ').toLowerCase()
  if (source.includes('pharmacy') || source.includes('chemist')) return 'pharmacy'
  if (source.includes('clinic') || source.includes('medical') || source.includes('doctor') || source.includes('dental')) return 'clinic'
  if (source.includes('grocery') || source.includes('supermarket')) return 'grocery'
  if (source.includes('cafe') || source.includes('coffee')) return 'cafe'
  if (source.includes('park') || source.includes('garden')) return 'park'
  return ''
}
const normalisePlaceSearchResults = (payload) => Array.isArray(payload?.places)
  ? payload.places
    .map((place, index) => {
      const lat = Number(place.lat ?? place.latitude)
      const lng = Number(place.lng ?? place.longitude)
      return {
        id: place.placeId || place.id || `${place.name || 'place'}-${lat}-${lng}-${index}`,
        placeId: place.placeId || place.id || null,
        name: place.name || 'Search result',
        address: place.address || place.formattedAddress || place.vicinity || '',
        type: inferDestinationType(place),
        categories: Array.isArray(place.categories) ? place.categories : [],
        lat,
        lng
      }
    })
    .filter((place) => Number.isFinite(place.lat) && Number.isFinite(place.lng))
  : []
const searchPlaces = async (query) => {
  const response = await fetch(placeSearchEndpoint(query))
  const payload = await readJsonResponse(response)
  if (!response.ok) {
    throw new Error(payload.error || payload.message || `Place search failed (${response.status})`)
  }
  return normalisePlaceSearchResults(payload)
}
let weatherRequestKey = ''
const weatherEndpoint = (place) => {
  const url = new URL('https://api.open-meteo.com/v1/forecast')
  url.searchParams.set('latitude', place.lat)
  url.searchParams.set('longitude', place.lng)
  url.searchParams.set('current', 'temperature_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m')
  url.searchParams.set('daily', 'weather_code,temperature_2m_max,precipitation_probability_max')
  url.searchParams.set('timezone', 'auto')
  return url.toString()
}
const loadWeatherForStart = async () => {
  const place = selectedStart.value
  if (!place?.lat || !place?.lng) return
  const requestKey = `${place.lat},${place.lng}`
  if (weatherRequestKey === requestKey && (weather.current || weather.isLoading)) return
  weatherRequestKey = requestKey
  weather.isLoading = true
  weather.error = ''
  try {
    const response = await fetch(weatherEndpoint(place))
    const payload = await readJsonResponse(response)
    if (!response.ok) throw new Error(payload.reason || payload.error || `Weather request failed (${response.status})`)
    weather.current = payload.current || null
    weather.daily = payload.daily || null
  } catch (error) {
    weather.current = null
    weather.daily = null
    weather.error = error instanceof Error ? error.message : 'Weather request failed.'
  } finally {
    weather.isLoading = false
  }
}
const addShoppingItem = () => {
  const text = shoppingInput.value.trim()
  if (!text) return
  shoppingItems.value.push({ id: `${Date.now()}-${Math.random().toString(16).slice(2)}`, text })
  shoppingInput.value = ''
}
const removeShoppingItem = (id) => {
  shoppingItems.value = shoppingItems.value.filter((item) => item.id !== id)
}
const normaliseBackendDestination = (destination, fallback = {}) => {
  const lat = Number(destination?.lat ?? destination?.latitude ?? fallback.lat)
  const lng = Number(destination?.lng ?? destination?.longitude ?? fallback.lng)
  const type = destination?.type || fallback.type || selectedType.value
  return {
    id: destination?.id || destination?.placeId || fallback.id || `${type || 'destination'}-${lat || 'lat'}-${lng || 'lng'}`,
    placeId: destination?.placeId || fallback.placeId || null,
    name: destination?.name || fallback.name || 'Recommended destination',
    type,
    address: destination?.address || destination?.vicinity || destination?.formatted || fallback.address || selectedTypeLabel.value,
    lat,
    lng
  }
}
const normaliseBackendFacilities = (facilities) => Array.isArray(facilities)
  ? facilities
    .map((item, index) => ({
      id: item.id || item.facilityId || `facility-${index}`,
      type: String(item.type || item.facility_type || item.category || 'facility').trim().toLowerCase(),
      name: item.name || item.label || item.type || 'Route facility',
      lat: Number(item.lat ?? item.latitude),
      lng: Number(item.lng ?? item.longitude),
      distanceMeters: Number.isFinite(Number(item.distanceMeters ?? item.distanceToRouteMeters)) ? Number(item.distanceMeters ?? item.distanceToRouteMeters) : null,
      conditionRating: Number.isFinite(Number(item.conditionRating)) ? Number(item.conditionRating) : null,
      wheelchair: item.wheelchair,
      lastUpdated: item.lastUpdated
    }))
    .filter((item) => Number.isFinite(item.lat) && Number.isFinite(item.lng))
  : []
const normaliseBackendRoute = (route) => Array.isArray(route)
  ? route
    .map((point) => Array.isArray(point) ? [Number(point[0]), Number(point[1])] : [Number(point.lng ?? point.longitude), Number(point.lat ?? point.latitude)])
    .filter(([lng, lat]) => Number.isFinite(lng) && Number.isFinite(lat))
  : []
const buildBackendComfortNotes = (facilities, routeSummary) => {
  const notes = []
  const benches = facilities.filter((item) => item.type === 'bench').length
  const toilets = facilities.filter((item) => item.type === 'toilet').length
  const fountains = facilities.filter((item) => item.type === 'drinking_fountain').length
  if (benches) notes.push(`${benches} rest stop${benches === 1 ? '' : 's'} along the route`)
  if (toilets) notes.push(`${toilets} toilet${toilets === 1 ? '' : 's'} nearby`)
  if (fountains) notes.push(`${fountains} drinking fountain${fountains === 1 ? '' : 's'} nearby`)
  if (!notes.length) notes.push('No route-support facilities returned nearby')
  const distance = Number(routeSummary?.walkingDistanceMeters)
  if (Number.isFinite(distance)) notes.push(`${formatDistance(distance)} backend walking route`)
  return notes
}
const buildBackendRecommendation = (payload, index = 0) => {
  const fallbackDestination = destinationMode.value === 'specific' ? selectedSpecificDestination.value : {}
  const destination = normaliseBackendDestination(payload.destination, fallbackDestination)
  const facilities = normaliseBackendFacilities(payload.facilities)
  const routeSummary = payload.routeSummary || {}
  const distanceMeters = Number(routeSummary.walkingDistanceMeters ?? destination.distanceMeters)
  const durationMinutes = Number(routeSummary.elderlyWalkingDurationMinutes ?? routeSummary.walkingDurationMinutes ?? (Number(routeSummary.walkingDurationSeconds) / 60))
  return {
    id: payload.optionId || destination.id || `route-option-${index + 1}`,
    optionId: payload.optionId ?? index + 1,
    destination,
    route: normaliseBackendRoute(payload.route),
    facilities,
    facilitySummary: payload.facilitySummary || {},
    metrics: {
      distanceMeters: Number.isFinite(distanceMeters) ? distanceMeters : null,
      durationMinutes: Number.isFinite(durationMinutes) ? durationMinutes : null
    },
    score: Number.isFinite(Number(payload.score)) ? Number(payload.score) : null,
    scoreBreakdown: payload.scoreBreakdown || {},
    comfortNotes: buildBackendComfortNotes(facilities, routeSummary),
    instructions: []
  }
}
const buildRecommendationsFromPayload = (payload) => {
  if (DEBUG_PLANNER) {
    console.info('[Shadeo route response]', {
      mode: payload?.mode,
      eligible: payload?.eligible,
      optionCount: Array.isArray(payload?.options) ? payload.options.length : null,
      routeLength: Array.isArray(payload?.route) ? payload.route.length : null,
      optionRouteLengths: Array.isArray(payload?.options) ? payload.options.map((option) => option?.route?.length || 0) : []
    })
  }
  if (payload?.eligible === false) return []
  if (Array.isArray(payload?.options)) {
    return payload.options
      .filter((option) => option?.eligible !== false)
      .map((option, index) => buildBackendRecommendation(option, index))
      .filter((option) => option.destination && option.route.length > 1)
  }
  if (payload?.destination) return [buildBackendRecommendation(payload, 0)].filter((option) => option.route.length > 1)
  return []
}
const fetchBackendPlan = async () => {
  const start = {
    name: selectedStart.value.name,
    lat: selectedStart.value.lat,
    lng: selectedStart.value.lng
  }
  const body = destinationMode.value === 'specific'
    ? {
        mode: 'custom_destination',
        start,
        destination: {
          name: selectedSpecificDestination.value.name,
          lat: selectedSpecificDestination.value.lat,
          lng: selectedSpecificDestination.value.lng
        }
      }
    : {
        mode: 'destination_type',
        start,
        destinationType: selectedType.value
      }
  const response = await fetch(routePlanEndpoint(), {
    method: 'POST',
    body: JSON.stringify(body)
  })
  const payload = await readJsonResponse(response)
  if (!response.ok) {
    throw new Error(payload.error || payload.message || `Route planner request failed (${response.status})`)
  }
  return payload
}

const useMyLocation = async () => {
  startMode.value = 'current'
  startValidationMessage.value = ''
  if (!navigator.geolocation) {
    startValidationMessage.value = 'Current location is not available in this browser. Please search for a starting point.'
    return
  }
  isLocating.value = true
  try {
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      })
    })
    await setSelectedStart({
      id: 'current-location',
      name: 'Current location',
      address: 'Detected by your browser',
      lat: position.coords.latitude,
      lng: position.coords.longitude
    })
    startSearchResults.value = []
  } catch {
    startValidationMessage.value = 'Current location could not be detected. Please search for a starting point.'
  } finally {
    isLocating.value = false
  }
}
const runStartSearch = async () => {
  if (!startQuery.value) return
  isSearchingStart.value = true
  startValidationMessage.value = ''
  try {
    startSearchResults.value = await searchPlaces(startQuery.value)
    if (!startSearchResults.value.length) startValidationMessage.value = 'No matching places were returned. Try a more specific address or landmark.'
  } catch (error) {
    startSearchResults.value = []
    startValidationMessage.value = error instanceof Error ? error.message : 'Place search failed.'
  } finally {
    isSearchingStart.value = false
  }
}
const selectStartPlace = async (place) => {
  await setSelectedStart(place)
}
const setDestinationMode = (mode) => {
  if (destinationMode.value === mode) return
  destinationMode.value = mode
  destinationValidationMessage.value = ''
  selectedSpecificDestination.value = null
  destinationSearchResults.value = []
  selectedType.value = ''
  invalidateFromDestinationChange()
}
const chooseDestinationType = (id) => {
  if (selectedType.value === id && destinationMode.value === 'category') return
  destinationValidationMessage.value = ''
  selectedType.value = id
  selectedSpecificDestination.value = null
  invalidateFromDestinationChange()
}
const runDestinationSearch = async () => {
  if (!destinationQuery.value) return
  isSearchingDestination.value = true
  destinationValidationMessage.value = ''
  try {
    destinationSearchResults.value = await searchPlaces(destinationQuery.value)
    if (!destinationSearchResults.value.length) destinationValidationMessage.value = 'No matching destinations were returned. Try a more specific place name.'
  } catch (error) {
    destinationSearchResults.value = []
    destinationValidationMessage.value = error instanceof Error ? error.message : 'Destination search failed.'
  } finally {
    isSearchingDestination.value = false
  }
}
const selectSpecificDestination = async (place) => {
  if (samePlace(selectedSpecificDestination.value, place)) return
  destinationValidationMessage.value = ''
  const isSupported = await isPlaceInSupportedArea(place)
  if (!isSupported) {
    destinationValidationMessage.value = SUPPORTED_AREA_ERROR
    selectedSpecificDestination.value = null
    selectedType.value = ''
    invalidateFromDestinationChange()
    return
  }
  selectedSpecificDestination.value = place
  selectedType.value = place.type || ''
  invalidateFromDestinationChange()
}

const clearPlanOnly = () => {
  canopyRequestId += 1
  hasSearched.value = false
  recommendations.value = []
  highlightedRecommendationId.value = ''
  planError.value = ''
  Object.assign(result, {
    destination: null,
    facilities: [],
    route: [],
    metrics: { distanceMeters: null, durationMinutes: null },
    score: null,
    scoreBreakdown: {},
    facilitySummary: {},
    canopy: null,
    comfortNotes: [],
    instructions: []
  })
  stopRouteDashAnimation()
  destroyMiniMap()
}

const requestPlan = async () => {
  if (!canFindRecommendations.value) return
  startValidationMessage.value = ''
  destinationValidationMessage.value = ''
  if (!await isPlaceInSupportedArea(selectedStart.value)) {
    startValidationMessage.value = SUPPORTED_AREA_ERROR
    visibleStep.value = 1
    lockAfterStep(1)
    return
  }
  if (destinationMode.value === 'specific' && !await isPlaceInSupportedArea(selectedSpecificDestination.value)) {
    destinationValidationMessage.value = SUPPORTED_AREA_ERROR
    lockAfterStep(2)
    return
  }
  clearPlanOnly()
  unlockStep(3)
  visibleStep.value = 3
  isLoadingPlan.value = true
  hasSearched.value = true
  try {
    const payload = await fetchBackendPlan()
    if (payload?.eligible === false) {
      planError.value = payload.message || 'This route is outside the supported walking range.'
      recommendations.value = []
    } else {
      const backendRecommendations = buildRecommendationsFromPayload(payload)
      const supportedRecommendations = []
      for (const recommendation of backendRecommendations) {
        if (await isPlaceInSupportedArea(recommendation.destination)) supportedRecommendations.push(recommendation)
      }
      if (!supportedRecommendations.length) {
        planError.value = payload.message || 'No suitable route option was returned.'
      }
      recommendations.value = supportedRecommendations
    }
  } catch (error) {
    planError.value = error instanceof Error ? error.message : 'Route planner request failed.'
    recommendations.value = []
  } finally {
    isLoadingPlan.value = false
  }
  await nextTick()
  drawMiniMap()
  scrollTo(resultsSectionEl.value)
}
const normaliseCanopyGeoJson = (payload) => {
  if (payload?.type !== 'FeatureCollection' || !Array.isArray(payload.features)) return emptyFeatureCollection()
  return {
    type: 'FeatureCollection',
    features: payload.features.filter((feature) => feature?.type === 'Feature' && feature.geometry)
  }
}
let canopyRequestId = 0
const loadCanopyForRoute = async (route) => {
  const routePoints = normaliseBackendRoute(route)
  const requestId = ++canopyRequestId
  result.canopy = null
  if (routePoints.length < 2) return
  try {
    const response = await fetch(CANOPY_QUERY_URL, {
      method: 'POST',
      body: JSON.stringify({ routePoints })
    })
    const payload = await readJsonResponse(response)
    if (!response.ok) throw new Error(payload.error || payload.message || `Canopy request failed (${response.status})`)
    if (requestId === canopyRequestId) {
      result.canopy = normaliseCanopyGeoJson(payload)
      if (DEBUG_PLANNER) console.info('[Shadeo canopy response]', { featureCount: result.canopy.features.length })
      if (map) requestAnimationFrame(() => drawRouteMap())
    }
  } catch {
    if (requestId === canopyRequestId) {
      result.canopy = emptyFeatureCollection()
      if (DEBUG_PLANNER) console.info('[Shadeo canopy unavailable]')
      if (map) requestAnimationFrame(() => drawRouteMap())
    }
  }
}
const applySelectedRecommendation = (recommendation) => {
  if (!recommendation) canopyRequestId += 1
  Object.assign(result, {
    destination: recommendation?.destination || null,
    facilities: recommendation?.facilities || [],
    route: recommendation?.route || [],
    metrics: recommendation?.metrics || { distanceMeters: null, durationMinutes: null },
    score: recommendation?.score ?? null,
    scoreBreakdown: recommendation?.scoreBreakdown || {},
    facilitySummary: recommendation?.facilitySummary || {},
    canopy: null,
    comfortNotes: recommendation?.comfortNotes || [],
    instructions: recommendation?.instructions || []
  })
}
const selectRecommendation = async (recommendation) => {
  if (DEBUG_PLANNER) {
    console.info('[Shadeo selected route]', {
      id: recommendation?.id,
      destination: recommendation?.destination?.name,
      routeLength: recommendation?.route?.length || 0,
      first: recommendation?.route?.[0],
      last: recommendation?.route?.at?.(-1)
    })
  }
  applySelectedRecommendation(recommendation)
  highlightedRecommendationId.value = recommendation?.id || ''
  unlockStep(4)
  destroyMiniMap()
  await nextTick()
  drawMiniMap()
  loadCanopyForRoute(recommendation?.route || [])
  scrollTo(resultsSectionEl.value)
}
const backToRecommendations = async () => {
  applySelectedRecommendation(null)
  lockAfterStep(3)
  visibleStep.value = 3
  destroyMiniMap()
  await nextTick()
  drawMiniMap()
}
const highlightRecommendation = async (recommendation) => {
  highlightedRecommendationId.value = recommendation?.id || ''
  await nextTick()
  drawMiniMap()
}

const loadBoundaryGeoJson = async () => {
  if (!boundaryGeoJsonPromise) {
    boundaryGeoJsonPromise = fetch(MUNICIPAL_BOUNDARY_URL)
      .then((response) => {
        if (!response.ok) throw new Error(`Boundary GeoJSON failed (${response.status})`)
        return response.json()
      })
      .catch(() => null)
  }
  return boundaryGeoJsonPromise
}
const startMarkerHtml = (label = 'You') => (
  '<div class="rv-pin-start">' +
  '<svg width="16" height="16" viewBox="0 0 24 24" fill="white">' +
  '<circle cx="12" cy="4" r="2.5"/>' +
  '<path d="M10 8.5c-1.1 0-2 .9-2 2v4h2v5h4v-5h2v-4c0-1.1-.9-2-2-2h-4z"/>' +
  '</svg></div>' +
  `<div class="rv-pin-label rv-pin-label-start">${label}</div>`
)
const destinationMarkerHtml = (label = selectedTypeLabel.value) => (
  '<div class="rv-pin-dest">' +
  `<img src="${selectedTypeIconUrl.value}" width="22" height="22" style="filter:invert(1)"/>` +
  '</div>' +
  `<div class="rv-pin-label rv-pin-label-dest">${label}</div>`
)
const facilityMarkerHtml = (item) => {
  if (item.type === 'bench') {
    return `<div class="rv-pin-fac rv-pin-fac-compact rv-pin-bench"><img src="${benchIcon}" width="14" height="14" style="filter:invert(1)"/></div>`
  }
  if (item.type === 'toilet') {
    return `<div class="rv-pin-fac rv-pin-fac-compact rv-pin-toilet"><img src="${toiletIcon}" width="14" height="14" style="filter:invert(1)"/></div>`
  }
  if (item.type === 'drinking_fountain') {
    return `<div class="rv-pin-fac rv-pin-fac-compact rv-pin-fountain"><img src="${fountainIcon}" width="14" height="14" style="filter:invert(1)"/></div>`
  }
  return ''
}

const absoluteMapAssetUrl = (url) => {
  if (/^(https?:)?\/\//i.test(url) || url.startsWith('data:')) return url
  const prefix = url.startsWith('/') ? '' : '/'
  return `${window.location.origin}${prefix}${url}`
}
const loadMapStyle = async () => {
  if (!mapStylePromise) {
    mapStylePromise = fetch(MAP_STYLE_URL)
      .then((response) => {
        if (!response.ok) throw new Error(`Map style failed (${response.status})`)
        return response.json()
      })
      .then((style) => ({
        ...style,
        glyphs: absoluteMapAssetUrl(MAP_GLYPHS_URL),
        sprite: absoluteMapAssetUrl(MAP_SPRITE_URL),
        sources: {
          ...style.sources,
          openmaptiles: {
            type: 'vector',
            url: `pmtiles://${PMTILES_URL}`,
            minzoom: 0,
            maxzoom: PMTILES_MAX_DATA_ZOOM,
            bounds: [144.266, -38.552, 145.81, -37.365]
          }
        }
      }))
  }
  return mapStylePromise
}
const mapMaxBounds = () => [[MAP_VIEW_BOUNDS[0][1], MAP_VIEW_BOUNDS[0][0]], [MAP_VIEW_BOUNDS[1][1], MAP_VIEW_BOUNDS[1][0]]]
const emptyFeatureCollection = () => ({ type: 'FeatureCollection', features: [] })
const routeFeatureCollection = (lngLatLine) => ({
  type: 'FeatureCollection',
  features: lngLatLine.length > 1
    ? [{
        type: 'Feature',
        properties: {},
        geometry: { type: 'LineString', coordinates: lngLatLine }
      }]
    : []
})
const toRadians = (degrees) => degrees * Math.PI / 180
const distanceBetweenLngLat = ([lng1, lat1], [lng2, lat2]) => {
  const radius = 6371000
  const dLat = toRadians(lat2 - lat1)
  const dLng = toRadians(lng2 - lng1)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) ** 2
  return radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}
const normaliseRouteDirection = (line) => {
  const start = selectedStart.value || DEFAULT_MAP_CENTER
  if (line.length < 2 || start?.lng == null || start?.lat == null) return line
  const startPoint = [start.lng, start.lat]
  const distanceToFirst = distanceBetweenLngLat(startPoint, line[0])
  const distanceToLast = distanceBetweenLngLat(startPoint, line[line.length - 1])
  return distanceToLast < distanceToFirst ? [...line].reverse() : line
}
const routeConnectorFeatureCollection = () => {
  const features = []
  if (result.route.length > 1) {
    const start = selectedStart.value || DEFAULT_MAP_CENTER
    const directedRoute = normaliseRouteDirection(result.route.map(([lng, lat]) => [lng, lat]))
    const routeStart = directedRoute[0]
    const routeEnd = directedRoute[directedRoute.length - 1]
    if (Number.isFinite(start.lng) && Number.isFinite(start.lat)) {
      features.push({
        type: 'Feature',
        properties: { role: 'start' },
        geometry: { type: 'LineString', coordinates: [[start.lng, start.lat], routeStart] }
      })
    }
    if (result.destination?.lng != null && result.destination?.lat != null) {
      features.push({
        type: 'Feature',
        properties: { role: 'destination' },
        geometry: { type: 'LineString', coordinates: [routeEnd, [result.destination.lng, result.destination.lat]] }
      })
    }
  }
  return { type: 'FeatureCollection', features }
}
const interpolateLngLat = ([lng1, lat1], [lng2, lat2], ratio) => [
  lng1 + (lng2 - lng1) * ratio,
  lat1 + (lat2 - lat1) * ratio
]
const routeLengthMeters = (line) => line.slice(1).reduce((total, point, index) => total + distanceBetweenLngLat(line[index], point), 0)
const routeSegmentBetween = (line, startMeters, endMeters) => {
  const segment = []
  let walked = 0
  for (let index = 1; index < line.length; index += 1) {
    const from = line[index - 1]
    const to = line[index]
    const distance = distanceBetweenLngLat(from, to)
    const segmentStart = walked
    const segmentEnd = walked + distance

    if (segmentEnd >= startMeters && segmentStart <= endMeters && distance > 0) {
      const localStart = Math.max(startMeters, segmentStart)
      const localEnd = Math.min(endMeters, segmentEnd)
      const startPoint = interpolateLngLat(from, to, (localStart - segmentStart) / distance)
      const endPoint = interpolateLngLat(from, to, (localEnd - segmentStart) / distance)
      if (!segment.length) segment.push(startPoint)
      segment.push(endPoint)
    }
    walked = segmentEnd
    if (walked > endMeters) break
  }
  return segment.length > 1 ? segment : null
}
const routeDashFeatureCollection = (line, offsetMeters = 0) => {
  const dashMeters = 11
  const gapMeters = 12
  const cycleMeters = dashMeters + gapMeters
  const totalMeters = routeLengthMeters(line)
  if (line.length < 2 || totalMeters <= 0) return emptyFeatureCollection()

  const features = []
  for (let cursor = offsetMeters - cycleMeters; cursor < totalMeters; cursor += cycleMeters) {
    const start = Math.max(0, cursor)
    const end = Math.min(totalMeters, cursor + dashMeters)
    if (end <= 0 || end <= start) continue
    const segment = routeSegmentBetween(line, start, end)
    if (segment) {
      features.push({
        type: 'Feature',
        properties: {},
        geometry: { type: 'LineString', coordinates: segment }
      })
    }
  }
  return { type: 'FeatureCollection', features }
}
const ensureGeoJsonSource = (targetMap, sourceId) => {
  if (!targetMap.getSource(sourceId)) {
    targetMap.addSource(sourceId, { type: 'geojson', data: emptyFeatureCollection() })
  }
  return targetMap.getSource(sourceId)
}
const ensureRouteLayers = (targetMap, sourceId) => {
  ensureGeoJsonSource(targetMap, sourceId)
  ensureGeoJsonSource(targetMap, `${sourceId}-flow`)
  ensureGeoJsonSource(targetMap, `${sourceId}-connectors`)
  if (!targetMap.getLayer(`${sourceId}-halo`)) {
    targetMap.addLayer({
      id: `${sourceId}-halo`,
      type: 'line',
      source: sourceId,
      paint: {
        'line-color': '#e8efe6',
        'line-width': ['interpolate', ['linear'], ['zoom'], 12, 8, 18, 13],
        'line-opacity': 0.92
      },
      layout: { 'line-cap': 'round', 'line-join': 'round' }
    })
  }
  if (!targetMap.getLayer(`${sourceId}-line`)) {
    targetMap.addLayer({
      id: `${sourceId}-line`,
      type: 'line',
      source: sourceId,
      paint: {
        'line-color': '#b9d7b3',
        'line-width': ['interpolate', ['linear'], ['zoom'], 12, 5, 18, 8],
        'line-opacity': 0.82
      },
      layout: { 'line-cap': 'round', 'line-join': 'round' }
    })
  }
  if (!targetMap.getLayer(`${sourceId}-flow-line`)) {
    targetMap.addLayer({
      id: `${sourceId}-flow-line`,
      type: 'line',
      source: `${sourceId}-flow`,
      paint: {
        'line-color': '#34a853',
        'line-width': ['interpolate', ['linear'], ['zoom'], 12, 3, 18, 5],
        'line-opacity': 0.96
      },
      layout: { 'line-cap': 'round', 'line-join': 'round' }
    })
  }
  if (!targetMap.getLayer(`${sourceId}-connectors-line`)) {
    targetMap.addLayer({
      id: `${sourceId}-connectors-line`,
      type: 'line',
      source: `${sourceId}-connectors`,
      paint: {
        'line-color': '#1b7f3a',
        'line-width': ['interpolate', ['linear'], ['zoom'], 12, 3, 18, 5],
        'line-opacity': 0.9,
        'line-dasharray': [1.2, 1.6]
      },
      layout: { 'line-cap': 'round', 'line-join': 'round' }
    })
  }
}
const startRouteDashAnimation = () => {
  if (routeDashFrame) return
  const tick = () => {
    const line = result.route.length > 1 ? normaliseRouteDirection(result.route.map(([lng, lat]) => [lng, lat])) : []
    const flowData = routeDashFeatureCollection(line, routeDashOffset)
    if (miniMap?.getSource('planner-mini-route-flow')) {
      miniMap.getSource('planner-mini-route-flow').setData(flowData)
    }
    if (map?.getSource('planner-route-flow')) {
      map.getSource('planner-route-flow').setData(flowData)
    }
    routeDashOffset = (routeDashOffset + 1.6) % 23
    routeDashFrame = window.setTimeout(tick, 80)
  }
  tick()
}
const stopRouteDashAnimation = () => {
  if (!routeDashFrame) return
  window.clearTimeout(routeDashFrame)
  routeDashFrame = null
}
const moveBoundaryLayersToTop = (targetMap) => {
  ;['planner-boundary-fill', 'planner-boundary-halo', 'planner-boundary-line'].forEach((layerId) => {
    if (targetMap.getLayer(layerId)) targetMap.moveLayer(layerId)
  })
}
const addBoundaryLayer = async (targetMap) => {
  if (!targetMap) return
  if (!targetMap.isStyleLoaded()) {
    targetMap.once('idle', () => addBoundaryLayer(targetMap))
    return
  }
  const boundary = await loadBoundaryGeoJson()
  if (!boundary || !targetMap?.isStyleLoaded()) return
  if (!targetMap.getSource('planner-boundary')) {
    targetMap.addSource('planner-boundary', { type: 'geojson', data: boundary })
  }
  if (!targetMap.getLayer('planner-boundary-fill')) {
    targetMap.addLayer({
      id: 'planner-boundary-fill',
      type: 'fill',
      source: 'planner-boundary',
      paint: {
        'fill-color': '#74b86f',
        'fill-opacity': 0.07
      }
    })
  }
  if (!targetMap.getLayer('planner-boundary-halo')) {
    targetMap.addLayer({
      id: 'planner-boundary-halo',
      type: 'line',
      source: 'planner-boundary',
      paint: {
        'line-color': '#ffffff',
        'line-width': 9,
        'line-opacity': 0.9
      },
      layout: { 'line-cap': 'round', 'line-join': 'round' }
    })
  }
  if (!targetMap.getLayer('planner-boundary-line')) {
    targetMap.addLayer({
      id: 'planner-boundary-line',
      type: 'line',
      source: 'planner-boundary',
      paint: {
        'line-color': '#155d25',
        'line-width': 5,
        'line-opacity': 0.98
      },
      layout: { 'line-cap': 'round', 'line-join': 'round' }
    })
  }
  moveBoundaryLayersToTop(targetMap)
}
const createPlannerMap = async (container, options = {}) => {
  const style = await loadMapStyle()
  const targetMap = new maplibregl.Map({
    container,
    style,
    center: [DEFAULT_MAP_CENTER.lng, DEFAULT_MAP_CENTER.lat],
    zoom: options.zoom || 13,
    minZoom: MAP_MIN_ZOOM,
    maxZoom: MAP_MAX_ZOOM,
    maxBounds: mapMaxBounds(),
    attributionControl: true,
    scrollZoom: options.scrollZoom ?? false,
    dragRotate: false,
    pitchWithRotate: false
  })
  targetMap.touchZoomRotate.disableRotation()
  targetMap.on('load', () => {
    addBoundaryLayer(targetMap)
    options.onLoad?.()
  })
  return targetMap
}
const clearMarkers = (markers) => {
  markers.splice(0).forEach((marker) => marker.remove())
}
const addHtmlMarker = (targetMap, markers, lngLat, html, options = {}) => {
  const el = document.createElement('div')
  el.className = 'planner-maplibre-marker'
  el.innerHTML = html
  const marker = new maplibregl.Marker({
    element: el,
    anchor: options.anchor || 'bottom',
    offset: options.offset || [0, 0]
  })
    .setLngLat(lngLat)
    .addTo(targetMap)
  if (options.title) marker.getElement().title = options.title
  markers.push(marker)
}
const facilityFeatureCollection = () => ({
  type: 'FeatureCollection',
  features: result.facilities
    .filter((item) => item.lat != null && item.lng != null)
    .map((item) => ({
      type: 'Feature',
      properties: {
        type: item.type,
        name: item.name || item.type
      },
      geometry: {
        type: 'Point',
        coordinates: [item.lng, item.lat]
      }
    }))
})
const ensureFacilityLayers = (targetMap, sourceId) => {
  ensureGeoJsonSource(targetMap, sourceId)
  if (!targetMap.getLayer(`${sourceId}-shadow`)) {
    targetMap.addLayer({
      id: `${sourceId}-shadow`,
      type: 'circle',
      source: sourceId,
      paint: {
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 12, 6, 18, 9],
        'circle-color': 'rgba(16, 33, 22, 0.22)',
        'circle-blur': 0.65,
        'circle-translate': [1, 2]
      }
    })
  }
  if (!targetMap.getLayer(`${sourceId}-circle`)) {
    targetMap.addLayer({
      id: `${sourceId}-circle`,
      type: 'circle',
      source: sourceId,
      paint: {
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 12, 7, 18, 11],
        'circle-color': [
          'match',
          ['get', 'type'],
          'bench', '#7cb342',
          'toilet', '#2196f3',
          'drinking_fountain', '#00bcd4',
          '#7cb342'
        ],
        'circle-stroke-color': [
          'match',
          ['get', 'type'],
          'bench', '#558b2f',
          'toilet', '#1565c0',
          'drinking_fountain', '#0097a7',
          '#558b2f'
        ],
        'circle-stroke-width': 2,
        'circle-opacity': 0.95
      }
    })
  }
  if (!targetMap.getLayer(`${sourceId}-icon`)) {
    targetMap.addLayer({
      id: `${sourceId}-icon`,
      type: 'symbol',
      source: sourceId,
      layout: {
        'text-field': [
          'match',
          ['get', 'type'],
          'bench', 'B',
          'toilet', 'T',
          'drinking_fountain', 'W',
          'F'
        ],
        'text-size': ['interpolate', ['linear'], ['zoom'], 12, 9, 18, 12],
        'text-font': ['Noto Sans Bold'],
        'text-allow-overlap': true,
        'text-ignore-placement': true
      },
      paint: {
        'text-color': '#ffffff',
        'text-halo-color': 'rgba(0, 0, 0, 0.16)',
        'text-halo-width': 0.6
      }
    })
  }
}
const drawFacilityLayer = (targetMap, sourceId) => {
  if (!targetMap?.isStyleLoaded()) return
  ensureFacilityLayers(targetMap, sourceId)
  targetMap.getSource(sourceId)?.setData(facilityFeatureCollection())
}
const moveRouteLayersToTop = (targetMap, sourceId) => {
  ;[`${sourceId}-connectors-line`, `${sourceId}-halo`, `${sourceId}-line`, `${sourceId}-flow-line`].forEach((layerId) => {
    if (targetMap.getLayer(layerId)) targetMap.moveLayer(layerId)
  })
}
const moveCanopyLayersBelowRoute = (targetMap, sourceId) => {
  const beforeLayer = targetMap.getLayer('planner-route-halo')
    ? 'planner-route-halo'
    : targetMap.getLayer('planner-boundary-line')
      ? 'planner-boundary-line'
      : undefined
  ;[`${sourceId}-fill`, `${sourceId}-line`].forEach((layerId) => {
    if (targetMap.getLayer(layerId)) targetMap.moveLayer(layerId, beforeLayer)
  })
}
const moveFacilityLayersToTop = (targetMap, sourceId) => {
  ;[`${sourceId}-shadow`, `${sourceId}-circle`, `${sourceId}-icon`].forEach((layerId) => {
    if (targetMap.getLayer(layerId)) targetMap.moveLayer(layerId)
  })
}
const canopyFeatureCollection = () => result.canopy || emptyFeatureCollection()
const ensureCanopyLayers = (targetMap, sourceId) => {
  ensureGeoJsonSource(targetMap, sourceId)
  if (!targetMap.getLayer(`${sourceId}-fill`)) {
    targetMap.addLayer({
      id: `${sourceId}-fill`,
      type: 'fill',
      source: sourceId,
      paint: {
        'fill-color': '#7fc97a',
        'fill-opacity': 0.36
      }
    })
  }
  if (!targetMap.getLayer(`${sourceId}-line`)) {
    targetMap.addLayer({
      id: `${sourceId}-line`,
      type: 'line',
      source: sourceId,
      paint: {
        'line-color': '#2f7d3f',
        'line-width': 1.2,
        'line-opacity': 0.55
      },
      layout: { 'line-cap': 'round', 'line-join': 'round' }
    })
  }
}
const drawCanopyLayer = (targetMap, sourceId) => {
  if (!targetMap?.getStyle()) return
  try {
    ensureCanopyLayers(targetMap, sourceId)
    const canopyData = canopyFeatureCollection()
    targetMap.getSource(sourceId)?.setData(canopyData)
    moveCanopyLayersBelowRoute(targetMap, sourceId)
    if (DEBUG_PLANNER) {
      console.info('[Shadeo draw canopy]', {
        featureCount: canopyData.features.length,
        styleLoaded: targetMap.isStyleLoaded(),
        sourceExists: !!targetMap.getSource(sourceId),
        layers: ['fill', 'line'].map((suffix) => ({
          id: `${sourceId}-${suffix}`,
          exists: !!targetMap.getLayer(`${sourceId}-${suffix}`)
        }))
      })
    }
  } catch (error) {
    console.error('[Shadeo draw canopy failed]', error)
  }
}
const fitMapToPoints = (targetMap, lngLatPoints, padding) => {
  if (!targetMap || !lngLatPoints.length) return
  const bounds = lngLatPoints.reduce(
    (mapBounds, point) => mapBounds.extend(point),
    new maplibregl.LngLatBounds(lngLatPoints[0], lngLatPoints[0])
  )
  targetMap.fitBounds(bounds, { padding, maxZoom: MAP_MAX_ZOOM, duration: 0 })
}
const drawRouteLine = (targetMap, sourceId, lngLatLine) => {
  if (DEBUG_PLANNER && sourceId === 'planner-route') {
    console.info('[Shadeo draw route start]', {
      pointCount: lngLatLine.length,
      styleLoaded: !!targetMap?.isStyleLoaded(),
      first: lngLatLine[0],
      last: lngLatLine.at?.(-1)
    })
  }
  if (!targetMap?.getStyle()) return
  try {
    ensureRouteLayers(targetMap, sourceId)
    const routeData = routeFeatureCollection(lngLatLine)
    targetMap.getSource(sourceId)?.setData(routeData)
    targetMap.getSource(`${sourceId}-flow`)?.setData(routeDashFeatureCollection(lngLatLine, routeDashOffset))
    targetMap.getSource(`${sourceId}-connectors`)?.setData(routeConnectorFeatureCollection())
    if (DEBUG_PLANNER && sourceId === 'planner-route') {
      console.info('[Shadeo draw route]', {
        pointCount: lngLatLine.length,
        featureCount: routeData.features.length,
        first: lngLatLine[0],
        last: lngLatLine.at?.(-1),
        sourceExists: !!targetMap.getSource(sourceId),
        flowSourceExists: !!targetMap.getSource(`${sourceId}-flow`),
        connectorSourceExists: !!targetMap.getSource(`${sourceId}-connectors`),
        renderedFeatureCount: targetMap.querySourceFeatures(sourceId).length,
        mapCenter: targetMap.getCenter().toArray(),
        zoom: targetMap.getZoom(),
        paint: targetMap.getLayer(`${sourceId}-line`) ? {
          color: targetMap.getPaintProperty(`${sourceId}-line`, 'line-color'),
          width: targetMap.getPaintProperty(`${sourceId}-line`, 'line-width'),
          opacity: targetMap.getPaintProperty(`${sourceId}-line`, 'line-opacity')
        } : null,
        layoutVisibility: targetMap.getLayer(`${sourceId}-line`)
          ? targetMap.getLayoutProperty(`${sourceId}-line`, 'visibility') || 'visible'
          : null,
        layers: ['halo', 'line', 'flow-line', 'connectors-line'].map((suffix) => ({
          id: `${sourceId}-${suffix}`,
          exists: !!targetMap.getLayer(`${sourceId}-${suffix}`)
        }))
      })
    }
  } catch (error) {
    console.error('[Shadeo draw route failed]', error)
    return
  }
  moveBoundaryLayersToTop(targetMap)
  moveRouteLayersToTop(targetMap, sourceId)
  if (lngLatLine.length > 1) {
    startRouteDashAnimation()
  } else {
    targetMap.getSource(`${sourceId}-flow`)?.setData(emptyFeatureCollection())
  }
}
const drawMarkerSet = (targetMap, markers, lngLatBounds, includeFacilities = false) => {
  if (!targetMap) return
  clearMarkers(markers)
  const start = selectedStart.value || DEFAULT_MAP_CENTER
  addHtmlMarker(
    targetMap,
    markers,
    [start.lng, start.lat],
    includeFacilities ? startMarkerHtml() : '<div class="rv-pin-start"></div><div class="rv-pin-label rv-pin-label-start">Start</div>'
  )
  lngLatBounds.push([start.lng, start.lat])

  const destinations = hasDestination.value ? [result] : recommendations.value
  destinations.forEach((item, index) => {
    const destination = item.destination
    const isHighlighted = !hasDestination.value && highlightedRecommendationId.value === item.id
    const pinClass = isHighlighted ? 'rv-pin-dest is-highlighted' : 'rv-pin-dest'
    const destHtml = hasDestination.value
      ? destinationMarkerHtml(selectedTypeLabel.value)
      : `<div class="${pinClass}">${index + 1}</div><div class="rv-pin-label rv-pin-label-dest">${destination.name}</div>`
    addHtmlMarker(targetMap, markers, [destination.lng, destination.lat], destHtml)
    lngLatBounds.push([destination.lng, destination.lat])
  })

  if (!includeFacilities) return
  const facilitySourceId = targetMap === miniMap ? 'planner-mini-facilities' : 'planner-facilities'
  drawFacilityLayer(targetMap, facilitySourceId)
  moveBoundaryLayersToTop(targetMap)
  moveFacilityLayersToTop(targetMap, facilitySourceId)
  result.facilities.forEach((item) => {
    if (item.lat == null || item.lng == null) return
    const html = facilityMarkerHtml(item)
    if (html) addHtmlMarker(targetMap, markers, [item.lng, item.lat], html, { anchor: 'center', title: item.name })
    lngLatBounds.push([item.lng, item.lat])
  })
}
const ensureMiniMap = async () => {
  if (miniMap || !miniMapEl.value) return
  miniMap = await createPlannerMap(miniMapEl.value, { zoom: 13, onLoad: drawMiniMap })
  miniMap.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')
}
const drawMiniMap = async () => {
  if (!recommendations.value.length && !hasDestination.value) return
  await ensureMiniMap()
  if (!miniMap?.isStyleLoaded()) return
  const lngLatBounds = []
  drawMarkerSet(miniMap, miniMapMarkers, lngLatBounds, false)
  fitMapToPoints(miniMap, lngLatBounds, 34)
  requestAnimationFrame(() => miniMap?.resize())
}
const destroyMiniMap = () => {
  clearMarkers(miniMapMarkers)
  miniMap?.remove()
  miniMap = null
}
const ensureMap = async () => {
  if (map || !mapEl.value) return
  const start = selectedStart.value || DEFAULT_MAP_CENTER
  map = await createPlannerMap(mapEl.value, { zoom: 14, scrollZoom: true, onLoad: drawRouteMap })
  map.setCenter([start.lng, start.lat])
  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right')
}
const drawRouteMap = async () => {
  await ensureMap()
  if (!map) return
  if (DEBUG_PLANNER) {
    console.info('[Shadeo draw route map entry]', {
      hasMapElement: !!mapEl.value,
      styleLoaded: map.isStyleLoaded(),
      routeLength: result.route.length,
      destination: result.destination?.name
    })
  }
  if (!map.isStyleLoaded()) {
    map.once('load', () => drawRouteMap())
    map.once('idle', () => drawRouteMap())
    return
  }
  const lngLatBounds = []
  let line = []
  try {
    line = result.route.length > 1
      ? normaliseRouteDirection(result.route.map(([lng, lat]) => [lng, lat]))
      : []
  } catch (error) {
    console.error('[Shadeo route normalise failed]', error)
    line = []
  }
  drawRouteLine(map, 'planner-route', line)
  if (line.length) lngLatBounds.push(...line)
  try {
    drawCanopyLayer(map, 'planner-canopy')
    moveRouteLayersToTop(map, 'planner-route')
  } catch (error) {
    console.error('[Shadeo draw canopy failed]', error)
  }
  try {
    drawMarkerSet(map, routeMapMarkers, lngLatBounds, true)
  } catch (error) {
    console.error('[Shadeo draw markers failed]', error)
  }
  fitMapToPoints(map, lngLatBounds, 48)
  requestAnimationFrame(() => map?.resize())
}

const openReadinessCheck = () => {
  if (!hasDestination.value) return
  unlockStep(4)
  isReadinessOpen.value = true
  loadWeatherForStart()
}
const closeReadinessToResults = async () => {
  isReadinessOpen.value = false
  visibleStep.value = 3
  await nextTick()
  drawMiniMap()
  requestAnimationFrame(() => {
    miniMap?.resize()
    drawMiniMap()
  })
  scrollTo(resultsSectionEl.value)
}
const confirmReadyToGo = async () => {
  if (!hasDestination.value) return
  isReadinessOpen.value = false
  unlockStep(5)
  isRouteView.value = true
  window.scrollTo(0, 0)
  await nextTick()
  await ensureMap()
  await drawRouteMap()
}
const exportItinerary = () => {
  const text = [
    'Shadeo Itinerary',
    `Start: ${selectedStart.value?.name || 'Not selected'}`,
    `Destination: ${result.destination?.name || 'Not selected'}`,
    `Route score: ${formatScore(result.score)}`,
    `Distance: ${formatDistance(result.metrics.distanceMeters)}`,
    `Walking time: ${formatMinutes(result.metrics.durationMinutes)}`,
    '',
    'Route steps:',
    ...routeInstructions.value.map((step, index) => `${index + 1}. ${step.text} ${formatDistance(step.distanceMeters)}`)
  ].join('\n')
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'shadeo-itinerary.txt'
  link.click()
  URL.revokeObjectURL(url)
}
const jumpToStep = async (id) => {
  if (!canNavigateToStep(id)) return
  if (id <= 3) {
    await showStep(id)
    return
  }
  if (id === 4) {
    isRouteView.value = false
    openReadinessCheck()
    return
  }
  if (id === 5) {
    await confirmReadyToGo()
  }
}

watch(hasDestination, async () => {
  await nextTick()
  drawMiniMap()
})
watch(
  () => isReadinessOpen.value,
  async (open) => {
    if (open || isRouteView.value || !hasDestination.value) return
    await nextTick()
    requestAnimationFrame(() => {
      miniMap?.resize()
      drawMiniMap()
    })
  }
)
watch(
  () => isRouteView.value,
  (visible) => {
    if (!visible) {
      stopRouteDashAnimation()
      clearMarkers(routeMapMarkers)
      map?.remove()
      map = null
    }
  }
)
onBeforeUnmount(() => {
  stopRouteDashAnimation()
  clearMarkers(routeMapMarkers)
  map?.remove()
  destroyMiniMap()
  maplibregl.removeProtocol('pmtiles')
})
</script>
