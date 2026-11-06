/**
 * CyberQuest — Client-Side Hash Router
 * Orchestrates view transitions and manages district module lifecycles.
 */

import { stateStore } from './state.js';
import { guide } from './guide.js';
import { audio } from './audio.js';
import * as utils from './utils.js';
import { CityMapController } from './city.js';

export class Router {
  constructor() {
    this.container = document.getElementById('cq-view-container');
    this.cityController = new CityMapController(this);
    this.currentModule = null;

    // Registry of supported district module loaders
    this.moduleMap = {
      phishing: () => import('./modules/phishing.js'),
      password: () => import('./modules/password.js'),
      ethical:  () => import('./modules/ethical.js'),
      flaws:    () => import('./modules/flaws.js'),
      quiz:     () => import('./modules/quiz.js'),
      myths:    () => import('./modules/myths.js'),
      ai:       () => import('./modules/ai.js'),
      bonus:    () => import('./modules/bonus.js')
    };

    window.addEventListener('hashchange', () => this.handleRoute());
  }

  init() {
    this.handleRoute();
  }

  navigate(path) {
    if (window.location.hash === `#${path}`) {
      this.handleRoute();
    } else {
      window.location.hash = `#${path}`;
    }
  }

  async handleRoute() {
    const rawHash = window.location.hash.slice(1) || '/city';
    const path = rawHash.startsWith('/') ? rawHash : `/${rawHash}`;

    guide.setRoute(path);

    // Teardown previous module if present
    if (this.currentModule && typeof this.currentModule.destroy === 'function') {
      try {
        this.currentModule.destroy();
      } catch (e) {
        console.warn('Error in module destroy lifecycle:', e);
      }
      this.currentModule = null;
    }

    // Scroll to top and focus main container
    window.scrollTo(0, 0);
    this.container.focus();

    if (path === '/city' || path === '/') {
      await this.cityController.render(this.container);
      return;
    }

    // Match /district/:id
    const parts = path.split('/');
    if (parts[1] === 'district' && parts[2]) {
      const districtId = parts[2];
      await this.loadDistrictModule(districtId);
      return;
    }

    // Fallback to city
    this.navigate('/city');
  }

  async loadDistrictModule(districtId) {
    const loader = this.moduleMap[districtId];
    if (!loader) {
      console.warn(`District module '${districtId}' not found. Redirecting to city.`);
      this.navigate('/city');
      return;
    }

    this.container.innerHTML = `
      <div style="padding:60px;text-align:center;color:var(--color-cyan);">
        <h2>Entering District...</h2>
        <p>Connecting to tactical satellite feed...</p>
      </div>
    `;

    try {
      const moduleNamespace = await loader();
      const moduleInstance = moduleNamespace.default || moduleNamespace;

      this.currentModule = moduleInstance;

      const context = {
        state: stateStore,
        guide,
        audio,
        router: this,
        utils
      };

      if (typeof moduleInstance.mount === 'function') {
        moduleInstance.mount(this.container, context);
      } else {
        console.error(`Module '${districtId}' does not export a mount lifecycle method.`);
      }
    } catch (e) {
      console.error(`Failed to load district module '${districtId}':`, e);
      this.container.innerHTML = `
        <div style="padding:40px;text-align:center;color:var(--color-red);">
          <h2>Communication Jammed!</h2>
          <p>Could not load district tactical module.</p>
          <button type="button" class="cq-btn-primary" id="cq-err-back">Return to CyberCity</button>
        </div>
      `;
      document.getElementById('cq-err-back')?.addEventListener('click', () => this.navigate('/city'));
    }
  }
}

export default Router;

