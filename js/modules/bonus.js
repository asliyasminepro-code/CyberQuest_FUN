/**
 * CyberQuest — District 8: Bonus Alley (Quick Bonus Missions)
 * Houses six distinct, self-contained playable challenges:
 * 1. Evil Twin Wi-Fi (Network Defense)
 * 2. QR Code Trap (Quishing Defense)
 * 3. App Permissions (Mobile Security)
 * 4. Oversharing / Privacy (Digital Footprint)
 * 5. Caesar Cipher (Cryptography)
 * 6. Real or Deepfake (AI Forensics)
 */

export default {
  id: 'bonus',
  title: 'Bonus Alley — Quick Bonus Missions',

  mount(container, context) {
    this.container = container;
    this.context = context;
    this.bonusData = null;
    this.activeChallenge = null;

    this.init();
  },

  async init() {
    try {
      const resp = await fetch('data/bonus.json');
      this.bonusData = await resp.json();
    } catch (e) {
      console.error('Failed to load bonus data:', e);
    }
    this.renderHub();
  },

  renderHub() {
    this.context.guide.say(
      "Bonus Alley unlocked! Six quick tactical challenges await: Wi-Fi defense, QR traps, permissions, privacy, ciphers, and deepfakes!",
      'talking'
    );

    const state = this.context.state.getState();
    const challenges = this.bonusData?.challenges || [];

    this.container.innerHTML = `
      <div class="cq-district-view">
        <header class="cq-mission-header">
          <a href="#/city" class="cq-mission-header__back">← Return to CyberCity</a>
          <div class="cq-mission-header__title-group">
            <div class="cq-mission-header__district-name">District 8: Bonus Alley</div>
            <h1 class="cq-mission-header__mission-title">Six Tactical Challenges</h1>
          </div>
        </header>

        <section class="cq-briefing-card" style="margin-bottom:var(--space-6);">
          <div class="cq-briefing-card__hero">
            <div class="cq-briefing-card__icon">⚡</div>
            <div>
              <h2 class="cq-briefing-card__title">Bonus Operations Arcade</h2>
              <div class="cq-briefing-card__subtitle">Total Bonus XP: 450 (75 XP per challenge)</div>
            </div>
          </div>
          <p style="color:var(--color-text-secondary);margin:0;">
            Select any challenge below. Master all 6 to boost your score toward the ultimate <strong>CyberGuardian</strong> rank (1500 XP)!
          </p>
        </section>

        <!-- 6 Challenge Cards Grid -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(310px, 1fr));gap:var(--space-4);">
          ${challenges.map((c, idx) => {
            const status = state.bonusChallenges[c.id] || { completed: false, score: 0 };
            return `
              <div style="background:var(--color-bg-surface);border:1px solid ${status.completed ? 'var(--color-green)' : 'var(--color-border)'};border-radius:var(--radius-lg);padding:var(--space-5);display:flex;flex-direction:column;justify-content:space-between;box-shadow:var(--shadow-card);">
                <div>
                  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-3);">
                    <span style="font-size:2rem;background:var(--color-bg-elevated);border-radius:var(--radius-md);padding:8px;">${c.icon}</span>
                    <span style="font-size:12px;font-weight:bold;color:${status.completed ? 'var(--color-green)' : 'var(--color-cyan)'};background:var(--color-bg-elevated);padding:4px 10px;border-radius:var(--radius-full);border:1px solid var(--color-border);">
                      ${status.completed ? `Completed (${status.score}/75 XP)` : 'Ready'}
                    </span>
                  </div>
                  <h3 style="font-size:1.15rem;margin:0 0 4px 0;color:#fff;">${idx + 1}. ${this.context.utils.escapeHtml(c.title)}</h3>
                  <div style="font-size:12px;color:var(--color-cyan);font-weight:bold;margin-bottom:8px;">${this.context.utils.escapeHtml(c.subtitle)}</div>
                  <p style="font-size:13px;color:var(--color-text-secondary);line-height:1.45;margin:0 0 var(--space-4) 0;">
                    ${this.context.utils.escapeHtml(c.briefing)}
                  </p>
                </div>
                <button type="button" class="cq-btn-primary cq-launch-challenge-btn" data-id="${c.id}" style="width:100%;font-size:14px;padding:10px;">
                  ${status.completed ? 'Replay Challenge 🔄' : 'Launch Challenge 🚀'}
                </button>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    this.container.querySelectorAll('.cq-launch-challenge-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        const challenge = challenges.find(c => c.id === id);
        if (challenge) {
          this.context.audio.playClick();
          this.activeChallenge = challenge;
          this.renderChallengeBriefing(challenge);
        }
      });
    });
  },

  renderChallengeBriefing(c) {
    this.container.innerHTML = `
      <div class="cq-district-view">
        <header class="cq-mission-header">
          <button type="button" class="cq-mission-header__back" id="cq-back-to-hub">← Return to Bonus Alley</button>
          <div class="cq-mission-header__title-group">
            <div class="cq-mission-header__district-name">Bonus Challenge: ${this.context.utils.escapeHtml(c.subtitle)}</div>
            <h1 class="cq-mission-header__mission-title">${this.context.utils.escapeHtml(c.title)}</h1>
          </div>
        </header>

        <section class="cq-briefing-card">
          <div class="cq-briefing-card__hero">
            <div class="cq-briefing-card__icon">${c.icon}</div>
            <div>
              <h2 class="cq-briefing-card__title">${this.context.utils.escapeHtml(c.title)}</h2>
              <div class="cq-briefing-card__subtitle">${this.context.utils.escapeHtml(c.subtitle)} | Max XP: 75</div>
            </div>
          </div>

          <div class="cq-briefing-card__objectives">
            <p><strong>Challenge Mission Briefing:</strong></p>
            <p style="line-height:1.6;font-size:15px;">${this.context.utils.escapeHtml(c.briefing)}</p>
          </div>

          <div class="cq-briefing-card__actions">
            <button type="button" class="cq-btn-primary" id="cq-start-challenge-play">Start Challenge 🚀</button>
          </div>
        </section>
      </div>
    `;

    this.container.querySelector('#cq-back-to-hub')?.addEventListener('click', () => {
      this.context.audio.playClick();
      this.renderHub();
    });

    this.container.querySelector('#cq-start-challenge-play')?.addEventListener('click', () => {
      this.context.audio.playClick();
      this.dispatchChallengeGameplay(c);
    });
  },

  dispatchChallengeGameplay(c) {
    switch (c.id) {
      case 'evil_twin':
        this.renderEvilTwin(c);
        break;
      case 'qr_trap':
        this.renderQrTrap(c);
        break;
      case 'app_permissions':
        this.renderAppPermissions(c);
        break;
      case 'privacy_oversharing':
        this.renderOversharing(c);
        break;
      case 'caesar_cipher':
        this.renderCaesarCipher(c);
        break;
      case 'deepfake_detective':
        this.renderDeepfake(c);
        break;
      default:
        this.renderHub();
    }
  },

  /* -------------------------------------------------------------
     CHALLENGE 1: Evil Twin Wi-Fi
     ------------------------------------------------------------- */
  renderEvilTwin(c) {
    this.container.innerHTML = `
      <div class="cq-district-view">
        <header class="cq-mission-header">
          <button type="button" class="cq-mission-header__back" id="cq-back-hub-btn">← Bonus Alley</button>
          <div class="cq-mission-header__title-group">
            <div class="cq-mission-header__district-name">Challenge 1: Network Defense</div>
            <h1 class="cq-mission-header__mission-title">Evil Twin Wi-Fi Sweep</h1>
          </div>
        </header>

        <div style="background:var(--color-bg-surface);border:1px solid var(--color-border);border-radius:var(--radius-lg);padding:var(--space-6);">
          <p style="font-size:14px;color:var(--color-text-secondary);margin-bottom:var(--space-4);">
            ${this.context.utils.escapeHtml(c.scenario)} <strong>Select the single legitimate, secure network to connect:</strong>
          </p>

          <div style="display:flex;flex-direction:column;gap:var(--space-3);" id="cq-wifi-list">
            ${c.networks.map(n => `
              <div class="cq-wifi-card" data-id="${n.id}" style="background:var(--color-bg-elevated);border:1px solid var(--color-border);border-radius:var(--radius-md);padding:var(--space-4);cursor:pointer;display:flex;justify-content:space-between;align-items:center;transition:all 0.2s;">
                <div>
                  <div style="font-weight:bold;font-size:16px;color:#fff;margin-bottom:4px;">📶 ${this.context.utils.escapeHtml(n.ssid)}</div>
                  <div style="font-size:13px;color:var(--color-text-secondary);">
                    Security: <strong>${this.context.utils.escapeHtml(n.security)}</strong> | Portal: ${this.context.utils.escapeHtml(n.captivePortal)}
                  </div>
                </div>
                <div style="font-family:var(--font-mono);font-size:14px;color:var(--color-cyan);font-weight:bold;">${n.signal}</div>
              </div>
            `).join('')}
          </div>

          <div id="cq-wifi-feedback" style="display:none;margin-top:var(--space-4);padding:var(--space-4);border-radius:var(--radius-md);"></div>
        </div>
      </div>
    `;

    this.container.querySelector('#cq-back-hub-btn')?.addEventListener('click', () => this.renderHub());

    this.container.querySelectorAll('.cq-wifi-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        const net = c.networks.find(n => n.id === id);
        const fb = this.container.querySelector('#cq-wifi-feedback');

        if (net.isSafe) {
          this.context.audio.playSuccess();
          fb.style.display = 'block';
          fb.style.background = 'rgba(16,185,129,0.15)';
          fb.style.border = '1px solid #10b981';
          fb.innerHTML = `
            <h3 style="color:#10b981;margin:0 0 6px 0;">✅ Correct! Secure Network Connected (+75 XP)</h3>
            <p style="margin:0 0 12px 0;font-size:14px;">${this.context.utils.escapeHtml(net.reason)}</p>
            <button type="button" class="cq-btn-primary" id="cq-wifi-finish">Complete Challenge</button>
          `;
          this.finishChallenge(c.id, 75);
        } else {
          this.context.audio.playError();
          fb.style.display = 'block';
          fb.style.background = 'rgba(239,68,68,0.15)';
          fb.style.border = '1px solid #ef4444';
          fb.innerHTML = `
            <h3 style="color:#ef4444;margin:0 0 6px 0;">⚠️ Danger: Rogue / Insecure Access Point</h3>
            <p style="margin:0;font-size:14px;">${this.context.utils.escapeHtml(net.reason)}</p>
          `;
        }
      });
    });
  },

  /* -------------------------------------------------------------
     CHALLENGE 2: QR Code Trap
     ------------------------------------------------------------- */
  renderQrTrap(c) {
    this.container.innerHTML = `
      <div class="cq-district-view">
        <header class="cq-mission-header">
          <button type="button" class="cq-mission-header__back" id="cq-back-hub-btn">← Bonus Alley</button>
          <div class="cq-mission-header__title-group">
            <div class="cq-mission-header__district-name">Challenge 2: Quishing Defense</div>
            <h1 class="cq-mission-header__mission-title">QR Code Trap Inspector</h1>
          </div>
        </header>

        <div style="background:var(--color-bg-surface);border:1px solid var(--color-border);border-radius:var(--radius-lg);padding:var(--space-6);">
          <p style="font-size:14px;color:var(--color-text-secondary);margin-bottom:var(--space-4);">
            Inspect each simulated QR code poster. Analyze the decoded URL before deciding whether to <strong>Scan &amp; Open</strong> or <strong>Flag as Malicious Trap</strong>:
          </p>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-4);">
            ${c.posters.map((p, idx) => `
              <div style="background:var(--color-bg-elevated);border:1px solid var(--color-border);border-radius:var(--radius-md);padding:var(--space-4);display:flex;flex-direction:column;justify-content:space-between;" id="cq-qr-card-${p.id}">
                <div>
                  <div style="display:flex;align-items:center;gap:8px;font-weight:bold;margin-bottom:6px;">
                    <span style="font-size:1.6rem;">📷</span>
                    <span>${idx + 1}. ${this.context.utils.escapeHtml(p.title)}</span>
                  </div>
                  <p style="font-size:13px;color:var(--color-text-secondary);margin-bottom:8px;">${this.context.utils.escapeHtml(p.visual)}</p>
                  <div style="background:var(--color-bg-base);border:1px solid var(--color-cyan);border-radius:var(--radius-sm);padding:6px 10px;font-family:var(--font-mono);font-size:12px;color:var(--color-cyan);word-break:break-all;margin-bottom:12px;">
                    🔍 ${this.context.utils.escapeHtml(p.decodedUrl)}
                  </div>
                </div>
                <div style="display:flex;gap:8px;" class="cq-qr-actions" data-id="${p.id}">
                  <button type="button" class="cq-btn-secondary cq-qr-scan" data-action="safe" style="flex:1;font-size:13px;padding:6px;">Safe to Scan</button>
                  <button type="button" class="cq-btn-primary cq-qr-trap" data-action="trap" style="flex:1;font-size:13px;padding:6px;background:#ef4444;color:#fff;">Flag Trap 🚩</button>
                </div>
                <div class="cq-qr-result" style="display:none;margin-top:8px;font-size:12px;padding:6px 10px;border-radius:4px;"></div>
              </div>
            `).join('')}
          </div>

          <div style="margin-top:var(--space-6);display:flex;justify-content:flex-end;">
            <button type="button" class="cq-btn-primary" id="cq-finish-qr-btn" disabled style="opacity:0.6;">Submit All 4 Decisions</button>
          </div>
        </div>
      </div>
    `;

    this.container.querySelector('#cq-back-hub-btn')?.addEventListener('click', () => this.renderHub());

    let answered = 0;
    let correct = 0;
    const finishBtn = this.container.querySelector('#cq-finish-qr-btn');

    this.container.querySelectorAll('.cq-qr-actions button').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const parent = e.currentTarget.parentElement;
        const id = parent.dataset.id;
        const poster = c.posters.find(p => p.id === id);
        const action = e.currentTarget.dataset.action;
        const userThinksSafe = action === 'safe';

        parent.style.display = 'none';
        const resultDiv = parent.parentElement.querySelector('.cq-qr-result');
        resultDiv.style.display = 'block';

        const isCorrect = userThinksSafe === poster.isSafe;
        if (isCorrect) {
          correct++;
          resultDiv.style.background = 'rgba(16,185,129,0.15)';
          resultDiv.style.color = '#10b981';
          resultDiv.textContent = `✅ Correct: ${poster.explanation}`;
        } else {
          resultDiv.style.background = 'rgba(239,68,68,0.15)';
          resultDiv.style.color = '#ef4444';
          resultDiv.textContent = `❌ Mistake: ${poster.explanation}`;
        }

        answered++;
        if (answered >= c.posters.length) {
          finishBtn.disabled = false;
          finishBtn.style.opacity = '1';
          finishBtn.style.cursor = 'pointer';
        }
      });
    });

    finishBtn.addEventListener('click', () => {
      const score = Math.round((correct / c.posters.length) * 75);
      this.finishChallenge(c.id, score);
    });
  },

  /* -------------------------------------------------------------
     CHALLENGE 3: App Permissions
     ------------------------------------------------------------- */
  renderAppPermissions(c) {
    this.container.innerHTML = `
      <div class="cq-district-view">
        <header class="cq-mission-header">
          <button type="button" class="cq-mission-header__back" id="cq-back-hub-btn">← Bonus Alley</button>
          <div class="cq-mission-header__title-group">
            <div class="cq-mission-header__district-name">Challenge 3: Mobile Security</div>
            <h1 class="cq-mission-header__mission-title">App Permission Hardening</h1>
          </div>
        </header>

        <div style="background:var(--color-bg-surface);border:1px solid var(--color-border);border-radius:var(--radius-lg);padding:var(--space-6);">
          <p style="font-size:14px;color:var(--color-text-secondary);margin-bottom:var(--space-4);">
            Apply the <strong>Principle of Least Privilege</strong>. Toggle OFF any invasive or unnecessary permissions that the app does not legitimately require:
          </p>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-6);">
            ${c.apps.map(app => `
              <div style="background:var(--color-bg-elevated);border:1px solid var(--color-border);border-radius:var(--radius-md);padding:var(--space-4);">
                <div style="display:flex;align-items:center;gap:10px;margin-bottom:var(--space-3);padding-bottom:var(--space-2);border-bottom:1px solid var(--color-border);">
                  <span style="font-size:2rem;">${app.icon}</span>
                  <div>
                    <div style="font-weight:bold;font-size:16px;">${this.context.utils.escapeHtml(app.name)}</div>
                    <div style="font-size:12px;color:var(--color-cyan);">Permission Review Required</div>
                  </div>
                </div>

                <div style="display:flex;flex-direction:column;gap:8px;">
                  ${app.permissions.map(p => `
                    <label style="display:flex;align-items:center;justify-content:space-between;background:var(--color-bg-base);padding:8px 12px;border-radius:var(--radius-sm);cursor:pointer;font-size:13px;">
                      <span>${this.context.utils.escapeHtml(p.label)}</span>
                      <input type="checkbox" class="cq-perm-check" data-app="${app.id}" data-perm="${p.id}" checked style="width:18px;height:18px;accent-color:var(--color-cyan);" />
                    </label>
                  `).join('')}
                </div>
              </div>
            `).join('')}
          </div>

          <div style="margin-top:var(--space-6);display:flex;justify-content:flex-end;">
            <button type="button" class="cq-btn-primary" id="cq-verify-perms-btn">Lock In Safe Permissions 🛡️</button>
          </div>
        </div>
      </div>
    `;

    this.container.querySelector('#cq-back-hub-btn')?.addEventListener('click', () => this.renderHub());

    this.container.querySelector('#cq-verify-perms-btn')?.addEventListener('click', () => {
      let correct = 0;
      let total = 0;

      c.apps.forEach(app => {
        app.permissions.forEach(p => {
          total++;
          const chk = this.container.querySelector(`input[data-app="${app.id}"][data-perm="${p.id}"]`);
          const isChecked = chk.checked;
          if (isChecked === p.required) {
            correct++;
          }
        });
      });

      const score = Math.round((correct / total) * 75);
      this.finishChallenge(c.id, score);
    });
  },

  /* -------------------------------------------------------------
     CHALLENGE 4: Oversharing / Privacy
     ------------------------------------------------------------- */
  renderOversharing(c) {
    this.container.innerHTML = `
      <div class="cq-district-view">
        <header class="cq-mission-header">
          <button type="button" class="cq-mission-header__back" id="cq-back-hub-btn">← Bonus Alley</button>
          <div class="cq-mission-header__title-group">
            <div class="cq-mission-header__district-name">Challenge 4: Digital Footprint</div>
            <h1 class="cq-mission-header__mission-title">Oversharing &amp; Privacy Audit</h1>
          </div>
        </header>

        <div style="background:var(--color-bg-surface);border:1px solid var(--color-border);border-radius:var(--radius-lg);padding:var(--space-6);">
          <p style="font-size:14px;color:var(--color-text-secondary);margin-bottom:var(--space-4);">
            Review these 4 draft social posts. Flag each as either <strong>Safe to Share</strong> or <strong>Oversharing Risk</strong>:
          </p>

          <div style="display:flex;flex-direction:column;gap:var(--space-4);">
            ${c.posts.map((p, idx) => `
              <div style="background:var(--color-bg-elevated);border:1px solid var(--color-border);border-radius:var(--radius-md);padding:var(--space-4);">
                <div style="font-size:12px;color:var(--color-cyan);font-weight:bold;margin-bottom:4px;">Post #${idx + 1} by @${p.author}</div>
                <div style="font-size:15px;line-height:1.5;margin-bottom:12px;color:#fff;">${this.context.utils.escapeHtml(p.content)}</div>
                
                <div class="cq-post-actions" data-id="${p.id}" style="display:flex;gap:10px;">
                  <button type="button" class="cq-btn-secondary cq-post-safe" data-safe="true" style="border-color:#10b981;color:#10b981;font-size:13px;padding:6px 14px;">✅ Safe to Share</button>
                  <button type="button" class="cq-btn-secondary cq-post-risky" data-safe="false" style="border-color:#ef4444;color:#ef4444;font-size:13px;padding:6px 14px;">⚠️ Oversharing Risk</button>
                </div>
                <div class="cq-post-fb" style="display:none;margin-top:8px;font-size:13px;padding:8px;border-radius:4px;"></div>
              </div>
            `).join('')}
          </div>

          <div style="margin-top:var(--space-6);display:flex;justify-content:flex-end;">
            <button type="button" class="cq-btn-primary" id="cq-finish-posts-btn" disabled style="opacity:0.6;">Submit Social Audit</button>
          </div>
        </div>
      </div>
    `;

    this.container.querySelector('#cq-back-hub-btn')?.addEventListener('click', () => this.renderHub());

    let answered = 0;
    let correct = 0;
    const finishBtn = this.container.querySelector('#cq-finish-posts-btn');

    this.container.querySelectorAll('.cq-post-actions button').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const parent = e.currentTarget.parentElement;
        const id = parent.dataset.id;
        const post = c.posts.find(p => p.id === id);
        const userThinksSafe = e.currentTarget.dataset.safe === 'true';

        parent.style.display = 'none';
        const fb = parent.parentElement.querySelector('.cq-post-fb');
        fb.style.display = 'block';

        const isCorrect = userThinksSafe === !post.isRisky;
        if (isCorrect) {
          correct++;
          fb.style.background = 'rgba(16,185,129,0.15)';
          fb.style.color = '#10b981';
          fb.textContent = `✅ Correct verdict: ${post.explanation}`;
        } else {
          fb.style.background = 'rgba(239,68,68,0.15)';
          fb.style.color = '#ef4444';
          fb.textContent = `❌ Mistake: ${post.explanation}`;
        }

        answered++;
        if (answered >= c.posts.length) {
          finishBtn.disabled = false;
          finishBtn.style.opacity = '1';
          finishBtn.style.cursor = 'pointer';
        }
      });
    });

    finishBtn.addEventListener('click', () => {
      const score = Math.round((correct / c.posts.length) * 75);
      this.finishChallenge(c.id, score);
    });
  },

  /* -------------------------------------------------------------
     CHALLENGE 5: Caesar Cipher
     ------------------------------------------------------------- */
  renderCaesarCipher(c) {
    this.container.innerHTML = `
      <div class="cq-district-view">
        <header class="cq-mission-header">
          <button type="button" class="cq-mission-header__back" id="cq-back-hub-btn">← Bonus Alley</button>
          <div class="cq-mission-header__title-group">
            <div class="cq-mission-header__district-name">Challenge 5: Cryptography</div>
            <h1 class="cq-mission-header__mission-title">Caesar Cipher Decryption</h1>
          </div>
        </header>

        <div style="background:var(--color-bg-surface);border:1px solid var(--color-border);border-radius:var(--radius-lg);padding:var(--space-6);max-width:760px;margin:0 auto;">
          <div style="background:var(--color-bg-elevated);border-left:4px solid var(--color-cyan);border-radius:var(--radius-sm);padding:var(--space-4);margin-bottom:var(--space-6);">
            <div style="font-size:13px;color:var(--color-text-secondary);text-transform:uppercase;font-weight:bold;">Intercepted Transmission (Shift Key: +${c.cipherKey}):</div>
            <div style="font-family:var(--font-mono);font-size:24px;color:var(--color-cyan);letter-spacing:4px;font-weight:bold;margin:8px 0;">${c.ciphertext}</div>
            <div style="font-size:13px;color:var(--color-yellow);">${c.hint}</div>
          </div>

          <!-- Interactive Alphabet Cipher Tool -->
          <div style="background:var(--color-bg-base);border:1px solid var(--color-border);border-radius:var(--radius-md);padding:var(--space-4);margin-bottom:var(--space-6);font-family:var(--font-mono);font-size:13px;overflow-x:auto;">
            <div style="color:var(--color-text-secondary);margin-bottom:4px;">Original Alphabet:  A B C D E F G H I J K L M N O P Q R S T U V W X Y Z</div>
            <div style="color:var(--color-cyan);">Shifted (+3):       D E F G H I J K L M N O P Q R S T U V W X Y Z A B C</div>
          </div>

          <div style="margin-bottom:var(--space-6);">
            <label for="cq-caesar-input" style="display:block;font-size:14px;font-weight:bold;margin-bottom:6px;">Type Plaintext Solution:</label>
            <input 
              type="text" 
              id="cq-caesar-input" 
              placeholder="Type decrypted message in CAPITAL LETTERS..." 
              style="width:100%;background:var(--color-bg-base);border:1px solid var(--color-border);border-radius:var(--radius-sm);padding:12px 16px;color:#fff;font-family:var(--font-mono);font-size:18px;letter-spacing:2px;text-transform:uppercase;" 
            />
          </div>

          <div style="display:flex;justify-content:flex-end;">
            <button type="button" class="cq-btn-primary" id="cq-verify-cipher-btn">Decrypt Message 🔓</button>
          </div>

          <div id="cq-cipher-feedback" style="display:none;margin-top:var(--space-4);padding:var(--space-4);border-radius:var(--radius-md);"></div>
        </div>
      </div>
    `;

    this.container.querySelector('#cq-back-hub-btn')?.addEventListener('click', () => this.renderHub());

    const input = this.container.querySelector('#cq-caesar-input');
    const verifyBtn = this.container.querySelector('#cq-verify-cipher-btn');
    const fb = this.container.querySelector('#cq-cipher-feedback');

    verifyBtn?.addEventListener('click', () => {
      const val = input.value.trim().toUpperCase();
      if (val === c.plaintext) {
        this.context.audio.playSuccess();
        fb.style.display = 'block';
        fb.style.background = 'rgba(16,185,129,0.15)';
        fb.style.border = '1px solid #10b981';
        fb.innerHTML = `
          <h3 style="color:#10b981;margin:0 0 6px 0;">🎉 Cipher Broken! (+75 XP)</h3>
          <p style="margin:0 0 12px 0;font-size:14px;">${this.context.utils.escapeHtml(c.explanation)}</p>
          <button type="button" class="cq-btn-primary" id="cq-cipher-done">Complete Challenge</button>
        `;
        document.getElementById('cq-cipher-done')?.addEventListener('click', () => {
          this.finishChallenge(c.id, 75);
        });
      } else {
        this.context.audio.playError();
        fb.style.display = 'block';
        fb.style.background = 'rgba(239,68,68,0.15)';
        fb.style.border = '1px solid #ef4444';
        fb.textContent = '❌ Decryption mismatch. Remember to shift each letter backward by 3 (W -> T, K -> H, etc.). Try again!';
      }
    });
  },

  /* -------------------------------------------------------------
     CHALLENGE 6: Real or Deepfake
     ------------------------------------------------------------- */
  renderDeepfake(c) {
    this.container.innerHTML = `
      <div class="cq-district-view">
        <header class="cq-mission-header">
          <button type="button" class="cq-mission-header__back" id="cq-back-hub-btn">← Bonus Alley</button>
          <div class="cq-mission-header__title-group">
            <div class="cq-mission-header__district-name">Challenge 6: AI Forensics</div>
            <h1 class="cq-mission-header__mission-title">Real or Deepfake Inspector</h1>
          </div>
        </header>

        <div style="background:var(--color-bg-surface);border:1px solid var(--color-border);border-radius:var(--radius-lg);padding:var(--space-6);">
          <p style="font-size:14px;color:var(--color-text-secondary);margin-bottom:var(--space-4);">
            Inspect the visual descriptions of these two candidate portraits. Use forensic optical cues (earring symmetry, pupil light reflections, background warped geometry) to identify which is authentic and which is a synthetic deepfake:
          </p>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-6);">
            ${c.items.map(item => `
              <div style="background:var(--color-bg-elevated);border:1px solid var(--color-border);border-radius:var(--radius-md);padding:var(--space-4);display:flex;flex-direction:column;justify-content:space-between;">
                <div>
                  <div style="font-weight:bold;font-size:18px;color:#fff;margin-bottom:8px;">${this.context.utils.escapeHtml(item.title)}</div>
                  <p style="font-size:14px;line-height:1.5;color:var(--color-text-secondary);margin-bottom:12px;">
                    ${this.context.utils.escapeHtml(item.description)}
                  </p>
                  <div style="background:var(--color-bg-base);padding:8px 12px;border-radius:var(--radius-sm);font-size:12px;color:var(--color-cyan);margin-bottom:16px;">
                    <strong>Visual Inspection Clues:</strong>
                    <ul style="margin:4px 0 0 16px;padding:0;">
                      ${item.clues.map(clue => `<li>${this.context.utils.escapeHtml(clue)}</li>`).join('')}
                    </ul>
                  </div>
                </div>

                <div class="cq-df-actions" data-id="${item.id}" style="display:flex;gap:8px;">
                  <button type="button" class="cq-btn-secondary cq-btn-real" data-guess="real" style="flex:1;border-color:#10b981;color:#10b981;">Authentic Human</button>
                  <button type="button" class="cq-btn-primary cq-btn-fake" data-guess="fake" style="flex:1;background:#a855f7;color:#fff;">Synthetic Deepfake 🤖</button>
                </div>
                <div class="cq-df-fb" style="display:none;margin-top:8px;font-size:12px;padding:8px;border-radius:4px;"></div>
              </div>
            `).join('')}
          </div>

          <div style="margin-top:var(--space-6);display:flex;justify-content:flex-end;">
            <button type="button" class="cq-btn-primary" id="cq-finish-df-btn" disabled style="opacity:0.6;">Submit Forensic Report</button>
          </div>
        </div>
      </div>
    `;

    this.container.querySelector('#cq-back-hub-btn')?.addEventListener('click', () => this.renderHub());

    let answered = 0;
    let correct = 0;
    const finishBtn = this.container.querySelector('#cq-finish-df-btn');

    this.container.querySelectorAll('.cq-df-actions button').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const parent = e.currentTarget.parentElement;
        const id = parent.dataset.id;
        const item = c.items.find(i => i.id === id);
        const userThinksDeepfake = e.currentTarget.dataset.guess === 'fake';

        parent.style.display = 'none';
        const fb = parent.parentElement.querySelector('.cq-df-fb');
        fb.style.display = 'block';

        const isCorrect = userThinksDeepfake === item.isDeepfake;
        if (isCorrect) {
          correct++;
          fb.style.background = 'rgba(16,185,129,0.15)';
          fb.style.color = '#10b981';
          fb.textContent = `✅ Correct: ${item.explanation}`;
        } else {
          fb.style.background = 'rgba(239,68,68,0.15)';
          fb.style.color = '#ef4444';
          fb.textContent = `❌ Mistake: ${item.explanation}`;
        }

        answered++;
        if (answered >= c.items.length) {
          finishBtn.disabled = false;
          finishBtn.style.opacity = '1';
          finishBtn.style.cursor = 'pointer';
        }
      });
    });

    finishBtn.addEventListener('click', () => {
      const score = Math.round((correct / c.items.length) * 75);
      this.finishChallenge(c.id, score);
    });
  },

  /* Common Results Flow for Bonus Challenges */
  finishChallenge(challengeId, score) {
    const res = this.context.state.recordBonusChallengeScore(challengeId, score);

    if (score >= 50) {
      this.context.audio.playFanfare();
      this.context.guide.say("Tactical Bonus Challenge Accomplished! Bonus XP added to your dossier.", 'celebrating');
    } else {
      this.context.guide.say("Challenge completed. You can replay anytime to improve your score!", 'talking');
    }

    this.container.innerHTML = `
      <div class="cq-district-view">
        <header class="cq-mission-header">
          <button type="button" class="cq-mission-header__back" id="cq-return-hub">← Return to Bonus Alley</button>
          <div class="cq-mission-header__title-group">
            <div class="cq-mission-header__district-name">Bonus Challenge Finished</div>
            <h1 class="cq-mission-header__mission-title">Mission Debrief</h1>
          </div>
        </header>

        <section class="cq-briefing-card">
          <div class="cq-results-card">
            <div class="cq-results-card__badge">⚡</div>
            <h2>Challenge Score: ${score} / 75 XP</h2>
            <div style="font-size:var(--font-size-lg);color:var(--color-cyan);margin-bottom:var(--space-2);">
              +${res.deltaXp} XP Awarded Toward CyberGuardian Rank
            </div>
            ${res.deltaXp === 0 ? `<p style="font-size:12px;color:var(--color-text-muted);">(No XP gain: your previous score was already higher or equal. Differential scoring prevents infinite farming.)</p>` : ''}
          </div>

          <div class="cq-briefing-card__actions" style="margin-top:var(--space-6);">
            <button type="button" class="cq-btn-secondary" id="cq-replay-current-btn">Replay Challenge 🔄</button>
            <button type="button" class="cq-btn-primary" id="cq-hub-done-btn">Back to Bonus Alley Hub ⚡</button>
          </div>
        </section>
      </div>
    `;

    this.container.querySelector('#cq-return-hub')?.addEventListener('click', () => this.renderHub());
    this.container.querySelector('#cq-hub-done-btn')?.addEventListener('click', () => this.renderHub());
    this.container.querySelector('#cq-replay-current-btn')?.addEventListener('click', () => {
      this.context.audio.playClick();
      const ch = this.bonusData.challenges.find(x => x.id === challengeId);
      if (ch) this.dispatchChallengeGameplay(ch);
    });
  },

  destroy() {
    this.bonusData = null;
    this.activeChallenge = null;
  }
};

