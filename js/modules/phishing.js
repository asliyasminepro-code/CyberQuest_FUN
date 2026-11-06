/**
 * CyberQuest — District 1: Mailbox Quarter (Phishing Detective)
 * Simulated webmail inbox where players analyze sender headers, inspect links, and flag phishing vs legitimate emails.
 */

export default {
  id: 'phishing',
  title: 'Mailbox Quarter — Phishing Detective',

  mount(container, context) {
    this.container = container;
    this.context = context;
    this.emails = [];
    this.currentIndex = 0;
    this.verdicts = {}; // { [emailId]: boolean }
    this.score = 0;

    this.init();
  },

  async init() {
    try {
      const resp = await fetch('data/emails.json');
      this.emails = await resp.json();
    } catch (e) {
      console.error('Failed to load emails:', e);
    }
    this.renderBriefing();
  },

  renderBriefing() {
    this.context.guide.say(
      "Welcome to Mailbox Quarter! Phishing traps lurk in plain sight. Always inspect sender addresses and hover over hyperlinks before deciding!",
      'talking'
    );

    this.container.innerHTML = `
      <div class="cq-district-view">
        <header class="cq-mission-header">
          <a href="#/city" class="cq-mission-header__back">← Return to CyberCity</a>
          <div class="cq-mission-header__title-group">
            <div class="cq-mission-header__district-name">District 1: Mailbox Quarter</div>
            <h1 class="cq-mission-header__mission-title">Phishing Detective</h1>
          </div>
        </header>

        <section class="cq-briefing-card" aria-label="Mission Briefing">
          <div class="cq-briefing-card__hero">
            <div class="cq-briefing-card__icon">✉️</div>
            <div>
              <h2 class="cq-briefing-card__title">Operation: Inbox Infiltration</h2>
              <div class="cq-briefing-card__subtitle">Threat Level: High | Max XP: 150</div>
            </div>
          </div>

          <div class="cq-briefing-card__objectives">
            <p><strong>Mission Objectives:</strong></p>
            <ul>
              <li>Inspect 9 realistic incoming messages in your simulated inbox.</li>
              <li>Examine true sender email domains to catch typosquatting and impersonation.</li>
              <li>Hover over hyperlinks to verify the actual destination URL before trusting.</li>
              <li>Identify artificial panic, urgent threats, and fake giveaway bait.</li>
              <li>Classify each email accurately without falsely flagging legitimate club or school notices.</li>
            </ul>
          </div>

          <div class="cq-briefing-card__actions">
            <button type="button" class="cq-btn-primary" id="cq-start-phishing-btn">Start Detective Shift 🚀</button>
          </div>
        </section>
      </div>
    `;

    this.container.querySelector('#cq-start-phishing-btn')?.addEventListener('click', () => {
      this.context.audio.playClick();
      this.renderGameplay();
    });
  },

  renderGameplay() {
    this.currentIndex = 0;
    this.verdicts = {};
    this.renderEmailView();
  },

  renderEmailView() {
    const email = this.emails[this.currentIndex];
    const total = this.emails.length;
    const answeredCount = Object.keys(this.verdicts).length;

    this.container.innerHTML = `
      <div class="cq-district-view">
        <header class="cq-mission-header">
          <a href="#/city" class="cq-mission-header__back">← CyberCity</a>
          <div class="cq-mission-header__title-group">
            <div class="cq-mission-header__district-name">Mailbox Quarter — Inbox Inspector</div>
            <h1 class="cq-mission-header__mission-title">Message ${this.currentIndex + 1} of ${total}</h1>
          </div>
        </header>

        <!-- Webmail Layout Shell -->
        <div style="display:grid;grid-template-columns:260px 1fr;gap:var(--space-4);background:var(--color-bg-surface);border:1px solid var(--color-border);border-radius:var(--radius-lg);overflow:hidden;min-height:550px;">
          <!-- Left Inbox List -->
          <div style="background:var(--color-bg-elevated);border-right:1px solid var(--color-border);overflow-y:auto;max-height:650px;">
            <div style="padding:var(--space-3);border-bottom:1px solid var(--color-border);font-weight:bold;font-size:var(--font-size-sm);color:var(--color-cyan);">
              Inbox (${answeredCount}/${total} Analyzed)
            </div>
            <ul style="list-style:none;padding:0;margin:0;">
              ${this.emails.map((m, idx) => {
                const isSelected = idx === this.currentIndex;
                const verdict = this.verdicts[m.id];
                const icon = verdict !== undefined ? (verdict ? '🚩' : '✅') : '✉️';
                return `
                  <li style="border-bottom:1px solid var(--color-border);">
                    <button type="button" class="cq-inbox-item" data-index="${idx}" style="width:100%;text-align:left;background:${isSelected ? 'rgba(0,240,255,0.1)' : 'transparent'};border:none;border-left:${isSelected ? '4px solid var(--color-cyan)' : '4px solid transparent'};padding:10px;cursor:pointer;color:var(--color-text-primary);">
                      <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--color-text-secondary);">
                        <span style="font-weight:bold;color:${isSelected ? 'var(--color-cyan)' : 'inherit'};">${icon} ${this.context.utils.escapeHtml(m.senderName)}</span>
                      </div>
                      <div style="font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:2px;">
                        ${this.context.utils.escapeHtml(m.subject)}
                      </div>
                    </button>
                  </li>
                `;
              }).join('')}
            </ul>
          </div>

          <!-- Right Message Reading Pane -->
          <div style="padding:var(--space-6);display:flex;flex-direction:column;justify-content:space-between;">
            <div>
              <!-- Email Headers -->
              <div style="background:var(--color-bg-base);padding:var(--space-4);border-radius:var(--radius-md);border:1px solid var(--color-border);margin-bottom:var(--space-4);">
                <div style="font-size:var(--font-size-lg);font-weight:bold;margin-bottom:8px;">${this.context.utils.escapeHtml(email.subject)}</div>
                <div style="display:flex;justify-content:space-between;font-size:var(--font-size-xs);color:var(--color-text-secondary);margin-bottom:4px;">
                  <span><strong>From:</strong> ${this.context.utils.escapeHtml(email.sender)}</span>
                  <span>${this.context.utils.escapeHtml(email.date)}</span>
                </div>
                <div style="font-size:var(--font-size-xs);color:var(--color-text-secondary);">
                  <span><strong>To:</strong> Alex Carter &lt;alex.carter@cyberquest.local&gt;</span>
                </div>
              </div>

              <!-- Message Body -->
              <div style="background:#ffffff;color:#1e293b;padding:var(--space-6);border-radius:var(--radius-md);min-height:220px;font-size:14.5px;line-height:1.6;box-shadow:inset 0 1px 3px rgba(0,0,0,0.1);">
                ${email.body}
              </div>

              <!-- Hover Link Preview Inspector -->
              ${email.hoverUrl ? `
                <div style="margin-top:var(--space-3);padding:var(--space-2) var(--space-3);background:var(--color-bg-elevated);border:1px solid var(--color-cyan);border-radius:var(--radius-sm);font-family:var(--font-mono);font-size:12px;color:var(--color-cyan);display:flex;align-items:center;gap:8px;">
                  <span>🔍 <strong>Hyperlink Inspector Target:</strong></span>
                  <span style="word-break:break-all;">${this.context.utils.escapeHtml(email.hoverUrl)}</span>
                </div>
              ` : ''}
            </div>

            <!-- Decision Bar -->
            <div style="margin-top:var(--space-6);padding-top:var(--space-4);border-top:1px solid var(--color-border);display:flex;align-items:center;justify-content:space-between;">
              <span style="font-size:var(--font-size-sm);color:var(--color-text-secondary);">Your Detective Verdict:</span>
              <div style="display:flex;gap:var(--space-3);">
                <button type="button" class="cq-btn-secondary" id="cq-verdict-safe" style="border-color:#10b981;color:#10b981;">
                  ✅ Mark as Legitimate
                </button>
                <button type="button" class="cq-btn-primary" id="cq-verdict-phish" style="background:#ef4444;color:#fff;">
                  🚩 Flag as Phishing Trap
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Attach list click handlers
    this.container.querySelectorAll('.cq-inbox-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.dataset.index, 10);
        this.currentIndex = idx;
        this.context.audio.playClick();
        this.renderEmailView();
      });
    });

    // Attach verdict buttons
    this.container.querySelector('#cq-verdict-safe')?.addEventListener('click', () => {
      this.recordVerdict(false);
    });

    this.container.querySelector('#cq-verdict-phish')?.addEventListener('click', () => {
      this.recordVerdict(true);
    });
  },

  recordVerdict(isFlaggedAsPhishing) {
    const email = this.emails[this.currentIndex];
    this.verdicts[email.id] = isFlaggedAsPhishing;

    const isCorrect = isFlaggedAsPhishing === email.isPhishing;
    if (isCorrect) {
      this.context.audio.playSuccess();
    } else {
      this.context.audio.playError();
    }

    // Check if all emails answered
    if (Object.keys(this.verdicts).length >= this.emails.length) {
      this.calculateResults();
    } else {
      // Advance to next uninspected message
      let nextIndex = (this.currentIndex + 1) % this.emails.length;
      while (this.verdicts[this.emails[nextIndex].id] !== undefined && Object.keys(this.verdicts).length < this.emails.length) {
        nextIndex = (nextIndex + 1) % this.emails.length;
      }
      this.currentIndex = nextIndex;
      this.renderEmailView();
    }
  },

  calculateResults() {
    let correctCount = 0;
    this.emails.forEach(m => {
      if (this.verdicts[m.id] === m.isPhishing) {
        correctCount++;
      }
    });

    const total = this.emails.length;
    const accuracy = Math.round((correctCount / total) * 100);

    // Scoring: up to 150 XP
    let earnedXp = Math.round((correctCount / total) * 150);
    let stars = 1;
    if (accuracy >= 90) stars = 3;
    else if (accuracy >= 70) stars = 2;

    const recordResult = this.context.state.recordDistrictScore('phishing', earnedXp, stars);

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
    if (data.accuracy >= 80) {
      this.context.audio.playFanfare();
      this.context.guide.say("Outstanding detective work! You spotted the deceptive traps and protected your inbox.", 'celebrating');
    } else {
      this.context.guide.say("Good effort! Review the detailed breakdown below to see what red flags tricked you.", 'alert');
    }

    this.container.innerHTML = `
      <div class="cq-district-view">
        <header class="cq-mission-header">
          <a href="#/city" class="cq-mission-header__back">← Return to CyberCity</a>
          <div class="cq-mission-header__title-group">
            <div class="cq-mission-header__district-name">Mailbox Quarter Completed</div>
            <h1 class="cq-mission-header__mission-title">Detective Investigation Debrief</h1>
          </div>
        </header>

        <section class="cq-briefing-card">
          <div class="cq-results-card">
            <div class="cq-results-card__badge">${data.stars === 3 ? '🏆' : data.stars === 2 ? '⭐' : '🛡️'}</div>
            <h2>Accuracy: ${data.accuracy}% (${data.correctCount}/${data.total} Correct)</h2>
            <div style="font-size:var(--font-size-lg);color:var(--color-cyan);margin-bottom:var(--space-2);">
              +${data.deltaXp} XP Awarded (District Score: ${data.earnedXp}/150)
            </div>
            ${data.deltaXp === 0 ? `<p style="font-size:12px;color:var(--color-text-muted);">(No XP gain: your previous score was already higher or equal. Differential scoring prevents infinite farming.)</p>` : ''}
          </div>

          <!-- Detailed Email Breakdown List -->
          <div>
            <h3>Investigation Evidence Breakdown:</h3>
            <ul style="list-style:none;padding:0;display:flex;flex-direction:column;gap:var(--space-3);">
              ${this.emails.map(m => {
                const userVerdict = this.verdicts[m.id];
                const isCorrect = userVerdict === m.isPhishing;
                return `
                  <li style="background:var(--color-bg-elevated);border-left:4px solid ${isCorrect ? 'var(--color-green)' : 'var(--color-red)'};border-radius:var(--radius-sm);padding:var(--space-3);">
                    <div style="display:flex;justify-content:space-between;font-weight:bold;margin-bottom:4px;">
                      <span>${isCorrect ? '✅ CORRECT' : '❌ INCORRECT'}: ${this.context.utils.escapeHtml(m.subject)}</span>
                      <span>${m.isPhishing ? '🚩 Phishing Trap' : '🛡️ Legitimate'}</span>
                    </div>
                    <p style="font-size:13px;color:var(--color-text-secondary);margin:4px 0;">${this.context.utils.escapeHtml(m.explanation)}</p>
                    ${m.redFlags.length ? `
                      <div style="font-size:12px;color:var(--color-yellow);margin-top:4px;">
                        <strong>Red Flags:</strong> ${m.redFlags.map(rf => this.context.utils.escapeHtml(rf)).join(' • ')}
                      </div>
                    ` : ''}
                  </li>
                `;
              }).join('')}
            </ul>
          </div>

          <div class="cq-briefing-card__actions" style="margin-top:var(--space-4);">
            <button type="button" class="cq-btn-secondary" id="cq-replay-phishing-btn">Play Again 🔄</button>
            <a href="#/city" class="cq-btn-primary">Return to CyberCity 🏙️</a>
          </div>
        </section>
      </div>
    `;

    this.container.querySelector('#cq-replay-phishing-btn')?.addEventListener('click', () => {
      this.replay();
    });
  },

  replay() {
    this.context.audio.playClick();
    this.renderGameplay();
  },

  destroy() {
    this.emails = [];
    this.verdicts = {};
  }
};

