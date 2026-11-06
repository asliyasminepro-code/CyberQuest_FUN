/**
 * CyberQuest — District 7: AI Lab (AI and Cybersecurity)
 * Interactive challenges analyzing AI safety, prompt injection, voice cloning, and data leakage hygiene.
 */

export default {
  id: 'ai',
  title: 'AI Lab — AI and Cybersecurity',

  mount(container, context) {
    this.container = container;
    this.context = context;
    this.challenges = [];
    this.currentIndex = 0;
    this.score = 0;
    this.answers = [];

    this.init();
  },

  async init() {
    try {
      const resp = await fetch('data/ai-messages.json');
      this.challenges = await resp.json();
    } catch (e) {
      console.error('Failed to load AI data:', e);
    }
    this.renderBriefing();
  },

  renderBriefing() {
    this.context.guide.say(
      "AI Lab online! Generative AI is a powerful tool, but deepfakes and data leaks require vigilant defenses. Stay sharp!",
      'talking'
    );

    this.container.innerHTML = `
      <div class="cq-district-view">
        <header class="cq-mission-header">
          <a href="#/city" class="cq-mission-header__back">← Return to CyberCity</a>
          <div class="cq-mission-header__title-group">
            <div class="cq-mission-header__district-name">District 7: AI Lab</div>
            <h1 class="cq-mission-header__mission-title">AI &amp; Cybersecurity</h1>
          </div>
        </header>

        <section class="cq-briefing-card" aria-label="Mission Briefing">
          <div class="cq-briefing-card__hero">
            <div class="cq-briefing-card__icon">🤖</div>
            <div>
              <h2 class="cq-briefing-card__title">Operation: Neural Safeguard</h2>
              <div class="cq-briefing-card__subtitle">Threat Level: Emerging Frontier | Max XP: 150</div>
            </div>
          </div>

          <div class="cq-briefing-card__objectives">
            <p><strong>Mission Objectives:</strong></p>
            <ul>
              <li>Analyze <strong>6 emerging AI cybersecurity challenges</strong>.</li>
              <li>Recognize AI voice cloning emergency scams and establish family verification protocols.</li>
              <li>Learn strict data boundaries for interacting with public LLMs and homework chatbots.</li>
              <li>Understand adversarial prompt injection and automated AI-generated phishing.</li>
              <li>Fact-check AI hallucinations and explore responsible safety guardrails.</li>
            </ul>
          </div>

          <div class="cq-briefing-card__actions">
            <button type="button" class="cq-btn-primary" id="cq-start-ai-btn">Initialize Neural Defense 🚀</button>
          </div>
        </section>
      </div>
    `;

    this.container.querySelector('#cq-start-ai-btn')?.addEventListener('click', () => {
      this.context.audio.playClick();
      this.renderGameplay();
    });
  },

  renderGameplay() {
    this.currentIndex = 0;
    this.score = 0;
    this.answers = [];
    this.renderChallenge();
  },

  renderChallenge() {
    const c = this.challenges[this.currentIndex];
    const total = this.challenges.length;

    this.container.innerHTML = `
      <div class="cq-district-view">
        <header class="cq-mission-header">
          <a href="#/city" class="cq-mission-header__back">← CyberCity</a>
          <div class="cq-mission-header__title-group">
            <div class="cq-mission-header__district-name">AI Lab — Scenario ${this.currentIndex + 1} of ${total}</div>
            <h1 class="cq-mission-header__mission-title">${this.context.utils.escapeHtml(c.title)}</h1>
          </div>
        </header>

        <div style="background:var(--color-bg-surface);border:1px solid var(--color-border);border-radius:var(--radius-lg);padding:var(--space-8);box-shadow:var(--shadow-elevation);">
          
          <div style="background:var(--color-bg-elevated);border-left:4px solid var(--color-purple);border-radius:var(--radius-sm);padding:var(--space-4);margin-bottom:var(--space-6);font-size:15px;line-height:1.6;">
            <p style="margin:0 0 8px 0;"><strong>Situation:</strong> ${this.context.utils.escapeHtml(c.scenario)}</p>
            <p style="margin:0;color:var(--color-cyan);font-weight:bold;">${this.context.utils.escapeHtml(c.question)}</p>
          </div>

          <div style="display:flex;flex-direction:column;gap:var(--space-3);" id="cq-ai-options">
            ${c.options.map((opt, idx) => `
              <button type="button" class="cq-ai-opt-btn" data-index="${idx}" style="background:var(--color-bg-elevated);border:1px solid var(--color-border);border-radius:var(--radius-md);padding:var(--space-4);text-align:left;color:#fff;font-size:14.5px;cursor:pointer;transition:all 0.2s;line-height:1.45;">
                <span style="font-weight:bold;color:var(--color-purple);margin-right:8px;">[${String.fromCharCode(65 + idx)}]</span>
                ${this.context.utils.escapeHtml(opt)}
              </button>
            `).join('')}
          </div>

          <!-- Feedback Box -->
          <div id="cq-ai-feedback-box" style="display:none;margin-top:var(--space-6);padding:var(--space-4);border-radius:var(--radius-md);">
            <div id="cq-ai-feedback-title" style="font-weight:bold;font-size:16px;margin-bottom:6px;"></div>
            <div id="cq-ai-feedback-text" style="font-size:14px;line-height:1.5;"></div>
            <div style="margin-top:var(--space-4);display:flex;justify-content:flex-end;">
              <button type="button" class="cq-btn-primary" id="cq-next-ai-btn">Next AI Scenario →</button>
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindChallengeEvents(c);
  },

  bindChallengeEvents(c) {
    const btns = this.container.querySelectorAll('.cq-ai-opt-btn');
    const feedbackBox = this.container.querySelector('#cq-ai-feedback-box');
    const feedbackTitle = this.container.querySelector('#cq-ai-feedback-title');
    const feedbackText = this.container.querySelector('#cq-ai-feedback-text');
    const nextBtn = this.container.querySelector('#cq-next-ai-btn');

    btns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const selectedIdx = parseInt(e.currentTarget.dataset.index, 10);
        btns.forEach(b => {
          b.disabled = true;
          b.style.cursor = 'default';
        });

        const isCorrect = selectedIdx === c.correctIndex;
        this.answers.push({ c, selectedIdx, isCorrect });

        if (isCorrect) {
          this.score += 25;
          this.context.audio.playSuccess();
          btn.style.borderColor = '#10b981';
          btn.style.background = 'rgba(16,185,129,0.2)';
          feedbackBox.style.background = 'rgba(16,185,129,0.1)';
          feedbackBox.style.border = '1px solid #10b981';
          feedbackTitle.style.color = '#10b981';
          feedbackTitle.textContent = '✅ OPTIMAL AI SAFETY VERDICT (+25 XP)';
        } else {
          this.context.audio.playError();
          btn.style.borderColor = '#ef4444';
          btn.style.background = 'rgba(239,68,68,0.2)';
          btns[c.correctIndex].style.borderColor = '#10b981';
          btns[c.correctIndex].style.background = 'rgba(16,185,129,0.2)';
          feedbackBox.style.background = 'rgba(239,68,68,0.1)';
          feedbackBox.style.border = '1px solid #ef4444';
          feedbackTitle.style.color = '#ef4444';
          feedbackTitle.textContent = '❌ SUB-OPTIMAL / DATA LEAK RISK (+0 XP)';
        }

        feedbackText.textContent = c.explanation;
        feedbackBox.style.display = 'block';

        nextBtn.addEventListener('click', () => {
          this.context.audio.playClick();
          if (this.currentIndex + 1 < this.challenges.length) {
            this.currentIndex++;
            this.renderChallenge();
          } else {
            this.calculateResults();
          }
        });
      });
    });
  },

  calculateResults() {
    const total = this.challenges.length;
    const correctCount = this.answers.filter(a => a.isCorrect).length;
    const accuracy = Math.round((correctCount / total) * 100);

    let earnedXp = Math.min(150, correctCount * 25);
    let stars = 1;
    if (accuracy >= 80) stars = 3;
    else if (accuracy >= 60) stars = 2;

    const recordResult = this.context.state.recordDistrictScore('ai', earnedXp, stars);

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
      this.context.guide.say("AI Lab Mastered! You have the forensic knowledge to navigate synthetic media responsibly.", 'celebrating');
    } else {
      this.context.guide.say("Good effort! Remember: never share credentials or personal secrets with generative AI chatbots.", 'talking');
    }

    this.container.innerHTML = `
      <div class="cq-district-view">
        <header class="cq-mission-header">
          <a href="#/city" class="cq-mission-header__back">← Return to CyberCity</a>
          <div class="cq-mission-header__title-group">
            <div class="cq-mission-header__district-name">AI Lab Completed</div>
            <h1 class="cq-mission-header__mission-title">AI Defense Certification</h1>
          </div>
        </header>

        <section class="cq-briefing-card">
          <div class="cq-results-card">
            <div class="cq-results-card__badge">${data.stars === 3 ? '🏆' : data.stars === 2 ? '⭐' : '🛡️'}</div>
            <h2>AI Defense Score: ${data.earnedXp} / 150 (${data.accuracy}%)</h2>
            <div style="font-size:var(--font-size-lg);color:var(--color-cyan);margin-bottom:var(--space-2);">
              +${data.deltaXp} XP Awarded
            </div>
            ${data.deltaXp === 0 ? `<p style="font-size:12px;color:var(--color-text-muted);">(No XP gain: your previous score was already higher or equal. Differential scoring prevents infinite farming.)</p>` : ''}
          </div>

          <div style="background:var(--color-bg-elevated);border:1px solid var(--color-border);border-radius:var(--radius-md);padding:var(--space-4);margin:var(--space-4) 0;">
            <h3>Golden Rules of AI Cybersecurity:</h3>
            <ul>
              <li><strong>Zero PII in Chatbots:</strong> Never paste real names, passwords, or family schedules into AI prompts.</li>
              <li><strong>Family Safe Word:</strong> Establish an offline secret code to defeat AI voice cloning emergency calls.</li>
              <li><strong>Scrutinize Perfection:</strong> AI phishing is grammatically perfect. Look at sender domains and URLs, not just spelling.</li>
            </ul>
          </div>

          <div class="cq-briefing-card__actions">
            <button type="button" class="cq-btn-secondary" id="cq-replay-ai-btn">Re-run AI Scenarios 🔄</button>
            <a href="#/city" class="cq-btn-primary">Return to CyberCity 🏙️</a>
          </div>
        </section>
      </div>
    `;

    this.container.querySelector('#cq-replay-ai-btn')?.addEventListener('click', () => {
      this.replay();
    });
  },

  replay() {
    this.context.audio.playClick();
    this.renderGameplay();
  },

  destroy() {
    this.challenges = [];
    this.answers = [];
  }
};

