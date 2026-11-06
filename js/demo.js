/**
 * CyberQuest — Educator & Demo Mode Utility
 * Provides classroom demonstration controls and quick-state toggles for teachers and presenters.
 * Trigger via `Ctrl + Shift + D` or triple-clicking CyBot.
 */

import { stateStore } from './state.js';
import { ui } from './ui.js';
import { audio } from './audio.js';

export class DemoController {
  constructor(router) {
    this.router = router;
    this.init();
  }

  init() {
    window.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'D' || e.key === 'd')) {
        e.preventDefault();
        this.openDemoConsole();
      }
    });

    // Triple click on brand icon also triggers demo console
    const brand = document.getElementById('cq-brand-home');
    let clickCount = 0;
    let clickTimeout = null;

    brand?.addEventListener('click', (e) => {
      clickCount++;
      if (clickTimeout) clearTimeout(clickTimeout);
      if (clickCount >= 3) {
        e.preventDefault();
        clickCount = 0;
        this.openDemoConsole();
      } else {
        clickTimeout = setTimeout(() => { clickCount = 0; }, 600);
      }
    });
  }

  openDemoConsole() {
    audio.playChirp();

    ui.openModal({
      title: '🛠️ Educator & Presentation Demo Console',
      alert: true,
      bodyHtml: `
        <div style="font-size:14px;line-height:1.5;">
          <p style="color:var(--color-yellow);margin-top:0;">
            <strong>Classroom / Kiosk Controls:</strong> Fast-forward progress or reset states to showcase features during presentations.
          </p>

          <div style="display:flex;flex-direction:column;gap:10px;margin:15px 0;">
            <button type="button" class="cq-btn-primary" id="cq-demo-max-btn" style="background:#10b981;color:#000;">
              👑 Max Progress: Unlock CyberGuardian (1500 XP + All Districts)
            </button>
            <button type="button" class="cq-btn-secondary" id="cq-demo-diploma-btn">
              📜 View CyberGuardian Official Diploma &amp; Print
            </button>
            <button type="button" class="cq-btn-secondary" id="cq-demo-reset-btn" style="border-color:#ef4444;color:#ef4444;">
              🔄 Clean Reset to Recruit (0 XP)
            </button>
          </div>

          <p style="font-size:12px;color:var(--color-text-muted);">
            Shortcut: Press <code>Ctrl + Shift + D</code> anytime to reopen this menu.
          </p>
        </div>
      `,
      footerHtml: `
        <button type="button" class="cq-btn-primary" id="cq-demo-close-btn">Close Console</button>
      `
    });

    document.getElementById('cq-demo-close-btn')?.addEventListener('click', () => ui.closeModal());

    document.getElementById('cq-demo-max-btn')?.addEventListener('click', () => {
      // Complete all 8 main districts with max scores
      const districts = ['phishing', 'password', 'ethical', 'flaws', 'quiz', 'myths', 'ai', 'bonus'];
      districts.forEach(d => {
        stateStore.recordDistrictScore(d, d === 'bonus' ? 450 : 150, 3);
      });

      // Complete all 6 bonus challenges
      const challenges = ['evil_twin', 'qr_trap', 'app_permissions', 'privacy_oversharing', 'caesar_cipher', 'deepfake_detective'];
      challenges.forEach(c => {
        stateStore.recordBonusChallengeScore(c, 75);
      });

      ui.closeModal();
      audio.playFanfare();
      this.router.navigate('/city');
    });

    document.getElementById('cq-demo-diploma-btn')?.addEventListener('click', () => {
      ui.closeModal();
      ui.showDiplomaModal();
    });

    document.getElementById('cq-demo-reset-btn')?.addEventListener('click', () => {
      stateStore.resetNewPlayer();
      ui.closeModal();
      this.router.navigate('/city');
    });
  }
}

export default DemoController;

