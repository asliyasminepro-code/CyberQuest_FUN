/**
 * CyberQuest — CyBot Mascot Controller
 * Animated tactical companion providing contextual advice, hints, and feedback.
 */

import { audio } from './audio.js';
import { escapeHtml } from './utils.js';

export class GuideController {
  constructor() {
    this.widgetEl = document.getElementById('cq-cybot');
    this.bubbleEl = document.getElementById('cq-cybot-bubble');
    this.textEl = document.getElementById('cq-cybot-text');
    this.triggerBtn = document.getElementById('cq-cybot-trigger');
    this.dismissBtn = document.getElementById('cq-cybot-dismiss');
    this.announcerEl = document.getElementById('cq-announcer');

    this.messages = null;
    this.activeTimeout = null;
    this.currentRoute = '/city';

    this.init();
  }

  async init() {
    try {
      const resp = await fetch('data/guide-messages.json');
      this.messages = await resp.json();
    } catch (e) {
      console.warn('Could not load guide messages.', e);
    }

    if (this.triggerBtn) {
      this.triggerBtn.addEventListener('click', () => {
        audio.playChirp();
        this.provideContextualHint();
      });
    }

    if (this.dismissBtn) {
      this.dismissBtn.addEventListener('click', () => {
        this.hideBubble();
      });
    }
  }

  setRoute(route) {
    this.currentRoute = route;
  }

  setMood(mood) {
    if (!this.widgetEl) return;
    this.widgetEl.classList.remove('cq-cybot--talking', 'cq-cybot--alert', 'cq-cybot--celebrating');
    if (mood) {
      this.widgetEl.classList.add(`cq-cybot--${mood}`);
    }
  }

  /**
   * Displays dialogue text with typewriter effect and accessible announcement.
   * @param {string} text - Message to say
   * @param {string} mood - 'talking' | 'alert' | 'celebrating' | 'idle'
   * @param {number} autoDismissMs - Auto hide duration (0 for manual dismiss)
   */
  say(text, mood = 'talking', autoDismissMs = 8000) {
    if (!this.bubbleEl || !this.textEl) return;

    if (this.activeTimeout) {
      clearTimeout(this.activeTimeout);
      this.activeTimeout = null;
    }

    this.setMood(mood);
    audio.playChirp();

    this.bubbleEl.classList.remove('cq-cybot__bubble--hidden');
    this.textEl.textContent = text;

    // Announce to screen readers via aria-live region
    if (this.announcerEl) {
      this.announcerEl.textContent = `CyBot says: ${text}`;
    }

    if (autoDismissMs > 0) {
      this.activeTimeout = setTimeout(() => {
        this.hideBubble();
      }, autoDismissMs);
    }
  }

  hideBubble() {
    if (this.bubbleEl) {
      this.bubbleEl.classList.add('cq-cybot__bubble--hidden');
    }
    this.setMood('idle');
  }

  provideContextualHint() {
    if (!this.messages) return;

    if (this.currentRoute === '/city') {
      const greetings = this.messages.greetings || [];
      const msg = greetings[Math.floor(Math.random() * greetings.length)] || "Select any district on the map to begin!";
      this.say(msg, 'talking', 7000);
      return;
    }

    // Match district routes: /district/:id
    const parts = this.currentRoute.split('/');
    if (parts[1] === 'district' && parts[2]) {
      const districtId = parts[2];
      const tip = this.messages.districtBriefings?.[districtId];
      if (tip) {
        this.say(tip, 'talking', 9000);
        return;
      }
    }

    this.say("Keep your defenses active! Review headers, avoid rushing, and look for subtle anomalies.", 'talking', 6000);
  }
}

export const guide = new GuideController();
export default guide;

