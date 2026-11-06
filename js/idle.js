/**
 * CyberQuest — Inactivity & Event Mode Controller
 * Monitors user interaction. After 60 seconds of inactivity, displays a gentle CyBot prompt
 * with a 15-second countdown before executing event-mode reset for classrooms and kiosks.
 */

import { guide } from './guide.js';
import { audio } from './audio.js';

export class IdleMonitor {
  constructor(router, ui) {
    this.router = router;
    this.ui = ui;
    this.inactivitySeconds = 60;
    this.countdownSeconds = 15;

    this.timer = null;
    this.countdownTimer = null;
    this.remainingCountdown = 15;
    this.isPrompting = false;

    this.init();
  }

  init() {
    const activityEvents = ['mousemove', 'keydown', 'touchstart', 'pointerdown'];
    activityEvents.forEach(evt => {
      window.addEventListener(evt, () => this.handleUserActivity(), { passive: true });
    });

    this.startInactivityTimer();
  }

  handleUserActivity() {
    if (this.isPrompting) {
      // User pressed a key or moved mouse while prompt is up -> dismiss prompt and resume
      this.dismissPrompt();
      return;
    }

    this.resetTimer();
  }

  resetTimer() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.startInactivityTimer();
  }

  startInactivityTimer() {
    this.timer = setTimeout(() => {
      this.triggerInactivityPrompt();
    }, this.inactivitySeconds * 1000);
  }

  triggerInactivityPrompt() {
    this.isPrompting = true;
    this.remainingCountdown = this.countdownSeconds;
    audio.playAlert();

    this.ui.openModal({
      title: 'CyBot Sensory Alert',
      alert: true,
      bodyHtml: `
        <div style="text-align:center;padding:10px;">
          <div style="font-size:3rem;margin-bottom:10px;">🤖</div>
          <p style="font-size:16px;line-height:1.5;">Are you still with us, Agent? CyberCity needs your defense!</p>
          <div style="margin:20px 0;font-size:18px;font-weight:bold;color:var(--color-yellow);">
            Event Mode Reset in: <span id="cq-idle-countdown" style="font-family:var(--font-mono);font-size:24px;color:#ef4444;">${this.remainingCountdown}s</span>
          </div>
          <p style="font-size:12px;color:var(--color-text-muted);">Workstations automatically return to the city map so the next student can start fresh.</p>
        </div>
      `,
      footerHtml: `
        <button type="button" class="cq-btn-primary" id="cq-resume-idle-btn" style="width:100%;font-size:16px;">I'm Here! 🚀</button>
      `
    });

    const resumeBtn = document.getElementById('cq-resume-idle-btn');
    if (resumeBtn) {
      resumeBtn.addEventListener('click', () => {
        this.dismissPrompt();
      });
    }

    this.startCountdownLoop();
  }

  startCountdownLoop() {
    this.countdownTimer = setInterval(() => {
      this.remainingCountdown--;
      const el = document.getElementById('cq-idle-countdown');
      if (el) el.textContent = `${this.remainingCountdown}s`;

      if (this.remainingCountdown <= 0) {
        clearInterval(this.countdownTimer);
        this.countdownTimer = null;
        this.executeEventModeReset();
      }
    }, 1000);
  }

  dismissPrompt() {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }
    this.isPrompting = false;
    this.ui.closeModal();
    guide.say("Welcome back, Agent! Resuming tactical mission.", 'talking', 4000);
    this.resetTimer();
  }

  executeEventModeReset() {
    this.isPrompting = false;
    this.ui.closeModal();

    // Event-mode reset: return to CyberCity navigation hub
    this.router.navigate('/city');
    guide.say("Workstation reset to CyberCity hub. Welcome, new Agent! Select any district to begin.", 'talking', 8000);

    this.resetTimer();
  }
}

export default IdleMonitor;

