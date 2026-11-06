/**
 * CyberQuest — Reactive State Management Engine
 * Single Source of Truth with Observer Pub/Sub, anonymous localStorage persistence,
 * differential replay scoring, and zero-knowledge privacy enforcement.
 */

const STORAGE_KEY = 'cyberquest_save_v1';

class StateStore {
  constructor() {
    this.listeners = new Map();
    this.ranks = [
      { id: 'recruit', title: 'Recruit', minXp: 0, badge: '🔰' },
      { id: 'agent', title: 'Agent', minXp: 250, badge: '🛡️' },
      { id: 'senior_agent', title: 'Senior Agent', minXp: 600, badge: '⭐' },
      { id: 'expert', title: 'Expert', minXp: 1050, badge: '🎖️' },
      { id: 'cyber_guardian', title: 'CyberGuardian', minXp: 1500, badge: '👑', requiresAllDistricts: true }
    ];

    this.mainDistrictIds = ['phishing', 'password', 'ethical', 'flaws', 'quiz', 'myths', 'ai', 'bonus'];

    this.state = this.loadInitialState();
  }

  /**
   * Constructs fresh default state.
   */
  getDefaultState() {
    return {
      version: 1,
      player: {
        xp: 0,
        rankId: 'recruit',
        rankTitle: 'Recruit',
        rankBadge: '🔰'
      },
      districts: {
        phishing: { completed: false, score: 0, maxScore: 150, stars: 0 },
        password: { completed: false, score: 0, maxScore: 150, stars: 0 },
        ethical:  { completed: false, score: 0, maxScore: 150, stars: 0 },
        flaws:    { completed: false, score: 0, maxScore: 150, stars: 0 },
        quiz:     { completed: false, score: 0, maxScore: 150, stars: 0 },
        myths:    { completed: false, score: 0, maxScore: 150, stars: 0 },
        ai:       { completed: false, score: 0, maxScore: 150, stars: 0 },
        bonus:    { completed: false, score: 0, maxScore: 450, stars: 0 }
      },
      bonusChallenges: {
        evil_twin:           { completed: false, score: 0, maxScore: 75 },
        qr_trap:             { completed: false, score: 0, maxScore: 75 },
        app_permissions:     { completed: false, score: 0, maxScore: 75 },
        privacy_oversharing: { completed: false, score: 0, maxScore: 75 },
        caesar_cipher:       { completed: false, score: 0, maxScore: 75 },
        deepfake_detective:  { completed: false, score: 0, maxScore: 75 }
      },
      badges: [],
      settings: {
        sound: true,
        highContrast: false,
        reducedMotion: false
      }
    };
  }

  /**
   * Safely loads state from localStorage with schema validation.
   */
  loadInitialState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.version === 1 && parsed.player) {
          // Merge defaults in case new fields were added
          const def = this.getDefaultState();
          return {
            ...def,
            ...parsed,
            player: { ...def.player, ...parsed.player },
            districts: { ...def.districts, ...parsed.districts },
            bonusChallenges: { ...def.bonusChallenges, ...parsed.bonusChallenges },
            settings: { ...def.settings, ...parsed.settings }
          };
        }
      }
    } catch (e) {
      console.warn('Could not read saved game state. Starting fresh.', e);
    }
    return this.getDefaultState();
  }

  /**
   * Persists state anonymously to localStorage.
   */
  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.warn('Failed to save state to localStorage.', e);
    }
  }

  /**
   * Resets all game progress for a New Player.
   */
  resetNewPlayer() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
    this.state = this.getDefaultState();
    this.emit('state:reset', this.state);
    this.emit('state:change', this.state);
  }

  /**
   * Pub/Sub Event Subscription.
   * @param {string} event - Event name ('state:change', 'state:rankup', 'state:reset')
   * @param {Function} callback
   */
  subscribe(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    return () => this.listeners.get(event).delete(callback);
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(cb => {
        try { cb(data); } catch (e) { console.error('Error in state listener:', e); }
      });
    }
  }

  getState() {
    return this.state;
  }

  /**
   * Records a district completion and applies differential replay scoring.
   * @param {string} districtId - District key
   * @param {number} newScore - Score earned on this attempt
   * @param {number} stars - 1 to 3 stars earned
   * @returns {Object} { deltaXp, totalXp, newRank, isFirstClear }
   */
  recordDistrictScore(districtId, newScore, stars = 3) {
    const district = this.state.districts[districtId];
    if (!district) return { deltaXp: 0, totalXp: this.state.player.xp };

    const prevScore = district.score || 0;
    const isFirstClear = !district.completed;
    const clampedNewScore = Math.min(newScore, district.maxScore);

    // Differential XP calculation: only award gain above prior high score
    const deltaXp = Math.max(0, clampedNewScore - prevScore);

    district.completed = true;
    if (clampedNewScore > prevScore) {
      district.score = clampedNewScore;
    }
    district.stars = Math.max(district.stars || 0, stars);

    this.state.player.xp += deltaXp;

    // Check rank progression
    const rankInfo = this.checkRankUpdate();

    // Check district badge
    const badgeId = `badge_${districtId}`;
    if (!this.state.badges.includes(badgeId)) {
      this.state.badges.push(badgeId);
      this.emit('state:badge', { badgeId, districtId });
    }

    this.save();
    this.emit('state:change', this.state);

    return {
      deltaXp,
      totalXp: this.state.player.xp,
      isFirstClear,
      rankInfo
    };
  }

  /**
   * Records score for one of the 6 Bonus Alley challenges.
   * @param {string} challengeId
   * @param {number} newScore
   */
  recordBonusChallengeScore(challengeId, newScore) {
    const challenge = this.state.bonusChallenges[challengeId];
    if (!challenge) return { deltaXp: 0 };

    const prevScore = challenge.score || 0;
    const clampedNewScore = Math.min(newScore, challenge.maxScore);
    const deltaXp = Math.max(0, clampedNewScore - prevScore);

    challenge.completed = true;
    if (clampedNewScore > prevScore) {
      challenge.score = clampedNewScore;
    }

    // Update parent bonus district cumulative score
    let totalBonusScore = 0;
    let allBonusCompleted = true;
    Object.values(this.state.bonusChallenges).forEach(c => {
      totalBonusScore += (c.score || 0);
      if (!c.completed) allBonusCompleted = false;
    });

    this.state.districts.bonus.score = totalBonusScore;
    if (allBonusCompleted) {
      this.state.districts.bonus.completed = true;
      this.state.districts.bonus.stars = 3;
    }

    this.state.player.xp += deltaXp;

    const rankInfo = this.checkRankUpdate();

    this.save();
    this.emit('state:change', this.state);

    return { deltaXp, totalXp: this.state.player.xp, rankInfo };
  }

  /**
   * Evaluates rank advancement including dual-criteria for CyberGuardian:
   * Requires BOTH >= 1500 XP AND completion of all 8 main districts.
   */
  checkRankUpdate() {
    const currentXp = this.state.player.xp;
    const allDistrictsComplete = this.mainDistrictIds.every(id => this.state.districts[id]?.completed);

    let eligibleRank = this.ranks[0];

    for (let i = this.ranks.length - 1; i >= 0; i--) {
      const r = this.ranks[i];
      if (currentXp >= r.minXp) {
        if (r.requiresAllDistricts) {
          if (allDistrictsComplete) {
            eligibleRank = r;
            break;
          }
        } else {
          eligibleRank = r;
          break;
        }
      }
    }

    if (eligibleRank.id !== this.state.player.rankId) {
      const prevRank = this.state.player.rankTitle;
      this.state.player.rankId = eligibleRank.id;
      this.state.player.rankTitle = eligibleRank.title;
      this.state.player.rankBadge = eligibleRank.badge;

      this.emit('state:rankup', {
        rank: eligibleRank,
        prevRank,
        allDistrictsComplete
      });

      return { upgraded: true, rank: eligibleRank };
    }

    return { upgraded: false, rank: eligibleRank };
  }

  /**
   * Updates user accessibility and sound settings.
   */
  updateSettings(newSettings) {
    this.state.settings = { ...this.state.settings, ...newSettings };
    this.save();
    this.emit('state:settings', this.state.settings);
    this.emit('state:change', this.state);
  }
}

export const stateStore = new StateStore();
export default stateStore;

