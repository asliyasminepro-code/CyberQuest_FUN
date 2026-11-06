/**
 * CyberQuest — District 4: Office Tower (Spot the Flaws)
 * Interactive visual inspection scene where players discover physical and digital workstation vulnerabilities.
 */

export default {
  id: 'flaws',
  title: 'Office Tower — Spot the Flaws',

  mount(container, context) {
    this.container = container;
    this.context = context;
    this.flaws = [];
    this.foundFlaws = new Set();

    this.init();
  },

  async init() {
    try {
      const resp = await fetch('data/flaws.json');
      this.flaws = await resp.json();
    } catch (e) {
      console.error('Failed to load flaws data:', e);
    }
    this.renderBriefing();
  },

  renderBriefing() {
    this.context.guide.say(
      "Office Tower scan initialized! Look closely at the physical and digital environment. Real-world vulnerabilities are often hiding in plain view.",
      'talking'
    );

    this.container.innerHTML = `
      <div class="cq-district-view">
        <header class="cq-mission-header">
          <a href="#/city" class="cq-mission-header__back">← Return to CyberCity</a>
          <div class="cq-mission-header__title-group">
            <div class="cq-mission-header__district-name">District 4: Office Tower</div>
            <h1 class="cq-mission-header__mission-title">Spot the Flaws</h1>
          </div>
        </header>

        <section class="cq-briefing-card" aria-label="Mission Briefing">
          <div class="cq-briefing-card__hero">
            <div class="cq-briefing-card__icon">🏢</div>
            <div>
              <h2 class="cq-briefing-card__title">Operation: Physical &amp; Digital Audit</h2>
              <div class="cq-briefing-card__subtitle">Threat Level: Medium | Max XP: 150</div>
            </div>
          </div>

          <div class="cq-briefing-card__objectives">
            <p><strong>Mission Objectives:</strong></p>
            <ul>
              <li>Conduct a thorough security inspection of a school and office workstation.</li>
              <li>Locate <strong>8 hidden security vulnerabilities</strong> across the room and computer.</li>
              <li>Identify physical flaws (sticky notes, open trash, rogue USBs, unshielded cameras).</li>
              <li>Identify digital flaws (unlocked screens, unencrypted HTTP, open Wi-Fi, unpatched OS).</li>
              <li>Read the remediation report for each vulnerability discovered.</li>
            </ul>
          </div>

          <div class="cq-briefing-card__actions">
            <button type="button" class="cq-btn-primary" id="cq-start-flaws-btn">Commence Workstation Sweep 🚀</button>
          </div>
        </section>
      </div>
    `;

    this.container.querySelector('#cq-start-flaws-btn')?.addEventListener('click', () => {
      this.context.audio.playClick();
      this.renderGameplay();
    });
  },

  renderGameplay() {
    this.foundFlaws = new Set();

    this.container.innerHTML = `
      <div class="cq-district-view">
        <header class="cq-mission-header">
          <a href="#/city" class="cq-mission-header__back">← CyberCity</a>
          <div class="cq-mission-header__title-group">
            <div class="cq-mission-header__district-name">Office Tower — Security Sweep</div>
            <h1 class="cq-mission-header__mission-title">Found: <span id="cq-flaws-counter">0 / ${this.flaws.length}</span> Flaws</h1>
          </div>
        </header>

        <!-- Interactive Workstation Scene Canvas -->
        <div style="position:relative;width:100%;aspect-ratio:16/9;background:radial-gradient(circle at 50% 40%, #1e293b 0%, #0f172a 100%);border:2px solid var(--color-border);border-radius:var(--radius-lg);overflow:hidden;box-shadow:var(--shadow-elevation);" id="cq-scene-canvas" role="region" aria-label="Workstation Inspection Room">
          
          <!-- Mock SVG Backdrop Scene Elements -->
          <svg viewBox="0 0 1000 562" width="100%" height="100%" style="position:absolute;top:0;left:0;pointer-events:none;">
            <!-- Desk Surface -->
            <polygon points="120,380 880,380 960,540 40,540" fill="#18233c" stroke="#2a3b60" stroke-width="2"/>
            <!-- Large Monitor -->
            <rect x="360" y="160" width="280" height="180" rx="8" fill="#0b1324" stroke="#38bdf8" stroke-width="3"/>
            <rect x="375" y="175" width="250" height="150" fill="#1e293b"/>
            <!-- Monitor Stand -->
            <rect x="485" y="340" width="30" height="40" fill="#334155"/>
            <ellipse cx="500" cy="380" rx="60" ry="10" fill="#475569"/>
            <!-- Keyboard -->
            <polygon points="410,410 590,410 610,470 390,470" fill="#334155" stroke="#475569" stroke-width="1.5"/>
            <!-- Mouse -->
            <ellipse cx="660" cy="440" rx="18" ry="26" fill="#334155"/>
            <!-- PC Tower Base -->
            <rect x="230" y="270" width="100" height="200" rx="6" fill="#0f172a" stroke="#253556" stroke-width="2"/>
            <!-- Waste Bin -->
            <polygon points="160,420 210,420 200,500 170,500" fill="#1e293b" stroke="#334155" stroke-width="2"/>
          </svg>

          <!-- Interactive Hotspot Buttons placed via % coordinates -->
          ${this.flaws.map(f => `
            <button 
              type="button" 
              class="cq-flaw-pin" 
              data-id="${f.id}" 
              style="position:absolute;top:${f.y}%;left:${f.x}%;transform:translate(-50%,-50%);background:#ef4444;border:2px solid #fff;border-radius:50%;width:34px;height:34px;color:#fff;font-size:16px;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 0 14px #ef4444;transition:transform 0.2s, background 0.2s;" 
              aria-label="Inspect ${this.context.utils.escapeHtml(f.title)}"
              title="Inspect hotspot"
            >
              <span>${f.icon}</span>
            </button>
          `).join('')}
        </div>

        <!-- Detail Inspection Drawer / Info Card -->
        <div id="cq-flaw-drawer" style="margin-top:var(--space-4);background:var(--color-bg-surface);border:1px solid var(--color-border);border-radius:var(--radius-md);padding:var(--space-4);display:none;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
            <div style="font-size:var(--font-size-base);font-weight:bold;color:var(--color-cyan);" id="cq-flaw-title"></div>
            <span style="font-size:12px;background:var(--color-bg-elevated);padding:3px 8px;border-radius:4px;border:1px solid var(--color-border);" id="cq-flaw-category"></span>
          </div>
          <p style="font-size:14px;color:var(--color-text-primary);margin-bottom:8px;" id="cq-flaw-desc"></p>
          <div style="background:rgba(239,68,68,0.1);border-left:3px solid #ef4444;padding:8px 12px;border-radius:4px;margin-bottom:8px;font-size:13px;" id="cq-flaw-expl"></div>
          <div style="background:rgba(16,185,129,0.1);border-left:3px solid #10b981;padding:8px 12px;border-radius:4px;font-size:13px;" id="cq-flaw-remed"></div>
        </div>

        <!-- Finish Sweep Button -->
        <div style="margin-top:var(--space-4);display:flex;justify-content:flex-end;">
          <button type="button" class="cq-btn-primary" id="cq-finish-flaws-btn" disabled style="opacity:0.6;">
            Finish Security Sweep (Find all 8)
          </button>
        </div>
      </div>
    `;

    this.bindFlawEvents();
  },

  bindFlawEvents() {
    const pins = this.container.querySelectorAll('.cq-flaw-pin');
    const counter = this.container.querySelector('#cq-flaws-counter');
    const drawer = this.container.querySelector('#cq-flaw-drawer');
    const drawerTitle = this.container.querySelector('#cq-flaw-title');
    const drawerCat = this.container.querySelector('#cq-flaw-category');
    const drawerDesc = this.container.querySelector('#cq-flaw-desc');
    const drawerExpl = this.container.querySelector('#cq-flaw-expl');
    const drawerRemed = this.container.querySelector('#cq-flaw-remed');
    const finishBtn = this.container.querySelector('#cq-finish-flaws-btn');

    pins.forEach(pin => {
      pin.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        const flaw = this.flaws.find(f => f.id === id);
        if (!flaw) return;

        this.context.audio.playClick();

        if (!this.foundFlaws.has(id)) {
          this.foundFlaws.add(id);
          this.context.audio.playSuccess();
          pin.style.background = '#10b981';
          pin.style.boxShadow = '0 0 14px #10b981';
        }

        counter.textContent = `${this.foundFlaws.size} / ${this.flaws.length}`;

        // Populate detail drawer
        drawerTitle.textContent = `Vulnerability: ${flaw.title}`;
        drawerCat.textContent = flaw.category;
        drawerDesc.textContent = flaw.description;
        drawerExpl.innerHTML = `<strong>Why it's a threat:</strong> ${this.context.utils.escapeHtml(flaw.explanation)}`;
        drawerRemed.innerHTML = `<strong>Remediation:</strong> ${this.context.utils.escapeHtml(flaw.remediation)}`;
        drawer.style.display = 'block';

        if (this.foundFlaws.size >= this.flaws.length) {
          finishBtn.disabled = false;
          finishBtn.style.opacity = '1';
          finishBtn.style.cursor = 'pointer';
          finishBtn.textContent = 'Submit Comprehensive Audit 🚀';
        }
      });
    });

    finishBtn?.addEventListener('click', () => {
      this.calculateResults();
    });
  },

  calculateResults() {
    const earnedXp = 150;
    const recordResult = this.context.state.recordDistrictScore('flaws', earnedXp, 3);

    this.renderResults({
      earnedXp,
      deltaXp: recordResult.deltaXp,
      stars: 3
    });
  },

  renderResults(data) {
    this.context.audio.playFanfare();
    this.context.guide.say(
      "All 8 vulnerabilities audited and patched! Your sharp reconnaissance has eliminated physical and digital backdoors.",
      'celebrating'
    );

    this.container.innerHTML = `
      <div class="cq-district-view">
        <header class="cq-mission-header">
          <a href="#/city" class="cq-mission-header__back">← Return to CyberCity</a>
          <div class="cq-mission-header__title-group">
            <div class="cq-mission-header__district-name">Office Tower Completed</div>
            <h1 class="cq-mission-header__mission-title">Workstation Audit Certification</h1>
          </div>
        </header>

        <section class="cq-briefing-card">
          <div class="cq-results-card">
            <div class="cq-results-card__badge">🏆</div>
            <h2>Workstation Status: 100% Hardened</h2>
            <div style="font-size:var(--font-size-lg);color:var(--color-cyan);margin-bottom:var(--space-2);">
              +${data.deltaXp} XP Awarded (District Score: ${data.earnedXp}/150)
            </div>
            ${data.deltaXp === 0 ? `<p style="font-size:12px;color:var(--color-text-muted);">(No XP gain: your previous score was already higher or equal. Differential scoring prevents infinite farming.)</p>` : ''}
          </div>

          <div style="background:var(--color-bg-elevated);border:1px solid var(--color-border);border-radius:var(--radius-md);padding:var(--space-4);margin:var(--space-4) 0;">
            <h3>Workstation Defense Checklist:</h3>
            <ul>
              <li><strong>Clean Desk Policy:</strong> Shred passwords and sensitive printouts; never use sticky notes.</li>
              <li><strong>Lock on Leave:</strong> Windows Key + L or Command + Control + Q when stepping away.</li>
              <li><strong>Hardware Hygiene:</strong> Never plug in unknown USB drives; use physical camera privacy sliders.</li>
              <li><strong>Patch Regularly:</strong> Enable automatic operating system and browser updates.</li>
            </ul>
          </div>

          <div class="cq-briefing-card__actions">
            <button type="button" class="cq-btn-secondary" id="cq-replay-flaws-btn">Re-inspect Workstation 🔄</button>
            <a href="#/city" class="cq-btn-primary">Return to CyberCity 🏙️</a>
          </div>
        </section>
      </div>
    `;

    this.container.querySelector('#cq-replay-flaws-btn')?.addEventListener('click', () => {
      this.replay();
    });
  },

  replay() {
    this.context.audio.playClick();
    this.renderGameplay();
  },

  destroy() {
    this.flaws = [];
    this.foundFlaws.clear();
  }
};

