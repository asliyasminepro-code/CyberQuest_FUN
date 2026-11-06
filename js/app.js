/**
 * CyberQuest — Application Orchestrator & Bootstrapper
 * Initializes core services, registers the offline Service Worker, and coordinates lifecycle events.
 */

import { stateStore } from './state.js';
import { audio } from './audio.js';
import { ui } from './ui.js';
import { guide } from './guide.js';
import { Router } from './router.js';
import { IdleMonitor } from './idle.js';
import { DemoController } from './demo.js';

class CyberQuestApp {
  constructor() {
    this.router = null;
    this.idleMonitor = null;
    this.demoController = null;
  }

  async start() {
    // 1. Protocol Detection Check
    if (window.location.protocol === 'file:') {
      const banner = document.getElementById('cq-protocol-banner');
      if (banner) banner.style.display = 'block';
      console.info('CyberQuest opened via file://. For full ES Module support and PWA caching, run via a local static server.');
    } else {
      // 2. Service Worker Registration for Offline-First PWA
      this.registerServiceWorker();
    }

    // 3. User Gesture Audio Unlocking (Browser Autoplay Compliance)
    const unlockAudio = () => {
      audio.resumeContext();
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };
    window.addEventListener('click', unlockAudio);
    window.addEventListener('keydown', unlockAudio);
    window.addEventListener('touchstart', unlockAudio);

    // 4. Initialize Core Routing & Modules
    this.router = new Router();
    this.router.init();

    // 5. Initialize Inactivity Monitor (60s event-mode reset)
    this.idleMonitor = new IdleMonitor(this.router, ui);

    // 6. Initialize Educator Demo Controls (Ctrl+Shift+D)
    this.demoController = new DemoController(this.router);

    // 7. Initial Mascot Welcome
    setTimeout(() => {
      guide.say("Systems online! Welcome to CyberQuest, Agent. Select any district on the CyberCity map to begin!", 'talking', 6000);
    }, 600);
  }

  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
          .then((reg) => {
            console.log('CyberQuest Service Worker active:', reg.scope);
            reg.update();
          })
          .catch((err) => {
            console.warn('Service Worker registration skipped or failed:', err);
          });
      });
    }
  }
}

// Bootstrap when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new CyberQuestApp();
  app.start();
});

