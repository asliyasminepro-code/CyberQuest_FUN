/**
 * CyberQuest — District 3: Firewall Fortress (Ethical Hacker Mission)
 * Interactive decision-tree addressing white-hat hacking, academic honesty, malware cheats, and responsible disclosure.
 */

export default {
  id: 'ethical',
  title: 'Firewall Fortress — Ethical Hacker Mission',

  mount(container, context) {
    this.container = container;
    this.context = context;
    this.scenarios = [];
    this.currentScenarioIndex = 0;
    this.userAnswers = []; // choices selected
    this.score = 0;

    this.init();
  },

  async init() {
    try {
      const resp = await fetch('data/scenarios.json');
      this.scenarios = await resp.json();
    } catch (e) {
      console.error('Failed to load scenarios:', e);
    }
    this.renderBriefing();
  },

  renderBriefing() {
    this.context.guide.say(
      "Firewall Fortress ahead! White-hat defenders protect without harming. Make ethical choices that safeguard privacy and uphold digital integrity.",
      'talking'
    );

    this.container.innerHTML = `
      <div class="cq-district-view">
        <header class="cq-mission-header">
          <a href="#/city" class="cq-mission-header__back">← Return to CyberCity</a>
          <div class="cq-mission-header__title-group">
            <div class="cq-mission-header__district-name">District 3: Firewall Fortress</div>
            <h1 class="cq-mission-header__mission-title">Ethical Hacker Mission</h1>
          </div>
        </header>

        <section class="cq-briefing-card" aria-label="Mission Briefing">
          <div class="cq-briefing-card__hero">
            <div class="cq-briefing-card__icon">🏰</div>
            <div>
              <h2 class="cq-briefing-card__title">Operation: White-Hat Protocol</h2>
              <div class="cq-briefing-card__subtitle">Threat Level: Medium | Max XP: 150</div>
            </div>
          </div>

          <div class="cq-briefing-card__objectives">
            <p><strong>Mission Objectives:</strong></p>
            <ul>
              <li>Navigate 3 critical ethical dilemma scenarios facing young technologists today.</li>
              <li>Learn the legal and ethical boundaries between White-Hat, Grey-Hat, and Black-Hat actions.</li>
              <li>Understand the real-world consequences of unauthorized access and computer fraud.</li>
              <li>Master the proper protocol for <strong>Responsible Vulnerability Disclosure</strong>.</li>
            </ul>
          </div>

          <div class="cq-briefing-card__actions">
            <button type="button" class="cq-btn-primary" id="cq-start-ethical-btn">Enter Ethical Tribunal 🚀</button>
          </div>
        </section>
      </div>
    `;

    this.container.querySelector('#cq-start-ethical-btn')?.addEventListener('click', () => {
      this.context.audio.playClick();
      this.renderGameplay();
    });
  },

  renderGameplay() {
    this.currentScenarioIndex = 0;
    this.userAnswers = [];
    this.score = 0;
    this.renderCurrentScenario();
  },

  renderCurrentScenario() {
    const s = this.scenarios[this.currentScenarioIndex];
    const total = this.scenarios.length;

    this.container.innerHTML = `
      <div class="cq-district-view">
        <header class="cq-mission-header">
          <a href="#/city" class="cq-mission-header__back">← CyberCity</a>
          <div class="cq-mission-header__title-group">
            <div class="cq-mission-header__district-name">Firewall Fortress — Dilemma ${this.currentScenarioIndex + 1} of ${total}</div>
            <h1 class="cq-mission-header__mission-title">${this.context.utils.escapeHtml(s.title)}</h1>
          </div>
        </header>

        <div style="background:var(--color-bg-surface);border:1px solid var(--color-border);border-radius:var(--radius-lg);padding:var(--space-8);box-shadow:var(--shadow-elevation);">
          <div style="background:var(--color-bg-elevated);border-left:4px solid var(--color-green);border-radius:var(--radius-sm);padding:var(--space-4);margin-bottom:var(--space-6);font-size:15px;line-height:1.6;">
            <p><strong>Situation:</strong> ${this.context.utils.escapeHtml(s.situation)}</p>
            <p style="margin-top:10px;color:var(--color-yellow);"><strong>Dilemma:</strong> ${this.context.utils.escapeHtml(s.dilemma)}</p>
          </div>

          <h2 style="font-size:var(--font-size-base);color:var(--color-cyan);margin-bottom:var(--space-4);">Select Your Tactical Response:</h2>

          <div style="display:flex;flex-direction:column;gap:var(--space-3);" id="cq-choices-container">
            ${s.choices.map((c, idx) => `
              <button type="button" class="cq-choice-btn" data-index="${idx}" style="background:var(--color-bg-elevated);border:1px solid var(--color-border);border-radius:var(--radius-md);padding:var(--space-4);text-align:left;color:#fff;font-size:14.5px;cursor:pointer;transition:all 0.2s;line-height:1.45;">
                <span style="font-weight:bold;color:var(--color-cyan);margin-right:8px;">[Option ${String.fromCharCode(65 + idx)}]</span>
                ${this.context.utils.escapeHtml(c.label)}
              </button>
            `).join('')}
          </div>

          <!-- Feedback Container -->
          <div id="cq-scenario-feedback" style="display:none;margin-top:var(--space-6);padding:var(--space-4);border-radius:var(--radius-md);">
            <div id="cq-feedback-title" style="font-weight:bold;font-size:16px;margin-bottom:6px;"></div>
            <div id="cq-feedback-text" style="font-size:14px;line-height:1.5;"></div>
            <div style="margin-top:var(--space-4);display:flex;justify-content:flex-end;">
              <button type="button" class="cq-btn-primary" id="cq-next-scenario-btn">Next Dilemma →</button>
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindChoiceEvents(s);
  },

  bindChoiceEvents(scenario) {
    const choices = this.container.querySelectorAll('.cq-choice-btn');
    const feedbackBox = this.container.querySelector('#cq-scenario-feedback');
    const feedbackTitle = this.container.querySelector('#cq-feedback-title');
    const feedbackText = this.container.querySelector('#cq-feedback-text');
    const nextBtn = this.container.querySelector('#cq-next-scenario-btn');

    choices.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const choiceIdx = parseInt(e.currentTarget.dataset.index, 10);
        const selectedChoice = scenario.choices[choiceIdx];

        // Disable all choices
        choices.forEach(b => {
          b.disabled = true;
          b.style.cursor = 'default';
        });

        const isEthical = selectedChoice.isEthical;
        this.userAnswers.push({ scenario, selectedChoice });

        if (isEthical) {
          this.score += 50;
          this.context.audio.playSuccess();
          btn.style.borderColor = '#10b981';
          btn.style.background = 'rgba(16,185,129,0.15)';
          feedbackBox.style.background = 'rgba(16,185,129,0.1)';
          feedbackBox.style.border = '1px solid #10b981';
          feedbackTitle.style.color = '#10b981';
          feedbackTitle.textContent = '✅ ETHICAL DEFENDER CHOICE (+50 XP)';
        } else {
          this.context.audio.playError();
          btn.style.borderColor = '#ef4444';
          btn.style.background = 'rgba(239,68,68,0.15)';
          feedbackBox.style.background = 'rgba(239,68,68,0.1)';
          feedbackBox.style.border = '1px solid #ef4444';
          feedbackTitle.style.color = '#ef4444';
          feedbackTitle.textContent = '❌ UNETHICAL / HARMFUL ACTION (+0 XP)';
        }

        feedbackText.textContent = selectedChoice.feedback;
        feedbackBox.style.display = 'block';

        nextBtn.addEventListener('click', () => {
          this.context.audio.playClick();
          if (this.currentScenarioIndex + 1 < this.scenarios.length) {
            this.currentScenarioIndex++;
            this.renderCurrentScenario();
          } else {
            this.calculateResults();
          }
        });
      });
    });
  },

  calculateResults() {
    const earnedXp = this.score;
    let stars = 1;
    if (this.score >= 150) stars = 3;
    else if (this.score >= 100) stars = 2;

    const recordResult = this.context.state.recordDistrictScore('ethical', earnedXp, stars);

    this.renderResults({
      earnedXp,
      deltaXp: recordResult.deltaXp,
      stars
    });
  },

  renderResults(data) {
    if (data.stars === 3) {
      this.context.audio.playFanfare();
      this.context.guide.say("Flawless ethical decisions! You represent the pinnacle of White-Hat digital integrity.", 'celebrating');
    } else {
      this.context.guide.say("Mission complete. Remember, real ethical hackers build defenses and protect without causing harm.", 'talking');
    }

    this.container.innerHTML = `
      <div class="cq-district-view">
        <header class="cq-mission-header">
          <a href="#/city" class="cq-mission-header__back">← Return to CyberCity</a>
          <div class="cq-mission-header__title-group">
            <div class="cq-mission-header__district-name">Firewall Fortress Completed</div>
            <h1 class="cq-mission-header__mission-title">White-Hat Tribunal Verdict</h1>
          </div>
        </header>

        <section class="cq-briefing-card">
          <div class="cq-results-card">
            <div class="cq-results-card__badge">${data.stars === 3 ? '🏆' : data.stars === 2 ? '⭐' : '🛡️'}</div>
            <h2>Ethical Score: ${data.earnedXp} / 150</h2>
            <div style="font-size:var(--font-size-lg);color:var(--color-cyan);margin-bottom:var(--space-2);">
              +${data.deltaXp} XP Awarded
            </div>
            ${data.deltaXp === 0 ? `<p style="font-size:12px;color:var(--color-text-muted);">(No XP gain: your previous score was already higher or equal. Differential scoring prevents infinite farming.)</p>` : ''}
          </div>

          <div style="background:var(--color-bg-elevated);border:1px solid var(--color-border);border-radius:var(--radius-md);padding:var(--space-4);margin:var(--space-4) 0;">
            <h3>The Ethical Hacker Code of Conduct:</h3>
            <ul>
              <li><strong>Authorization:</strong> Never test, probe, or alter systems without explicit written consent.</li>
              <li><strong>Privacy:</strong> If you accidentally stumble upon private records, do not read, copy, or distribute them.</li>
              <li><strong>Responsible Disclosure:</strong> Always report discovered vulnerabilities privately to system administrators rather than posting them publicly on social media.</li>
            </ul>
          </div>

          <div class="cq-briefing-card__actions">
            <button type="button" class="cq-btn-secondary" id="cq-replay-ethical-btn">Replay Scenarios 🔄</button>
            <a href="#/city" class="cq-btn-primary">Return to CyberCity 🏙️</a>
          </div>
        </section>
      </div>
    `;

    this.container.querySelector('#cq-replay-ethical-btn')?.addEventListener('click', () => {
      this.replay();
    });
  },

  replay() {
    this.context.audio.playClick();
    this.renderGameplay();
  },

  destroy() {
    this.scenarios = [];
    this.userAnswers = [];
  }
};

