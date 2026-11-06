/**
 * CyberQuest — CyberCity Interactive Map Controller
 * Controls SVG map rendering, interactive hotspots, status badges, and accessible list navigation.
 */

import { stateStore } from './state.js';
import { audio } from './audio.js';
import { escapeHtml } from './utils.js';

export class CityMapController {
  constructor(router) {
    this.router = router;
    this.districts = [];
    this.svgContent = null;
  }

  async init() {
    try {
      const resp = await fetch('data/districts.json');
      this.districts = await resp.json();
    } catch (e) {
      console.error('Failed to load district definitions:', e);
    }
  }

  /**
   * Renders the CyberCity view into the provided mount container.
   * @param {HTMLElement} container
   */
  async render(container) {
    if (!this.districts.length) {
      await this.init();
    }

    const state = stateStore.getState();

    // Render HTML shell for the city view
    container.innerHTML = `
      <section class="cq-city-view" aria-label="CyberCity Tactical Navigation Hub">
        <header class="cq-city-view__header">
          <h1 class="cq-city-view__title">CyberCity Tactical Map</h1>
          <p class="cq-city-view__subtitle">All 8 districts are accessible. Choose any district to begin your mission!</p>
        </header>

        <div class="cq-city-map-container" id="cq-map-viewport" role="region" aria-label="Interactive City Map">
          <!-- SVG map loaded here -->
          <div class="cq-city-map-loader" style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--color-cyan);">
            Loading CyberCity Sectors...
          </div>
        </div>

        <!-- Accessible List Alternative for Screen Readers & Direct Navigation -->
        <nav class="cq-city-list-nav" aria-label="CyberCity District Directory">
          <h2 class="cq-city-list-nav__title">District Directory</h2>
          <ul class="cq-city-list-nav__grid" role="list">
            ${this.districts.map(d => {
              const status = state.districts[d.id] || { completed: false, score: 0, stars: 0 };
              const statusLabel = status.completed ? `⭐ ${status.stars}/3 Stars (${status.score} XP)` : 'Active';
              return `
                <li>
                  <a href="#/district/${d.id}" class="cq-district-card-link" data-district="${d.id}" aria-label="${escapeHtml(d.name)}: ${escapeHtml(d.subtitle)}. Status: ${statusLabel}">
                    <span class="cq-district-card-link__icon" aria-hidden="true">${d.icon}</span>
                    <div>
                      <div class="cq-district-card-link__name">${escapeHtml(d.name)}</div>
                      <div class="cq-district-card-link__sub">${escapeHtml(d.subtitle)}</div>
                    </div>
                    <span class="cq-district-card-link__status">${status.completed ? '✅' : '⚡'}</span>
                  </a>
                </li>
              `;
            }).join('')}
          </ul>
        </nav>
      </section>
    `;

    // Load and inject city.svg
    await this.loadMapSvg(container.querySelector('#cq-map-viewport'));
  }

  async loadMapSvg(targetEl) {
    try {
      if (!this.svgContent) {
        const resp = await fetch('assets/city.svg');
        this.svgContent = await resp.text();
      }
      targetEl.innerHTML = this.svgContent;
      this.bindMapEvents(targetEl);
      this.updateDistrictVisuals(targetEl);
    } catch (e) {
      console.warn('Could not load assets/city.svg. Falling back to directory list navigation.', e);
      targetEl.innerHTML = `
        <div style="padding: 40px; text-align: center; color: var(--color-cyan);">
          <h3>CyberCity Visual Map Active</h3>
          <p>Explore districts using the directory below.</p>
        </div>
      `;
    }
  }

  bindMapEvents(svgContainer) {
    this.districts.forEach(d => {
      const el = svgContainer.querySelector(`#district-${d.id}`);
      if (el) {
        el.style.cursor = 'pointer';
        
        // Click handler
        el.addEventListener('click', () => {
          audio.playClick();
          this.router.navigate(`/district/${d.id}`);
        });

        // Keyboard handler (Enter or Space)
        el.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            audio.playClick();
            this.router.navigate(`/district/${d.id}`);
          }
        });
      }
    });
  }

  updateDistrictVisuals(svgContainer) {
    const state = stateStore.getState();
    this.districts.forEach(d => {
      const el = svgContainer.querySelector(`#district-${d.id}`);
      if (el) {
        const status = state.districts[d.id];
        if (status && status.completed) {
          const rect = el.querySelector('rect');
          if (rect) {
            rect.setAttribute('stroke', '#10b981');
            rect.setAttribute('stroke-width', '3');
          }
        }
      }
    });
  }
}

export default CityMapController;

