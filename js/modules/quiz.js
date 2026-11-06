/**
 * CyberQuest — District 5: Academy (Cybersecurity Quiz)
 * Comprehensive knowledge arena testing malware, network safety, MFA, backups, and defensive hygiene.
 */

export default {
  id: 'quiz',
  title: 'Academy — Cybersecurity Quiz',

  mount(container, context) {
    this.container = container;
    this.context = context;
    this.questions = [];
    this.currentIndex = 0;
    this.score = 0;
    this.streak = 0;
    this.maxStreak = 0;
    this.answers = [];

    this.init();
  },

  async init() {
    try {
      const resp = await fetch('data/quiz.json');
      this.questions = await resp.json();
    } catch (e) {
      console.error('Failed to load quiz data:', e);
    }
    this.renderBriefing();
  },

  renderBriefing() {
    this.context.guide.say(
      "Academy Amphitheater ready! Test your full tactical cybersecurity knowledge. Accuracy and streaks earn bonus XP!",
      'talking'
    );

    this.container.innerHTML = `
      <div class="cq-district-view">
        <header class="cq-mission-header">
          <a href="#/city" class="cq-mission-header__back">← Return to CyberCity</a>
          <div class="cq-mission-header__title-group">
            <div class="cq-mission-header__district-name">District 5: Academy</div>
            <h1 class="cq-mission-header__mission-title">Cybersecurity Quiz Arena</h1>
          </div>
        </header>

        <section class="cq-briefing-card" aria-label="Mission Briefing">
          <div class="cq-briefing-card__hero">
            <div class="cq-briefing-card__icon">🏛️</div>
            <div>
              <h2 class="cq-briefing-card__title">Operation: Terminal Trial</h2>
              <div class="cq-briefing-card__subtitle">Threat Level: Comprehensive | Max XP: 150</div>
            </div>
          </div>

          <div class="cq-briefing-card__objectives">
            <p><strong>Mission Objectives:</strong></p>
            <ul>
              <li>Answer 10 comprehensive cybersecurity questions across core security domains.</li>
              <li>Master malware definitions (viruses, trojans, ransomware, worms).</li>
              <li>Demonstrate network protocol knowledge (HTTPS encryption, Wi-Fi security).</li>
              <li>Apply multi-factor authentication and the 3-2-1 backup strategy.</li>
              <li>Build consecutive answer streaks to achieve the maximum 150 XP reward.</li>
            </ul>
          </div>

          <div class="cq-briefing-card__actions">
            <button type="button" class="cq-btn-primary" id="cq-start-quiz-btn">Begin Knowledge Trial 🚀</button>
          </div>
        </section>
      </div>
    `;

    this.container.querySelector('#cq-start-quiz-btn')?.addEventListener('click', () => {
      this.context.audio.playClick();
      this.renderGameplay();
    });
  },

  renderGameplay() {
    this.currentIndex = 0;
    this.score = 0;
    this.streak = 0;
    this.maxStreak = 0;
    this.answers = [];
    this.renderQuestion();
  },

  renderQuestion() {
    const q = this.questions[this.currentIndex];
    const total = this.questions.length;

    this.container.innerHTML = `
      <div class="cq-district-view">
        <header class="cq-mission-header">
          <a href="#/city" class="cq-mission-header__back">← CyberCity</a>
          <div class="cq-mission-header__title-group">
            <div class="cq-mission-header__district-name">Academy Trial — Question ${this.currentIndex + 1} of ${total}</div>
            <h1 class="cq-mission-header__mission-title">Streak: 🔥 ${this.streak}</h1>
          </div>
        </header>

        <div style="background:var(--color-bg-surface);border:1px solid var(--color-border);border-radius:var(--radius-lg);padding:var(--space-8);box-shadow:var(--shadow-elevation);">
          <div style="font-size:18px;font-weight:bold;color:#fff;line-height:1.45;margin-bottom:var(--space-6);">
            ${this.context.utils.escapeHtml(q.question)}
          </div>

          <div style="display:flex;flex-direction:column;gap:var(--space-3);" id="cq-quiz-options">
            ${q.options.map((opt, idx) => `
              <button type="button" class="cq-quiz-opt-btn" data-index="${idx}" style="background:var(--color-bg-elevated);border:1px solid var(--color-border);border-radius:var(--radius-md);padding:var(--space-4);text-align:left;color:#fff;font-size:14.5px;cursor:pointer;transition:all 0.2s;line-height:1.4;">
                <span style="font-weight:bold;color:var(--color-cyan);margin-right:8px;">[${String.fromCharCode(65 + idx)}]</span>
                ${this.context.utils.escapeHtml(opt)}
              </button>
            `).join('')}
          </div>

          <!-- Explanation Box -->
          <div id="cq-quiz-expl-box" style="display:none;margin-top:var(--space-6);padding:var(--space-4);border-radius:var(--radius-md);">
            <div id="cq-quiz-expl-title" style="font-weight:bold;font-size:16px;margin-bottom:6px;"></div>
            <div id="cq-quiz-expl-text" style="font-size:14px;line-height:1.5;"></div>
            <div style="margin-top:var(--space-4);display:flex;justify-content:flex-end;">
              <button type="button" class="cq-btn-primary" id="cq-next-quiz-btn">Next Question →</button>
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindQuestionEvents(q);
  },

  bindQuestionEvents(q) {
    const btns = this.container.querySelectorAll('.cq-quiz-opt-btn');
    const explBox = this.container.querySelector('#cq-quiz-expl-box');
    const explTitle = this.container.querySelector('#cq-quiz-expl-title');
    const explText = this.container.querySelector('#cq-quiz-expl-text');
    const nextBtn = this.container.querySelector('#cq-next-quiz-btn');

    btns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const selectedIdx = parseInt(e.currentTarget.dataset.index, 10);
        btns.forEach(b => {
          b.disabled = true;
          b.style.cursor = 'default';
        });

        const isCorrect = selectedIdx === q.correctIndex;
        this.answers.push({ q, selectedIdx, isCorrect });

        if (isCorrect) {
          this.score += 10;
          this.streak++;
          if (this.streak > this.maxStreak) this.maxStreak = this.streak;
          this.context.audio.playSuccess();

          btn.style.borderColor = '#10b981';
          btn.style.background = 'rgba(16,185,129,0.2)';
          explBox.style.background = 'rgba(16,185,129,0.1)';
          explBox.style.border = '1px solid #10b981';
          explTitle.style.color = '#10b981';
          explTitle.textContent = '✅ CORRECT! Tactical Analysis:';
        } else {
          this.streak = 0;
          this.context.audio.playError();

          btn.style.borderColor = '#ef4444';
          btn.style.background = 'rgba(239,68,68,0.2)';
          btns[q.correctIndex].style.borderColor = '#10b981';
          btns[q.correctIndex].style.background = 'rgba(16,185,129,0.2)';

          explBox.style.background = 'rgba(239,68,68,0.1)';
          explBox.style.border = '1px solid #ef4444';
          explTitle.style.color = '#ef4444';
          explTitle.textContent = '❌ INCORRECT. Tactical Correction:';
        }

        explText.textContent = q.explanation;
        explBox.style.display = 'block';

        nextBtn.addEventListener('click', () => {
          this.context.audio.playClick();
          if (this.currentIndex + 1 < this.questions.length) {
            this.currentIndex++;
            this.renderQuestion();
          } else {
            this.calculateResults();
          }
        });
      });
    });
  },

  calculateResults() {
    const total = this.questions.length;
    const correctCount = this.answers.filter(a => a.isCorrect).length;
    const accuracy = Math.round((correctCount / total) * 100);

    // Score: up to 100 base + up to 50 streak bonus = 150 XP
    let earnedXp = (correctCount * 10) + Math.min(50, this.maxStreak * 5);
    earnedXp = Math.min(150, earnedXp);

    let stars = 1;
    if (accuracy >= 90) stars = 3;
    else if (accuracy >= 70) stars = 2;

    const recordResult = this.context.state.recordDistrictScore('quiz', earnedXp, stars);

    this.renderResults({
      correctCount,
      total,
      accuracy,
      maxStreak: this.maxStreak,
      earnedXp,
      deltaXp: recordResult.deltaXp,
      stars
    });
  },

  renderResults(data) {
    if (data.accuracy >= 80) {
      this.context.audio.playFanfare();
      this.context.guide.say("Academy Trial Conquered! Your cybersecurity foundation is battle-tested.", 'celebrating');
    } else {
      this.context.guide.say("Good attempt! Review the knowledge explanations to strengthen your cybersecurity armor.", 'talking');
    }

    this.container.innerHTML = `
      <div class="cq-district-view">
        <header class="cq-mission-header">
          <a href="#/city" class="cq-mission-header__back">← Return to CyberCity</a>
          <div class="cq-mission-header__title-group">
            <div class="cq-mission-header__district-name">Academy Completed</div>
            <h1 class="cq-mission-header__mission-title">Trial Assessment Report</h1>
          </div>
        </header>

        <section class="cq-briefing-card">
          <div class="cq-results-card">
            <div class="cq-results-card__badge">${data.stars === 3 ? '🏆' : data.stars === 2 ? '⭐' : '🛡️'}</div>
            <h2>Score: ${data.earnedXp} / 150 XP (Accuracy: ${data.accuracy}%)</h2>
            <div style="font-size:var(--font-size-lg);color:var(--color-cyan);margin-bottom:var(--space-2);">
              +${data.deltaXp} XP Awarded | Max Consecutive Streak: 🔥 ${data.maxStreak}
            </div>
            ${data.deltaXp === 0 ? `<p style="font-size:12px;color:var(--color-text-muted);">(No XP gain: your previous score was already higher or equal. Differential scoring prevents infinite farming.)</p>` : ''}
          </div>

          <div style="background:var(--color-bg-elevated);border:1px solid var(--color-border);border-radius:var(--radius-md);padding:var(--space-4);margin:var(--space-4) 0;">
            <h3>Academy Hall of Knowledge:</h3>
            <ul>
              <li><strong>Defense-in-Depth:</strong> Security is never just one tool; it is layers of software updates, MFA, backups, and human awareness.</li>
              <li><strong>Continuous Vigilance:</strong> New vulnerabilities emerge daily. Trust, but verify digital communications.</li>
            </ul>
          </div>

          <div class="cq-briefing-card__actions">
            <button type="button" class="cq-btn-secondary" id="cq-replay-quiz-btn">Retake Quiz 🔄</button>
            <a href="#/city" class="cq-btn-primary">Return to CyberCity 🏙️</a>
          </div>
        </section>
      </div>
    `;

    this.container.querySelector('#cq-replay-quiz-btn')?.addEventListener('click', () => {
      this.replay();
    });
  },

  replay() {
    this.context.audio.playClick();
    this.renderGameplay();
  },

  destroy() {
    this.questions = [];
    this.answers = [];
  }
};

