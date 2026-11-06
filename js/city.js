/**
 * CyberQuest — CyberCity 2.5D Isometric Map Controller
 * Renders the stable isometric CyberCity homepage, binds district hitboxes,
 * drives the Tactical Intel Bar, and manages accessible navigation.
 */

import { stateStore } from './state.js';
import { audio } from './audio.js';
import { guide } from './guide.js';
import { escapeHtml } from './utils.js';

/** Mission briefing and intelligence details for each district */
const DISTRICT_INTEL = {
  phishing: {
    subtitle: 'Phishing Detective',
    intel: 'Inspect suspicious incoming mail, check spoofed headers & flag deceptive phishing traps.',
    xp: '+150 XP'
  },
  password: {
    subtitle: 'Password Lab',
    intel: 'Test brute-force cracking resistance, analyze password entropy & craft memorable multi-word passphrases.',
    xp: '+150 XP'
  },
  ethical: {
    subtitle: 'Ethical Hacker Mission',
    intel: 'Navigate critical white-hat dilemmas: open server ports, peer password requests & responsible disclosure.',
    xp: '+150 XP'
  },
  flaws: {
    subtitle: 'Spot the Flaws',
    intel: 'Search interactive office & school workstations to spot digital and physical cybersecurity vulnerabilities.',
    xp: '+150 XP'
  },
  quiz: {
    subtitle: 'Cybersecurity Quiz',
    intel: 'Demonstrate cybersecurity knowledge across malware, networking, defensive hygiene & incident response.',
    xp: '+150 XP'
  },
  myths: {
    subtitle: 'True or False',
    intel: 'Debunk widespread online security myths in a rapid-fire sorting challenge with CyBot.',
    xp: '+150 XP'
  },
  ai: {
    subtitle: 'AI & Cybersecurity',
    intel: 'Analyze visual deepfakes, defend against AI social engineering & learn safe chatbot prompting hygiene.',
    xp: '+150 XP'
  },
  bonus: {
    subtitle: 'Quick Bonus Missions',
    intel: '6 rapid tactical mini-challenges: Evil Twin Wi-Fi, QR traps, App permissions, Ciphers & Deepfakes.',
    xp: '+450 XP'
  }
};

export class CityMapController {
  constructor(router) {
    this.router = router;
    this.districts = [];
    this.svgContent = null;
    this.tacticalBar = null;
    this._unsubscribe = null;
  }

  /* ------------------------------------------------------------------ */
  /* Init                                                                 */
  /* ------------------------------------------------------------------ */

  async init() {
    try {
      const resp = await fetch('data/districts.json');
      this.districts = await resp.json();
    } catch (e) {
      console.error('Failed to load district definitions:', e);
    }
  }

  /* ------------------------------------------------------------------ */
  /* Render                                                               */
  /* ------------------------------------------------------------------ */

  async render(container) {
    if (!this.districts.length) {
      await this.init();
    }

    const state = stateStore.getState();

    /* Build the full city page shell */
    container.innerHTML = `
      <section class="cq-city-view" aria-label="CyberCity Interactive Navigation Hub">

        <!-- Hero Header -->
        <header class="cq-city-view__header">
          <h1 class="cq-city-view__title">🏙️ CyberCity Tactical Map</h1>
          <p class="cq-city-view__subtitle">
            Explore 8 specialized cybersecurity districts. Select any building to begin your mission.
          </p>
          <div class="cq-city-view__pill" aria-hidden="true">
            🛡️ CyberCity Command Hub &nbsp;•&nbsp; ${this.districts.length} Districts Available
          </div>
        </header>

        <!-- Stable Tactical Intel Bar (Reconnaissance readout on hover/focus) -->
        <div class="cq-city-tactical-bar" id="cq-tactical-bar" role="status" aria-live="polite">
          <div class="cq-tactical-info">
            <span class="cq-tactical-icon" id="cq-tactical-icon" aria-hidden="true">🛰️</span>
            <div class="cq-tactical-text">
              <span class="cq-tactical-heading" id="cq-tactical-heading">CyberCity Tactical Radar Online</span>
              <span class="cq-tactical-desc" id="cq-tactical-desc">Hover over any district to inspect mission intel • Click to deploy</span>
            </div>
          </div>
          <span class="cq-tactical-cta" id="cq-tactical-cta">Ready</span>
        </div>

        <!-- Main Isometric Map Viewport -->
        <div class="cq-city-map-container" id="cq-map-viewport"
             role="region" aria-label="3D Isometric CyberCity Map — Select any building to enter that district">
          <!-- Loading placeholder -->
          <div class="cq-city-map-loader" id="cq-map-loader"
               aria-live="polite" aria-label="Loading CyberCity map">
            Loading CyberCity 3D Diorama…
          </div>
        </div>

        <!-- Progress Summary Ribbon -->
        <div class="cq-city-progress-ribbon" role="region" aria-label="Mission progress">
          ${this._buildProgressRibbon(state)}
        </div>

        <!-- Accessible Directory List (Always visible for keyboard / mobile / SR users) -->
        <nav class="cq-city-list-nav" aria-label="CyberCity District Directory">
          <h2 class="cq-city-list-nav__title">
            <span aria-hidden="true">🏙️</span> District Directory &amp; Status
          </h2>
          <ul class="cq-city-list-nav__grid" role="list">
            ${this.districts.map(d => this._buildListItem(d, state)).join('')}
          </ul>
        </nav>

      </section>
    `;

    this.tacticalBar = container.querySelector('#cq-tactical-bar');

    /* Load and inject SVG */
    const viewport = container.querySelector('#cq-map-viewport');
    await this.loadMapSvg(viewport);

    /* Subscribe to state changes so completion states update live */
    this._unsubscribe = stateStore.subscribe('state:change', () => {
      const svg = document.querySelector('#cq-map-viewport svg');
      if (svg) this.updateDistrictVisuals(svg.parentElement);
      
      const ribbon = document.querySelector('.cq-city-progress-ribbon');
      if (ribbon) ribbon.innerHTML = this._buildProgressRibbon(stateStore.getState());

      const list = document.querySelector('.cq-city-list-nav__grid');
      if (list) {
        list.innerHTML = this.districts
          .map(d => this._buildListItem(d, stateStore.getState()))
          .join('');
      }
    });
  }

  destroy() {
    if (this._unsubscribe) {
      try { this._unsubscribe(); } catch (_) {}
    }
  }

  /* ------------------------------------------------------------------ */
  /* SVG Loading                                                          */
  /* ------------------------------------------------------------------ */

  async loadMapSvg(targetEl) {
    try {
      if (!this.svgContent) {
        let resp;
        try {
          resp = await fetch('assets/city.svg');
        } catch (_) {
          resp = await fetch('./assets/city.svg');
        }
        if (!resp || !resp.ok) throw new Error(`HTTP ${resp ? resp.status : 'error'}`);
        this.svgContent = await resp.text();
      }
      targetEl.innerHTML = this.svgContent;

      this.bindMapEvents(targetEl);
      this.updateDistrictVisuals(targetEl);
    } catch (e) {
      console.warn('Could not load assets/city.svg. Falling back to directory mode.', e);
      targetEl.innerHTML = `
        <div style="padding:48px 32px;text-align:center;color:var(--color-cyan);">
          <div style="font-size:3.5rem;margin-bottom:0.75rem;">🗺️</div>
          <h3 style="margin:0 0 0.5rem;font-size:1.3rem;font-weight:800;">CyberCity Tactical Directory</h3>
          <p style="color:var(--color-text-secondary);font-size:0.95rem;">Select any district from the directory below to begin your mission.</p>
        </div>
      `;
    }
  }

  /* ------------------------------------------------------------------ */
  /* Event Binding                                                        */
  /* ------------------------------------------------------------------ */

  bindMapEvents(svgContainer) {
    this.selectedDistrictId = null;

    /* ---- District buildings ---- */
    this.districts.forEach(d => {
      const el = svgContainer.querySelector(`#district-${d.id}`);
      if (!el) return;

      el.style.cursor = 'pointer';

      /* Bulletproof click / pointerup activation with debounce */
      let lastTrigger = 0;
      const activateDistrict = (e) => {
        const now = Date.now();
        if (now - lastTrigger < 350) return;
        lastTrigger = now;
        if (e && e.cancelable && e.type !== 'pointerup') {
          e.preventDefault();
        }
        audio.playClick();
        this.router.navigate(`/district/${d.id}`);
      };

      el.addEventListener('click', activateDistrict);
      el.addEventListener('pointerup', activateDistrict);

      /* Keyboard → Enter or Space navigate */
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          activateDistrict(e);
        }
      });

      /* Hover / Focus updates the stable Tactical Intel Bar */
      const showIntel = () => {
        this.selectedDistrictId = d.id;
        const state = stateStore.getState();
        const status = state.districts?.[d.id];
        const intel = DISTRICT_INTEL[d.id] || { subtitle: d.subtitle, intel: d.tagline || d.description, xp: `+${d.baseXp} XP` };
        this._updateTacticalBar(d, intel, status);
      };

      const clearIntel = () => {
        // Keep selected district if focused, otherwise reset
        this._resetTacticalBar();
      };

      el.addEventListener('mouseenter', showIntel);
      el.addEventListener('mouseleave', clearIntel);
      el.addEventListener('focus', showIntel);
      el.addEventListener('blur', clearIntel);
    });

    /* Tactical Bar CTA button click support */
    if (this.tacticalBar) {
      const ctaBtn = this.tacticalBar.querySelector('#cq-tactical-cta');
      if (ctaBtn) {
        ctaBtn.style.cursor = 'pointer';
        ctaBtn.addEventListener('click', () => {
          if (this.selectedDistrictId) {
            audio.playClick();
            this.router.navigate(`/district/${this.selectedDistrictId}`);
          }
        });
      }
    }

    /* ---- Central CyBot Plaza ---- */
    const plaza = svgContainer.querySelector('#iso-cybot-plaza');
    if (plaza) {
      plaza.style.cursor = 'pointer';

      const showCybotIntel = () => {
        this._setCustomTactical(
          '🤖',
          'CyBot Command Plaza • Tactical Guide Station',
          'Click CyBot anytime for hints, mission recommendations, and cybersecurity insights.',
          'ASK CYBOT'
        );
      };

      plaza.addEventListener('mouseenter', showCybotIntel);
      plaza.addEventListener('mouseleave', () => this._resetTacticalBar());
      plaza.addEventListener('focus', showCybotIntel);
      plaza.addEventListener('blur', () => this._resetTacticalBar());

      plaza.addEventListener('click', () => {
        audio.playChirp();
        guide.provideContextualHint();
      });

      plaza.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          audio.playChirp();
          guide.provideContextualHint();
        }
      });
    }
  }

  /* ------------------------------------------------------------------ */
  /* Tactical Bar Updates                                                 */
  /* ------------------------------------------------------------------ */

  _updateTacticalBar(district, intel, status) {
    if (!this.tacticalBar) return;
    this.tacticalBar.classList.add('cq-city-tactical-bar--active');

    const iconEl = this.tacticalBar.querySelector('#cq-tactical-icon');
    const headEl = this.tacticalBar.querySelector('#cq-tactical-heading');
    const descEl = this.tacticalBar.querySelector('#cq-tactical-desc');
    const ctaEl  = this.tacticalBar.querySelector('#cq-tactical-cta');

    const statusText = status?.completed
      ? `COMPLETED (⭐ ${status.stars || 1}/3 • ${status.score} XP)`
      : `AVAILABLE (${intel.xp})`;

    if (iconEl) iconEl.textContent = district.icon;
    if (headEl) headEl.textContent = `${district.name} — ${intel.subtitle} [${statusText}]`;
    if (descEl) descEl.textContent = intel.intel;
    if (ctaEl) {
      ctaEl.textContent = status?.completed ? 'REPLAY MISSION ❯' : 'START MISSION ❯';
      ctaEl.style.color = status?.completed ? '#34d399' : '#00f0ff';
      ctaEl.style.borderColor = status?.completed ? 'rgba(16,185,129,0.5)' : 'rgba(0,240,255,0.5)';
    }
  }

  _setCustomTactical(icon, heading, desc, cta) {
    if (!this.tacticalBar) return;
    this.tacticalBar.classList.add('cq-city-tactical-bar--active');

    const iconEl = this.tacticalBar.querySelector('#cq-tactical-icon');
    const headEl = this.tacticalBar.querySelector('#cq-tactical-heading');
    const descEl = this.tacticalBar.querySelector('#cq-tactical-desc');
    const ctaEl  = this.tacticalBar.querySelector('#cq-tactical-cta');

    if (iconEl) iconEl.textContent = icon;
    if (headEl) headEl.textContent = heading;
    if (descEl) descEl.textContent = desc;
    if (ctaEl) {
      ctaEl.textContent = cta;
      ctaEl.style.color = '#00f0ff';
      ctaEl.style.borderColor = 'rgba(0,240,255,0.5)';
    }
  }

  _resetTacticalBar() {
    if (!this.tacticalBar) return;
    this.tacticalBar.classList.remove('cq-city-tactical-bar--active');

    const iconEl = this.tacticalBar.querySelector('#cq-tactical-icon');
    const headEl = this.tacticalBar.querySelector('#cq-tactical-heading');
    const descEl = this.tacticalBar.querySelector('#cq-tactical-desc');
    const ctaEl  = this.tacticalBar.querySelector('#cq-tactical-cta');

    if (iconEl) iconEl.textContent = '🛰️';
    if (headEl) headEl.textContent = 'CyberCity Tactical Radar Online';
    if (descEl) descEl.textContent = 'Hover over any district to inspect mission intel • Click to deploy';
    if (ctaEl) {
      ctaEl.textContent = 'READY';
      ctaEl.style.color = '#00f0ff';
      ctaEl.style.borderColor = 'rgba(0,240,255,0.3)';
    }
  }

  /* ------------------------------------------------------------------ */
  /* District Completion Visuals                                          */
  /* ------------------------------------------------------------------ */

  updateDistrictVisuals(svgContainer) {
    const state = stateStore.getState();

    this.districts.forEach(d => {
      const el = svgContainer.querySelector(`#district-${d.id}`);
      if (!el) return;

      const status = state.districts?.[d.id];

      if (status?.completed) {
        el.classList.add('is-completed');

        /* Inject static completion shield if not already present */
        if (!el.querySelector('.cq-map-completion-shield')) {
          const starsText = '★'.repeat(Math.min(status.stars || 1, 3));
          const shield = document.createElementNS('http://www.w3.org/2000/svg', 'g');
          shield.setAttribute('class', 'cq-map-completion-shield');
          shield.setAttribute('transform', 'translate(0, -145)');
          shield.innerHTML = `
            <!-- Shield glow halo (Stationary) -->
            <circle cx="0" cy="0" r="18" fill="#10b981" opacity="0.22"/>
            <!-- Shield badge circle -->
            <circle cx="0" cy="0" r="14" fill="#082218" stroke="#10b981" stroke-width="2.2"/>
            <!-- Trophy icon -->
            <text x="0" y="4.5" text-anchor="middle" font-size="12" role="img">🏆</text>
            <!-- Star rating bar -->
            <rect x="-26" y="16" width="52" height="15" rx="4" fill="#091726" stroke="#10b981" stroke-width="1.2"/>
            <text x="0" y="27" text-anchor="middle" fill="#f59e0b" font-size="9.5" font-weight="800">${starsText}</text>
          `;
          el.appendChild(shield);
        }

        /* Accessible label */
        el.setAttribute('aria-label',
          `${d.name} — ${d.subtitle}. COMPLETED: ${status.score} XP, ${status.stars || 1} out of 3 stars.`
        );
      } else {
        el.classList.remove('is-completed');
        const existing = el.querySelector('.cq-map-completion-shield');
        if (existing) existing.remove();

        el.setAttribute('aria-label',
          `${d.name} — ${d.subtitle}. Ready to explore. Up to ${d.baseXp} XP available.`
        );
      }
    });
  }

  /* ------------------------------------------------------------------ */
  /* Progress Ribbon                                                      */
  /* ------------------------------------------------------------------ */

  _buildProgressRibbon(state) {
    const completed = this.districts.filter(d => state.districts?.[d.id]?.completed).length;
    const total     = this.districts.length;
    const pct       = total ? Math.round((completed / total) * 100) : 0;
    const xp        = state.player?.xp || 0;
    const rankTitle = state.player?.rankTitle || 'Recruit';
    const rankBadge = state.player?.rankBadge || '🔰';

    return `
      <div class="cq-ribbon-inner">
        <span class="cq-ribbon-rank">${rankBadge} ${escapeHtml(rankTitle)}</span>
        <div class="cq-ribbon-progress" title="${completed} of ${total} districts completed">
          <span class="cq-ribbon-label">Districts</span>
          <div class="cq-ribbon-bar" role="progressbar" aria-valuenow="${completed}" aria-valuemin="0" aria-valuemax="${total}" aria-label="Districts completed">
            <div class="cq-ribbon-fill" style="width:${pct}%"></div>
          </div>
          <span class="cq-ribbon-fraction">${completed}/${total}</span>
        </div>
        <span class="cq-ribbon-xp">⚡ ${xp} XP</span>
      </div>
    `;
  }

  /* ------------------------------------------------------------------ */
  /* Directory List Item                                                  */
  /* ------------------------------------------------------------------ */

  _buildListItem(d, state) {
    const status      = state.districts?.[d.id] || { completed: false, score: 0, stars: 0 };
    const statusLabel = status.completed
      ? `Completed: ${status.stars}/3 Stars (${status.score} XP)`
      : 'Ready to explore';

    const statusBadge = status.completed
      ? `<span class="cq-district-card-link__status">⭐ ${status.stars || 1}/3</span>`
      : `<span class="cq-district-card-link__status">⚡ +${d.baseXp} XP</span>`;

    return `
      <li>
        <a href="#/district/${d.id}"
           class="cq-district-card-link ${status.completed ? 'cq-district-card-link--completed' : ''}"
           data-district="${d.id}"
           aria-label="${escapeHtml(d.name)}: ${escapeHtml(d.subtitle)}. Status: ${statusLabel}">
          <span class="cq-district-card-link__icon" aria-hidden="true">${d.icon}</span>
          <div>
            <div class="cq-district-card-link__name">${escapeHtml(d.name)}</div>
            <div class="cq-district-card-link__sub">${escapeHtml(d.subtitle)}</div>
          </div>
          ${statusBadge}
        </a>
      </li>
    `;
  }
}

export default CityMapController;
