/**
 * CyberQuest — District 2: Vault District (Password Lab)
 * Live password strength analyzer, brute-force cracking calculator (10 billion guesses/sec),
 * educational theoretical disclaimer, passphrase generator, and 2FA simulation.
 * STRICT PRIVACY: Operates strictly in volatile component memory. Passwords never persisted.
 */

export default {
  id: 'password',
  title: 'Vault District — Password Lab',

  mount(container, context) {
    this.container = container;
    this.context = context;
    this.config = null;
    this.passphraseChallengeCompleted = false;
    this.mfaChallengeCompleted = false;

    this.init();
  },

  async init() {
    try {
      const resp = await fetch('data/passwords.json');
      this.config = await resp.json();
    } catch (e) {
      console.error('Failed to load password configuration:', e);
    }
    this.renderBriefing();
  },

  renderBriefing() {
    this.context.guide.say(
      "Entering the Vault District! Remember: length creates exponential resistance, but brute force isn't the only threat. Master passphrases and 2FA to seal the vault!",
      'talking'
    );

    this.container.innerHTML = `
      <div class="cq-district-view">
        <header class="cq-mission-header">
          <a href="#/city" class="cq-mission-header__back">← Return to CyberCity</a>
          <div class="cq-mission-header__title-group">
            <div class="cq-mission-header__district-name">District 2: Vault District</div>
            <h1 class="cq-mission-header__mission-title">Password Lab &amp; 2FA Terminal</h1>
          </div>
        </header>

        <section class="cq-briefing-card" aria-label="Mission Briefing">
          <div class="cq-briefing-card__hero">
            <div class="cq-briefing-card__icon">🔐</div>
            <div>
              <h2 class="cq-briefing-card__title">Operation: Entropy Lockdown</h2>
              <div class="cq-briefing-card__subtitle">Threat Level: High | Max XP: 150</div>
            </div>
          </div>

          <div class="cq-briefing-card__objectives">
            <p><strong>Mission Objectives:</strong></p>
            <ul>
              <li>Test passwords against our offline brute-force engine at <strong>10 billion (10^10) guesses/sec</strong>.</li>
              <li>Learn why password length dominates mathematical search spaces over short complexity.</li>
              <li>Understand the vital difference between a theoretical cracking estimate and real-world security risks (phishing, data breaches, keyloggers).</li>
              <li>Assemble an unbreakable 4-word passphrase and configure Multi-Factor Authentication (2FA).</li>
            </ul>
          </div>

          <div class="cq-briefing-card__actions">
            <button type="button" class="cq-btn-primary" id="cq-start-pwd-btn">Enter Password Laboratory 🚀</button>
          </div>
        </section>
      </div>
    `;

    this.container.querySelector('#cq-start-pwd-btn')?.addEventListener('click', () => {
      this.context.audio.playClick();
      this.renderGameplay();
    });
  },

  renderGameplay() {
    this.container.innerHTML = `
      <div class="cq-district-view">
        <header class="cq-mission-header">
          <a href="#/city" class="cq-mission-header__back">← CyberCity</a>
          <div class="cq-mission-header__title-group">
            <div class="cq-mission-header__district-name">Vault District — Tactical Workshop</div>
            <h1 class="cq-mission-header__mission-title">Password Strength &amp; 2FA Lab</h1>
          </div>
        </header>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-6);">
          <!-- Left Column: Password Simulator -->
          <div style="background:var(--color-bg-surface);border:1px solid var(--color-border);border-radius:var(--radius-lg);padding:var(--space-6);">
            <h2 style="font-size:var(--font-size-lg);color:var(--color-cyan);margin-top:0;">1. Password Entropy Simulator</h2>
            <p style="font-size:13px;color:var(--color-text-secondary);margin-bottom:var(--space-4);">
              Type a sample password below to calculate search-space combinations and brute-force cracking estimates at <strong>10 billion guesses/sec</strong>.
            </p>

            <div style="margin-bottom:var(--space-4);">
              <label for="cq-pwd-input" style="display:block;font-size:13px;font-weight:bold;margin-bottom:6px;">Sample Password Test Input:</label>
              <div style="display:flex;gap:8px;">
                <input 
                  type="password" 
                  id="cq-pwd-input" 
                  autocomplete="off" 
                  autocorrect="off" 
                  spellcheck="false" 
                  placeholder="Type a sample password..." 
                  style="flex:1;background:var(--color-bg-base);border:1px solid var(--color-border);border-radius:var(--radius-sm);padding:10px 14px;color:#fff;font-family:var(--font-mono);font-size:16px;"
                />
                <button type="button" class="cq-btn-secondary" id="cq-pwd-toggle-vis" title="Toggle visibility" style="padding:0 12px;">👁️</button>
                <button type="button" class="cq-btn-secondary" id="cq-pwd-clear-btn" title="Clear field" style="padding:0 12px;">Clear</button>
              </div>
              <div style="font-size:11px;color:var(--color-text-muted);margin-top:4px;">
                🔒 <strong>Privacy Assurance:</strong> Inputs are evaluated solely in volatile memory. Never saved or transmitted.
              </div>
            </div>

            <!-- Strength Gauge Bar -->
            <div style="margin-bottom:var(--space-4);">
              <div style="display:flex;justify-content:space-between;font-size:13px;font-weight:bold;margin-bottom:4px;">
                <span>Theoretical Strength:</span>
                <span id="cq-gauge-label" style="color:var(--color-text-muted);">Empty</span>
              </div>
              <div style="height:12px;background:var(--color-bg-base);border-radius:var(--radius-full);overflow:hidden;border:1px solid var(--color-border);">
                <div id="cq-gauge-fill" style="height:100%;width:0%;background:#ef4444;transition:width 0.2s, background 0.2s;"></div>
              </div>
            </div>

            <!-- Cracking Metrics Display -->
            <div style="background:var(--color-bg-elevated);border:1px solid var(--color-border);border-radius:var(--radius-md);padding:var(--space-4);margin-bottom:var(--space-4);font-family:var(--font-mono);font-size:13px;">
              <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
                <span style="color:var(--color-text-secondary);">Character Pool (C):</span>
                <span id="cq-metric-pool" style="color:#fff;">0</span>
              </div>
              <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
                <span style="color:var(--color-text-secondary);">Length (L):</span>
                <span id="cq-metric-len" style="color:#fff;">0</span>
              </div>
              <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
                <span style="color:var(--color-text-secondary);">Search Space (C^L):</span>
                <span id="cq-metric-comb" style="color:#fff;">0 combinations</span>
              </div>
              <div style="border-top:1px solid var(--color-border);padding-top:8px;margin-top:8px;display:flex;justify-content:space-between;font-weight:bold;">
                <span style="color:var(--color-cyan);">Cracking Estimate:</span>
                <span id="cq-metric-time" style="color:#fff;text-align:right;">0 seconds</span>
              </div>
            </div>

            <!-- MANDATORY EDUCATIONAL THEORETICAL DISCLAIMER -->
            <div style="background:rgba(239,68,68,0.1);border-left:4px solid #ef4444;border-radius:var(--radius-sm);padding:var(--space-3);font-size:12px;line-height:1.45;color:var(--color-text-primary);">
              <div style="font-weight:bold;color:#ef4444;margin-bottom:4px;">⚠️ Important Educational Disclaimer:</div>
              This calculation is a <strong>simplified theoretical model</strong> assuming an offline brute-force attacker testing exactly 10,000,000,000 guesses per second. 
              <strong>A long cracking time does NOT mean your password is safe in real life.</strong> 
              Real-world passwords are compromised through phishing websites, credential-stealing malware, server database breaches, and credential stuffing.
            </div>
          </div>

          <!-- Right Column: Passphrase Generator & 2FA Challenge -->
          <div style="display:flex;flex-direction:column;gap:var(--space-4);">
            <!-- Passphrase Workshop -->
            <div style="background:var(--color-bg-surface);border:1px solid var(--color-border);border-radius:var(--radius-lg);padding:var(--space-6);">
              <h2 style="font-size:var(--font-size-lg);color:var(--color-green);margin-top:0;">2. Passphrase Builder Challenge</h2>
              <p style="font-size:13px;color:var(--color-text-secondary);margin-bottom:var(--space-4);">
                Generate a 4-word random passphrase to see how length delivers massive mathematical security while remaining easy to remember.
              </p>

              <div id="cq-passphrase-box" style="background:var(--color-bg-base);border:1px solid var(--color-border);border-radius:var(--radius-md);padding:var(--space-4);text-align:center;font-family:var(--font-mono);font-size:18px;font-weight:bold;color:var(--color-green);margin-bottom:var(--space-4);min-height:54px;display:flex;align-items:center;justify-content:center;">
                Click 'Generate Passphrase' below
              </div>

              <div style="display:flex;gap:var(--space-3);">
                <button type="button" class="cq-btn-secondary" id="cq-gen-passphrase-btn" style="flex:1;">Roll Random Words 🎲</button>
                <button type="button" class="cq-btn-primary" id="cq-test-passphrase-btn" style="flex:1;">Test In Simulator 🔍</button>
              </div>
            </div>

            <!-- Multi-Factor Authentication Challenge -->
            <div style="background:var(--color-bg-surface);border:1px solid var(--color-border);border-radius:var(--radius-lg);padding:var(--space-6);">
              <h2 style="font-size:var(--font-size-lg);color:var(--color-purple);margin-top:0;">3. Two-Factor Authentication (2FA) Defense</h2>
              <p style="font-size:13px;color:var(--color-text-secondary);margin-bottom:var(--space-4);">
                Even if someone steals your password, 2FA stops unauthorized logins in their tracks by requiring a secondary verification token.
              </p>

              <div style="background:var(--color-bg-base);border:1px solid var(--color-border);border-radius:var(--radius-md);padding:var(--space-4);display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-4);">
                <div>
                  <div style="font-weight:bold;font-size:14px;">Vault 2FA Defense Layer</div>
                  <div style="font-size:12px;color:var(--color-text-secondary);" id="cq-2fa-status">Status: Disabled (Single factor vulnerable)</div>
                </div>
                <button type="button" class="cq-btn-primary" id="cq-toggle-2fa-btn" style="padding:8px 16px;font-size:13px;">Enable 2FA 🛡️</button>
              </div>

              <button type="button" class="cq-btn-primary" id="cq-complete-pwd-lab-btn" style="width:100%;background:linear-gradient(135deg, #10b981, #059669);color:#fff;" disabled>
                Complete Vault Mission (Requires Passphrase &amp; 2FA) 🏆
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindSimulatorEvents();
  },

  bindSimulatorEvents() {
    const input = this.container.querySelector('#cq-pwd-input');
    const visBtn = this.container.querySelector('#cq-pwd-toggle-vis');
    const clearBtn = this.container.querySelector('#cq-pwd-clear-btn');
    const gaugeFill = this.container.querySelector('#cq-gauge-fill');
    const gaugeLabel = this.container.querySelector('#cq-gauge-label');
    const metricPool = this.container.querySelector('#cq-metric-pool');
    const metricLen = this.container.querySelector('#cq-metric-len');
    const metricComb = this.container.querySelector('#cq-metric-comb');
    const metricTime = this.container.querySelector('#cq-metric-time');

    const genBtn = this.container.querySelector('#cq-gen-passphrase-btn');
    const testPassphraseBtn = this.container.querySelector('#cq-test-passphrase-btn');
    const passphraseBox = this.container.querySelector('#cq-passphrase-box');

    const toggle2faBtn = this.container.querySelector('#cq-toggle-2fa-btn');
    const status2fa = this.container.querySelector('#cq-2fa-status');
    const completeBtn = this.container.querySelector('#cq-complete-pwd-lab-btn');

    let currentPassphrase = '';

    // Live simulator input event
    const handleInput = () => {
      const val = input.value;
      const res = this.context.utils.evaluatePasswordStrength(val, this.config.weakDictionary, this.config.bruteForceGuessesPerSec);

      metricPool.textContent = res.poolSize;
      metricLen.textContent = res.length;
      metricComb.textContent = typeof res.combinations === 'number' ? this.context.utils.formatNumber(res.combinations) : res.combinations;
      metricTime.textContent = res.timeLabel;

      gaugeFill.style.width = `${res.strengthScore}%`;
      gaugeLabel.textContent = `${res.strengthTier} (${res.strengthScore}%)`;

      if (res.strengthScore >= 80) {
        gaugeFill.style.background = '#10b981';
        gaugeLabel.style.color = '#10b981';
      } else if (res.strengthScore >= 50) {
        gaugeFill.style.background = '#f59e0b';
        gaugeLabel.style.color = '#f59e0b';
      } else {
        gaugeFill.style.background = '#ef4444';
        gaugeLabel.style.color = '#ef4444';
      }
    };

    input?.addEventListener('input', handleInput);

    visBtn?.addEventListener('click', () => {
      input.type = input.type === 'password' ? 'text' : 'password';
      visBtn.textContent = input.type === 'password' ? '👁️' : '🔒';
    });

    clearBtn?.addEventListener('click', () => {
      input.value = '';
      handleInput();
    });

    // Passphrase Generator
    genBtn?.addEventListener('click', () => {
      this.context.audio.playClick();
      const words = this.config.passphraseWordPool;
      const chosen = [];
      for (let i = 0; i < 4; i++) {
        chosen.push(words[Math.floor(Math.random() * words.length)]);
      }
      currentPassphrase = chosen.join('-');
      passphraseBox.textContent = currentPassphrase;
      this.passphraseChallengeCompleted = true;
      this.checkCompletionReady(completeBtn);
    });

    testPassphraseBtn?.addEventListener('click', () => {
      if (currentPassphrase) {
        input.value = currentPassphrase;
        handleInput();
        this.context.audio.playSuccess();
      }
    });

    // 2FA Toggle
    toggle2faBtn?.addEventListener('click', () => {
      this.mfaChallengeCompleted = !this.mfaChallengeCompleted;
      if (this.mfaChallengeCompleted) {
        this.context.audio.playSuccess();
        status2fa.innerHTML = '<span style="color:#10b981;font-weight:bold;">Status: Enabled (Biometric + Hardware Key Active)</span>';
        toggle2faBtn.textContent = '2FA Active ✅';
        toggle2faBtn.style.background = '#10b981';
      } else {
        this.context.audio.playError();
        status2fa.textContent = 'Status: Disabled (Single factor vulnerable)';
        toggle2faBtn.textContent = 'Enable 2FA 🛡️';
        toggle2faBtn.style.background = '';
      }
      this.checkCompletionReady(completeBtn);
    });

    completeBtn?.addEventListener('click', () => {
      this.calculateResults();
    });
  },

  checkCompletionReady(btn) {
    if (this.passphraseChallengeCompleted && this.mfaChallengeCompleted) {
      btn.disabled = false;
      btn.style.opacity = '1';
      btn.style.cursor = 'pointer';
    }
  },

  calculateResults() {
    const earnedXp = 150;
    const recordResult = this.context.state.recordDistrictScore('password', earnedXp, 3);

    this.renderResults({
      earnedXp,
      deltaXp: recordResult.deltaXp,
      stars: 3
    });
  },

  renderResults(data) {
    this.context.audio.playFanfare();
    this.context.guide.say(
      "Vault District secured! You've mastered password entropy, passphrases, and 2FA authentication defenses.",
      'celebrating'
    );

    this.container.innerHTML = `
      <div class="cq-district-view">
        <header class="cq-mission-header">
          <a href="#/city" class="cq-mission-header__back">← Return to CyberCity</a>
          <div class="cq-mission-header__title-group">
            <div class="cq-mission-header__district-name">Vault District Completed</div>
            <h1 class="cq-mission-header__mission-title">Vault Security Debrief</h1>
          </div>
        </header>

        <section class="cq-briefing-card">
          <div class="cq-results-card">
            <div class="cq-results-card__badge">🏆</div>
            <h2>Vault Defense Status: Fully Encrypted</h2>
            <div style="font-size:var(--font-size-lg);color:var(--color-cyan);margin-bottom:var(--space-2);">
              +${data.deltaXp} XP Awarded (District Score: ${data.earnedXp}/150)
            </div>
            ${data.deltaXp === 0 ? `<p style="font-size:12px;color:var(--color-text-muted);">(No XP gain: your previous score was already higher or equal. Differential scoring prevents infinite farming.)</p>` : ''}
          </div>

          <div style="background:var(--color-bg-elevated);border:1px solid var(--color-border);border-radius:var(--radius-md);padding:var(--space-4);margin:var(--space-4) 0;">
            <h3>Key Takeaways for Real-World Security:</h3>
            <ul>
              <li><strong>Length Beats Complexity:</strong> A 4-word random passphrase delivers trillions of times more combinations than an 8-character mixed symbol string.</li>
              <li><strong>Theoretical vs Real-World:</strong> Brute force isn't the primary way passwords are stolen. Credential reuse, phishing, and breaches represent 90%+ of compromises.</li>
              <li><strong>2FA is Non-Negotiable:</strong> Always activate Multi-Factor Authentication on email, school, and gaming platforms.</li>
            </ul>
          </div>

          <div class="cq-briefing-card__actions">
            <button type="button" class="cq-btn-secondary" id="cq-replay-pwd-btn">Test Another Password 🔄</button>
            <a href="#/city" class="cq-btn-primary">Return to CyberCity 🏙️</a>
          </div>
        </section>
      </div>
    `;

    this.container.querySelector('#cq-replay-pwd-btn')?.addEventListener('click', () => {
      this.replay();
    });
  },

  replay() {
    this.context.audio.playClick();
    this.passphraseChallengeCompleted = false;
    this.mfaChallengeCompleted = false;
    this.renderGameplay();
  },

  destroy() {
    // Zero out volatile inputs to guarantee privacy
    const input = this.container?.querySelector('#cq-pwd-input');
    if (input) input.value = '';
    this.config = null;
  }
};

