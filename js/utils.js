/**
 * CyberQuest — Shared Utility Functions
 * DOM sanitation, formatting, mathematical entropy calculation, focus trapping, and micro-particles.
 */

/**
 * Escapes HTML characters to prevent XSS.
 * @param {string} str - Raw input string
 * @returns {string} Sanitized HTML-safe string
 */
export function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Formats a number with standard commas.
 * @param {number} num - Number to format
 * @returns {string} e.g. 10,000,000,000
 */
export function formatNumber(num) {
  if (typeof num !== 'number' || isNaN(num)) return '0';
  return num.toLocaleString('en-US');
}

/**
 * Converts cracking time in seconds to a human-readable string.
 * @param {number} seconds - Calculated time in seconds
 * @returns {string} Humanized estimate (e.g., "14 hours", "2.5 million years")
 */
export function formatCrackingTime(seconds) {
  if (seconds <= 0 || !isFinite(seconds)) return 'Instant (less than 0.001 milliseconds)';
  
  if (seconds < 0.000001) return 'Instant (< 1 microsecond)';
  if (seconds < 0.001) return 'Instant (< 1 millisecond)';
  if (seconds < 1) return `${(seconds * 1000).toFixed(0)} milliseconds`;
  if (seconds < 60) return `${seconds.toFixed(1)} seconds`;
  
  const minutes = seconds / 60;
  if (minutes < 60) return `${minutes.toFixed(0)} minutes`;
  
  const hours = minutes / 60;
  if (hours < 24) return `${hours.toFixed(1)} hours`;
  
  const days = hours / 24;
  if (days < 365) return `${days.toFixed(0)} days`;
  
  const years = days / 365;
  if (years < 100) return `${years.toFixed(1)} years`;
  if (years < 1000) return `${Math.round(years)} years`;
  if (years < 1000000) return `${(years / 1000).toFixed(1)} thousand years`;
  if (years < 1000000000) return `${(years / 1000000).toFixed(1)} million years`;
  if (years < 1000000000000) return `${(years / 1000000000).toFixed(1)} billion years`;
  
  return 'Trillions of years (Far longer than the age of the Universe)';
}

/**
 * Evaluates password entropy and theoretical cracking time at 10 billion guesses/sec.
 * Operates purely in volatile memory. Never persists password.
 * @param {string} password - Input password string
 * @param {Array<string>} weakDictionary - List of known weak passwords
 * @param {number} rate - Guesses per second (default 10^10)
 * @returns {Object} Entropy calculation results and strength tier
 */
export function evaluatePasswordStrength(password, weakDictionary = [], rate = 10000000000) {
  if (!password || password.length === 0) {
    return {
      length: 0,
      poolSize: 0,
      combinations: 0,
      secondsToCrack: 0,
      timeLabel: 'Instant (0 seconds)',
      strengthScore: 0, // 0-100
      strengthTier: 'Empty',
      isWeakCommon: false,
      feedback: 'Type a password to test its theoretical strength.'
    };
  }

  const clean = password.trim().toLowerCase();
  
  // Check weak common patterns
  const isWeak = weakDictionary.includes(clean) || /^[0-9]+$/.test(clean) && clean.length < 8;
  if (isWeak) {
    return {
      length: password.length,
      poolSize: 10,
      combinations: 1000,
      secondsToCrack: 0.0000001,
      timeLabel: 'Instant (< 0.001 milliseconds)',
      strengthScore: 10,
      strengthTier: 'Extremely Weak',
      isWeakCommon: true,
      feedback: 'This matches a known dictionary word or common pattern. Cracking tools test this in milliseconds!'
    };
  }

  let poolSize = 0;
  if (/[a-z]/.test(password)) poolSize += 26;
  if (/[A-Z]/.test(password)) poolSize += 26;
  if (/[0-9]/.test(password)) poolSize += 10;
  if (/[^a-zA-Z0-9]/.test(password)) poolSize += 33;
  if (poolSize === 0) poolSize = 26;

  const length = password.length;
  // Combinations = poolSize ^ length
  // Use log calculation to prevent JS Number overflow: log10(S) = length * log10(poolSize)
  const logCombinations = length * Math.log10(poolSize);
  const logRate = Math.log10(rate);
  const logSeconds = logCombinations - logRate;

  let seconds = 0;
  if (logSeconds > 300) {
    seconds = Number.MAX_VALUE;
  } else if (logSeconds < -10) {
    seconds = 0.0000001;
  } else {
    seconds = Math.pow(10, logSeconds);
  }

  // Calculate normalized strength score (0 to 100)
  let score = 0;
  if (length >= 16 && poolSize >= 62) score = 100;
  else if (length >= 14 && poolSize >= 52) score = 90;
  else if (length >= 12 && poolSize >= 52) score = 75;
  else if (length >= 10 && poolSize >= 36) score = 55;
  else if (length >= 8) score = 35;
  else score = 15;

  let tier = 'Weak';
  if (score >= 90) tier = 'Impenetrable';
  else if (score >= 70) tier = 'Strong';
  else if (score >= 45) tier = 'Moderate';

  let feedback = 'Good passphrase length creates high resistance against brute-force attacks.';
  if (score < 45) {
    feedback = 'Too short! Try adding more random words or increasing length beyond 12 characters.';
  } else if (score >= 90) {
    feedback = 'Exceptional length and entropy! Remember to still pair this with 2FA in the real world.';
  }

  return {
    length,
    poolSize,
    combinations: logCombinations > 15 ? `10^${logCombinations.toFixed(1)}` : Math.round(Math.pow(poolSize, length)),
    secondsToCrack: seconds,
    timeLabel: formatCrackingTime(seconds),
    strengthScore: score,
    strengthTier: tier,
    isWeakCommon: false,
    feedback
  };
}

/**
 * Traps keyboard focus inside a modal element for WCAG 2.1 AA accessibility.
 * @param {HTMLElement} modalEl - Modal container
 * @returns {Function} Cleanup function to release trap
 */
export function createFocusTrap(modalEl) {
  const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
  const focusableElements = Array.from(modalEl.querySelectorAll(focusableSelector));
  
  if (focusableElements.length === 0) return () => {};
  
  const firstEl = focusableElements[0];
  const lastEl = focusableElements[focusableElements.length - 1];
  
  firstEl.focus();

  function handleKeyDown(e) {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      if (document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      }
    } else {
      if (document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    }
  }

  modalEl.addEventListener('keydown', handleKeyDown);

  return function releaseFocusTrap() {
    modalEl.removeEventListener('keydown', handleKeyDown);
  };
}

/**
 * Spawns lightweight CSS celebratory particles for rank advancement.
 * Zero external canvas library required.
 */
export function triggerCelebration() {
  const container = document.createElement('div');
  container.className = 'cq-confetti-container';
  container.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:9999;overflow:hidden;';
  
  const colors = ['#00f0ff', '#10b981', '#a855f7', '#f59e0b', '#ec4899', '#ffffff'];
  const particleCount = 35;

  for (let i = 0; i < particleCount; i++) {
    const p = document.createElement('div');
    const color = colors[Math.floor(Math.random() * colors.length)];
    const size = Math.floor(Math.random() * 8) + 6;
    const startX = Math.random() * 100;
    const delay = Math.random() * 0.5;
    const duration = Math.random() * 1.5 + 1.8;

    p.style.cssText = `
      position: absolute;
      top: -20px;
      left: ${startX}vw;
      width: ${size}px;
      height: ${size * (Math.random() > 0.5 ? 1.5 : 1)}px;
      background: ${color};
      opacity: 0.9;
      border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
      animation: confettiFall ${duration}s ease-in ${delay}s forwards;
    `;
    container.appendChild(p);
  }

  document.body.appendChild(container);
  setTimeout(() => {
    container.remove();
  }, 4000);
}

