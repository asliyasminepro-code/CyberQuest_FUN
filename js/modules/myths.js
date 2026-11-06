/**
 * CyberQuest — District 6: Myth Plaza (True or False)
 * Fast-paced myth-busting card deck challenging widespread cybersecurity misconceptions.
 */

export default {
  id: 'myths',
  title: 'Myth Plaza — True or False',

  mount(container, context) {
    this.container = container;
    this.context = context;
    this.myths = [];
    this.currentIndex = 0;
    this.score = 0;
    this.results = [];

    this.init();
  },

  async init() {
    try {
      const resp = await fetch('data/myths.json');
      this.myths = await resp.json();
    } catch (e) {
      console.error('Failed to load myths data:', e);
    }
    this.renderBriefing();
  },

  renderBriefing() {
    this.context.guide.say(
      "Stepping into Myth Plaza! Many widespread digital beliefs are dangerous myths. Let's bust them with cold hard facts!",
      'talking'
    );

    this.container.innerHTML = `
      <div class="cq-district-view">
        <header class="cq-mission-header">
          <a href="#/city" class="cq-mission-header__back">← Return to CyberCity</a>
          <div class="cq-mission-header__title-group">
            <div class="cq-mission-header__district-name">District 6: Myth Plaza</div>
            <h1 class="cq-mission-header__mission-title">Cyber MythBusters</h1>
          </div>
        </header>

        <section class="cq-briefing-card" aria-label="Mission Briefing">
          <div class="cq-briefing-card__hero">
            <div class="cq-briefing-card__icon">🔮</div>
            <div>
              <h2 class="cq-briefing-card__title">Operation: Fact vs. Fiction</h2>
              <div class="cq-briefing-card__subtitle">Threat Level: Tactical | Max XP: 150</div>
            </div>
          </div>

          <div class="cq-briefing-card__objectives">
            <p><strong>Mission Objectives:</strong></p>
            <ul>
              <li>Evaluate <strong>8 widespread online security claims</strong> as either FACT (True) or MYTH (False).</li>
              <li>Debunk common beliefs about Apple immunity, incognito invisibility, and antivirus capabilities.</li>
              <li>Uncover the real-world impact of permanent digital footprints.</li>
              <li>Separate dangerous assumptions from proven security habits.</li>
            </ul>
          </div>

          <div class="cq-briefing-card__actions">
            <button type="button" class="cq-btn-primary" id="cq-start-myths-btn">Enter Myth Plaza 🚀</button>
          </div>
        </section>
      </div>
    `;

    this.container.querySelector('#cq-start-myths-btn')?.addEventListener('click', () => {
      this.context.audio.playClick();
      this.renderGameplay();
    });
  },

  renderGameplay() {
    this.currentIndex = 0;
    this.score = 0;
    this.results = [];
    this.renderCard();
  },

  renderCard() {
    const myth = this.myths[this.currentIndex];
    const total = this.myths.length;

    this.container.innerHTML = `
      <div class="cq-district-view">
        <header class="cq-mission-header">
          <a href="#/city" class="cq-mission-header__back">← CyberCity</a>
          <div class="cq-mission-header__title-group">
            <div class="cq-mission-header__district-name">Myth Plaza — Card ${this.currentIndex + 1} of ${total}</div>
            <h1 class="cq-mission-header__mission-title">${this.context.utils.escapeHtml(myth.category)}</h1>
          </div>
        </header>

        <div style="background:var(--color-bg-surface);border:1px solid var(--color-border);border-radius:var(--radius-lg);padding:var(--space-8);box-shadow:var(--shadow-elevation);max-width:760px;margin:0 auto;text-align:center;">
          
          <div style="font-size:3rem;margin-bottom:var(--space-2);">💭</div>
          
          <div style="font-size:20px;font-weight:bold;line-height:1.5;color:#fff;margin-bottom:var(--space-8);min-height:90px;display:flex;align-items:center;justify-content:center;">
            "${this.context.utils.escapeHtml(myth.claim)}"
          </div>

          <!-- Buttons -->
          <div id="cq-myth-action-bar" style="display:flex;justify-content:center;gap:var(--space-6);">
            <button type="button" class="cq-btn-primary" id="cq-btn-true" style="background:#10b981;color:#000;font-size:18px;padding:14px 36px;">
              ✅ TRUE (Fact)
            </button>
            <button type="button" class="cq-btn-primary" id="cq-btn-false" style="background:#ef4444;color:#fff;font-size:18px;padding:14px 36px;">
              ❌ FALSE (Myth)
            </button>
          </div>

          <!-- Reveal Drawer -->
          <div id="cq-myth-reveal" style="display:none;margin-top:var(--space-6);padding:var(--space-6);border-radius:var(--radius-md);text-align:left;">
            <div id="cq-myth-verdict-title" style="font-size:18px;font-weight:bold;margin-bottom:8px;"></div>
            <p id="cq-myth-expl" style="font-size:14.5px;line-height:1.6;color:var(--color-text-primary);"></p>
            <div style="margin-top:var(--space-4);display:flex;justify-content:flex-end;">
              <button type="button" class="cq-btn-primary" id="cq-next-myth-btn">Next Myth Card →</button>
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindCardEvents(myth);
  },

  bindCardEvents(myth) {
    const btnTrue = this.container.querySelector('#cq-btn-true');
    const btnFalse = this.container.querySelector('#cq-btn-false');
    const actionBar = this.container.querySelector('#cq-myth-action-bar');
    const reveal = this.container.querySelector('#cq-myth-reveal');
    const verdictTitle = this.container.querySelector('#cq-myth-verdict-title');
    const expl = this.container.querySelector('#cq-myth-expl');
    const nextBtn = this.container.querySelector('#cq-next-myth-btn');

    const handleAnswer = (userGuessIsTrue) => {
      actionBar.style.display = 'none';
      const isCorrect = userGuessIsTrue === myth.isTrue;
      this.results.push({ myth, isCorrect, userGuessIsTrue });

      if (isCorrect) {
        this.score += Math.round(150 / this.myths.length);
        this.context.audio.playSuccess();
        reveal.style.background = 'rgba(16,185,129,0.12)';
        reveal.style.border = '1px solid #10b981';
        verdictTitle.style.color = '#10b981';
        verdictTitle.textContent = `🎯 CORRECT! Verdict: It is indeed ${myth.isTrue ? 'a FACT (True)' : 'a MYTH (False)'}!`;
      } else {
        this.context.audio.playError();
        reveal.style.background = 'rgba(239,68,68,0.12)';
        reveal.style.border = '1px solid #ef4444';
        verdictTitle.style.color = '#ef4444';
        verdictTitle.textContent = `❌ BUSTED! The claim is actually ${myth.isTrue ? 'TRUE (Fact)' : 'FALSE (Myth)'}!`;
      }

      expl.textContent = myth.explanation;
      reveal.style.display = 'block';

      nextBtn.addEventListener('click', () => {
        this.context.audio.playClick();
        if (this.currentIndex + 1 < this.myths.length) {
          this.currentIndex++;
          this.renderCard();
        } else {
          this.calculateResults();
        }
      });
    };

    btnTrue.addEventListener('click', () => handleAnswer(true));
    btnFalse.addEventListener('click', () => handleAnswer(false));
  },

  calculateResults() {
    const total = this.myths.length;
    const correctCount = this.results.filter(r => r.isCorrect).length;
    const accuracy = Math.round((correctCount / total) * 100);

    let earnedXp = Math.round((correctCount / total) * 150);
    earnedXp = Math.min(150, earnedXp);

    let stars = 1;
    if (accuracy >= 85) stars = 3;
    else if (accuracy >= 65) stars = 2;

    const recordResult = this.context.state.recordDistrictScore('myths', earnedXp, stars);

    this.renderResults({
      correctCount,
      total,
      accuracy,
      earnedXp,
      deltaXp: recordResult.deltaXp,
      stars
    });
  },

  renderResults(data) {
    if (data.accuracy >= 75) {
      this.context.audio.playFanfare();
      this.context.guide.say("Myth Plaza Cleared! You've successfully dismantled popular security fallacies.", 'celebrating');
    } else {
      this.context.guide.say("Great learning experience! Knowing what NOT to believe is half the battle in cyber defense.", 'talking');
    }

    this.container.innerHTML = `
      <div class="cq-district-view">
        <header class="cq-mission-header">
          <a href="#/city" class="cq-mission-header__back">← Return to CyberCity</a>
          <div class="cq-mission-header__title-group">
            <div class="cq-mission-header__district-name">Myth Plaza Completed</div>
            <h1 class="cq-mission-header__mission-title">MythBuster Verification Debrief</h1>
          </div>
        </header>

        <section class="cq-briefing-card">
          <div class="cq-results-card">
            <div class="cq-results-card__badge">${data.stars === 3 ? '🏆' : data.stars === 2 ? '⭐' : '🛡️'}</div>
            <h2>Busted: ${data.correctCount} / ${data.total} Myths (${data.accuracy}%)</h2>
            <div style="font-size:var(--font-size-lg);color:var(--color-cyan);margin-bottom:var(--space-2);">
              +${data.deltaXp} XP Awarded (District Score: ${data.earnedXp}/150)
            </div>
            ${data.deltaXp === 0 ? `<p style="font-size:12px;color:var(--color-text-muted);">(No XP gain: your previous score was already higher or equal. Differential scoring prevents infinite farming.)</p>` : ''}
          </div>

          <div style="background:var(--color-bg-elevated);border:1px solid var(--color-border);border-radius:var(--radius-md);padding:var(--space-4);margin:var(--space-4) 0;">
            <h3>Top 3 Myth Reminders:</h3>
            <ul>
              <li><strong>Incognito ≠ Anonymous:</strong> Incognito only hides local history on your device, not from websites or Wi-Fi routers.</li>
              <li><strong>Anyone Can Be Targeted:</strong> Hackers use automated bots to attack everyone, especially gamers and young internet users.</li>
              <li><strong>Length is King:</strong> Multi-word passphrases beat complex short passwords every time.</li>
            </ul>
          </div>

          <div class="cq-briefing-card__actions">
            <button type="button" class="cq-btn-secondary" id="cq-replay-myths-btn">Play Cards Again 🔄</button>
            <a href="#/city" class="cq-btn-primary">Return to CyberCity 🏙️</a>
          </div>
        </section>
      </div>
    `;

    this.container.querySelector('#cq-replay-myths-btn')?.addEventListener('click', () => {
      this.replay();
    });
  },

  replay() {
    this.context.audio.playClick();
    this.renderGameplay();
  },

  destroy() {
    this.myths = [];
    this.results = [];
  }
};

