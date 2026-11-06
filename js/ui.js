/**
 * CyberQuest — Global UI & HUD Manager
 * Updates the persistent Heads-Up Display, manages accessible focus-trapped modals,
 * handles toasts, and renders the CyberGuardian Diploma.
 */

import { stateStore } from './state.js';
import { audio } from './audio.js';
import { createFocusTrap, triggerCelebration, escapeHtml } from './utils.js';

export class UIManager {
  constructor() {
    this.hudRankTitle = document.getElementById('cq-hud-rank-title');
    this.hudRankIcon = document.getElementById('cq-hud-rank-icon');
    this.hudXpVal = document.getElementById('cq-hud-xp-val');
    this.hudXpBar = document.getElementById('cq-hud-xp-bar');
    this.hudXpFill = document.getElementById('cq-hud-xp-fill');

    this.soundBtn = document.getElementById('cq-btn-sound');
    this.soundIcon = document.getElementById('cq-sound-icon');
    this.contrastBtn = document.getElementById('cq-btn-contrast');
    this.resetBtn = document.getElementById('cq-btn-reset');

    this.modalBackdrop = document.getElementById('cq-modal-backdrop');
    this.modalDialog = document.getElementById('cq-modal-dialog');
    this.modalTitle = document.getElementById('cq-modal-title');
    this.modalBody = document.getElementById('cq-modal-body');
    this.modalFooter = document.getElementById('cq-modal-footer');
    this.modalClose = document.getElementById('cq-modal-close');

    this.announcer = document.getElementById('cq-announcer');
    this.releaseFocusTrap = null;

    this.init();
  }

  init() {
    this.updateHUD();

    stateStore.subscribe('state:change', () => this.updateHUD());
    stateStore.subscribe('state:rankup', (data) => this.showRankUpModal(data));

    // Sound toggle
    if (this.soundBtn) {
      this.soundBtn.addEventListener('click', () => {
        const isMuted = audio.toggleMute();
        this.soundIcon.textContent = isMuted ? '🔇' : '🔊';
        stateStore.updateSettings({ sound: !isMuted });
      });
    }

    // High Contrast toggle
    if (this.contrastBtn) {
      this.contrastBtn.addEventListener('click', () => {
        const isHighContrast = document.body.getAttribute('data-theme') === 'high-contrast';
        const nextState = !isHighContrast;
        if (nextState) {
          document.body.setAttribute('data-theme', 'high-contrast');
        } else {
          document.body.removeAttribute('data-theme');
        }
        stateStore.updateSettings({ highContrast: nextState });
      });
    }

    // New Player reset button
    if (this.resetBtn) {
      this.resetBtn.addEventListener('click', () => {
        this.showResetConfirmation();
      });
    }

    // Modal Close
    if (this.modalClose) {
      this.modalClose.addEventListener('click', () => this.closeModal());
    }

    // Esc key modal close
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modalBackdrop.classList.contains('cq-modal-backdrop--open')) {
        this.closeModal();
      }
    });
  }

  updateHUD() {
    const state = stateStore.getState();
    const xp = state.player.xp || 0;
    const max = 1500;
    const pct = Math.min(100, Math.round((xp / max) * 100));

    if (this.hudRankTitle) this.hudRankTitle.textContent = state.player.rankTitle;
    if (this.hudRankIcon) this.hudRankIcon.textContent = state.player.rankBadge;
    if (this.hudXpVal) this.hudXpVal.textContent = `${xp} / ${max} XP`;
    if (this.hudXpBar) this.hudXpBar.setAttribute('aria-valuenow', xp);
    if (this.hudXpFill) this.hudXpFill.style.width = `${pct}%`;
  }

  openModal({ title, bodyHtml, footerHtml, alert = false, celebration = false }) {
    if (!this.modalBackdrop || !this.modalDialog) return;

    this.modalDialog.className = 'cq-modal';
    if (alert) this.modalDialog.classList.add('cq-modal--alert');
    if (celebration) this.modalDialog.classList.add('cq-modal--celebration');

    this.modalTitle.textContent = title;
    this.modalBody.innerHTML = bodyHtml;
    this.modalFooter.innerHTML = footerHtml || `
      <button type="button" class="cq-btn-primary" id="cq-modal-ok-btn">OK</button>
    `;

    const okBtn = this.modalFooter.querySelector('#cq-modal-ok-btn');
    if (okBtn) {
      okBtn.addEventListener('click', () => this.closeModal());
    }

    this.modalBackdrop.classList.add('cq-modal-backdrop--open');
    this.modalBackdrop.setAttribute('aria-hidden', 'false');

    this.releaseFocusTrap = createFocusTrap(this.modalDialog);
  }

  closeModal() {
    if (!this.modalBackdrop) return;
    this.modalBackdrop.classList.remove('cq-modal-backdrop--open');
    this.modalBackdrop.setAttribute('aria-hidden', 'true');
    if (this.releaseFocusTrap) {
      this.releaseFocusTrap();
      this.releaseFocusTrap = null;
    }
  }

  showResetConfirmation() {
    this.openModal({
      title: 'Reset Progress for New Player?',
      alert: true,
      bodyHtml: `
        <p><strong>Are you sure you want to reset all game progress?</strong></p>
        <p>This will erase all collected XP, completed districts, and reset your rank back to <strong>Recruit</strong>.</p>
        <p>This is useful when starting over or handing the workstation to another student.</p>
      `,
      footerHtml: `
        <button type="button" class="cq-btn-secondary" id="cq-cancel-reset">Cancel</button>
        <button type="button" class="cq-btn-primary" style="background:#ef4444;color:#fff;" id="cq-confirm-reset">Yes, Reset Game</button>
      `
    });

    document.getElementById('cq-cancel-reset')?.addEventListener('click', () => this.closeModal());
    document.getElementById('cq-confirm-reset')?.addEventListener('click', () => {
      stateStore.resetNewPlayer();
      this.closeModal();
      window.location.hash = '#/city';
    });
  }

  showRankUpModal(data) {
    audio.playFanfare();
    triggerCelebration();

    const isCyberGuardian = data.rank.id === 'cyber_guardian';

    this.openModal({
      title: isCyberGuardian ? '👑 CYBERGUARDIAN SUPREME RANK ACHIEVED!' : `🎉 Promoted to ${data.rank.title}!`,
      celebration: true,
      bodyHtml: `
        <div class="cq-results-card">
          <div class="cq-results-card__badge">${data.rank.badge}</div>
          <h3>${data.rank.title}</h3>
          <p>${data.rank.description}</p>
          ${isCyberGuardian ? `
            <div style="background:var(--color-bg-elevated);padding:15px;border-radius:8px;border:1px solid var(--color-cyan);margin-top:15px;">
              <p><strong>Congratulations, CyberGuardian!</strong> You have defended all 8 districts and achieved 1500 XP.</p>
              <button type="button" class="cq-btn-primary" id="cq-view-diploma-btn">📜 View & Print Official Diploma</button>
            </div>
          ` : ''}
        </div>
      `,
      footerHtml: `
        <button type="button" class="cq-btn-primary" id="cq-close-rankup">Continue Quest</button>
      `
    });

    document.getElementById('cq-close-rankup')?.addEventListener('click', () => this.closeModal());
    document.getElementById('cq-view-diploma-btn')?.addEventListener('click', () => {
      this.closeModal();
      this.showDiplomaModal();
    });
  }

  showDiplomaModal() {
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    this.openModal({
      title: 'Official CyberGuardian Certificate of Achievement',
      celebration: true,
      bodyHtml: `
        <div class="cq-diploma-print-view" style="padding:20px;text-align:center;">
          <div style="font-size:3rem;margin-bottom:10px;">👑</div>
          <h1 style="color:var(--color-cyan);margin:0;font-size:1.8rem;">DIPLOMA OF EXCELLENCE</h1>
          <h2 style="color:var(--color-text-secondary);font-size:1.1rem;margin:5px 0 20px 0;">CyberQuest Tactical Academy</h2>
          <p>This certifies that the operative has completed all tactical training sectors and achieved the ultimate distinction of:</p>
          <div class="cq-diploma-rank" style="font-size:1.6rem;font-weight:bold;color:var(--color-green);margin:15px 0;">CYBERGUARDIAN DEFENDER</div>
          <p class="cq-diploma-text">Having mastered Phishing Forensics, Password Entropy, Ethical Disclosure, Workplace Flaws, Network Hygiene, Myth Busting, AI Safety, and Cryptographic Ciphers.</p>
          <div style="margin-top:20px;font-size:0.9rem;color:var(--color-text-muted);">
            <div><strong>Date of Verification:</strong> ${today}</div>
            <div><strong>Verification Hash:</strong> CQ-AUTH-GUARDIAN-1500</div>
          </div>
        </div>
      `,
      footerHtml: `
        <button type="button" class="cq-btn-secondary" id="cq-close-diploma">Close</button>
        <button type="button" class="cq-btn-primary" id="cq-print-diploma">🖨️ Print Diploma</button>
      `
    });

    document.getElementById('cq-close-diploma')?.addEventListener('click', () => this.closeModal());
    document.getElementById('cq-print-diploma')?.addEventListener('click', () => {
      window.print();
    });
  }
}

export const ui = new UIManager();
export default ui;

