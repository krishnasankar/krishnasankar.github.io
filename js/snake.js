/**
 * ==========================================================================
 * SNAKE.EXE — "EAT THE PORTFOLIO" RETRO SNAKE EASTER EGG
 * 
 * Activated by: Double-clicking Krishnasankar's name in the header (<a class="nav__logo">)
 * Mobile: Double-tap on the header logo
 * Keyboard: Enter / Space twice quickly when focused on the header logo
 * Exit: Press Escape (ESC) or click [EXIT] in the HUD
 * ==========================================================================
 */

(() => {
  'use strict';

  // ── Global Game State ──────────────────────────────────────────────────────
  let isSnakeActive = false;
  let isActivating = false;
  let isPaused = false;
  let isGameOver = false;
  let isVictory = false;

  // DOM Restoration
  const originalHTMLMap = new Map();

  // Character Registry & Spatial Hash
  let characterRegistry = [];
  const spatialGrid = new Map();
  const GRID_BUCKET_SIZE = 80; // 80px spatial bins for O(1) collision

  // Game Engine & Snake Entity
  let canvas = null;
  let ctx = null;
  let animationFrameId = null;
  let gameTickTimer = null;
  let lastFrameTime = 0;
  let tickAccumulator = 0;

  // Dynamic Levels & Snake Width Configuration (5 Tiers)
  const LEVEL_CONFIGS = {
    1: { width: 14, step: 14, font: 'bold 7px "Press Start 2P", monospace',  fill: '#10b981', glow: 'rgba(16, 185, 129, 0.4)', text: '#064e3b', title: 'TINY TEXT' },
    2: { width: 18, step: 18, font: 'bold 9px "Press Start 2P", monospace',  fill: '#06b6d4', glow: 'rgba(6, 182, 212, 0.4)', text: '#083344', title: 'BODY & BUTTONS' },
    3: { width: 24, step: 24, font: 'bold 12px "Press Start 2P", monospace', fill: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.4)', text: '#2e1065', title: 'SUBHEADINGS' },
    4: { width: 30, step: 30, font: 'bold 15px "Press Start 2P", monospace', fill: '#f59e0b', glow: 'rgba(245, 158, 11, 0.5)', text: '#451a03', title: 'SECTION TITLES' },
    5: { width: 38, step: 38, font: 'bold 19px "Press Start 2P", monospace', fill: '#ec4899', glow: 'rgba(236, 72, 153, 0.6)', text: '#ffffff', title: 'TITAN BOSS TEXT' }
  };

  let currentSnakeWidth = 14;
  let snakeHead = { x: 0, y: 0 };
  let snakeDirection = { dx: 1, dy: 0 };
  let nextDirection = { dx: 1, dy: 0 };
  let snakeSegments = []; // [{ x, y, char }]

  // Score & Progression
  let score = 0;
  let eatenCount = 0;
  let targetGoal = 0;
  let snakeLevel = 1;
  let levelThresholds = [0, 30, 80, 160, 280]; // Thresholds for Lvl 1, 2, 3, 4, 5

  // Audio Synthesizer State
  let audioCtx = null;
  let soundEnabled = true;

  // Particle Effects & Floating Popups
  let floatingPopups = []; // [{ x, y, text, color, life, maxLife }]
  let sparkParticles = []; // [{ x, y, vx, vy, color, life, maxLife }]

  // Mobile Controller
  let mobileControlsEl = null;

  // ── Web Audio API 8-Bit Chiptune Synthesizer ──────────────────────────────
  function getAudioContext() {
    if (!audioCtx) {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (AudioCtxClass) {
        audioCtx = new AudioCtxClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playTone(freq, type, duration, startTime, vol = 0.12) {
    if (!soundEnabled) return;
    const actx = getAudioContext();
    if (!actx) return;

    try {
      const t = startTime || actx.currentTime;
      const osc = actx.createOscillator();
      const gain = actx.createGain();

      osc.type = type || 'square';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(vol, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

      osc.connect(gain);
      gain.connect(actx.destination);

      osc.start(t);
      osc.stop(t + duration + 0.02);
    } catch {
      // Audio autoplay blocked or unsupported
    }
  }

  function playEatSound(tier) {
    if (!soundEnabled) return;
    const actx = getAudioContext();
    if (!actx) return;

    try {
      const t = actx.currentTime;
      const osc = actx.createOscillator();
      const gain = actx.createGain();

      const baseFreq = tier === 5 ? 200 : tier === 4 ? 300 : tier === 3 ? 450 : tier === 2 ? 600 : 750;
      const targetFreq = baseFreq + (tier >= 4 ? 320 : 250);

      osc.type = tier >= 4 ? 'sawtooth' : tier === 3 ? 'sawtooth' : 'square';
      osc.frequency.setValueAtTime(baseFreq, t);
      osc.frequency.exponentialRampToValueAtTime(targetFreq, t + (tier >= 4 ? 0.08 : 0.05));

      const vol = tier >= 4 ? 0.20 : 0.14;
      gain.gain.setValueAtTime(vol, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + (tier >= 4 ? 0.10 : 0.07));

      osc.connect(gain);
      gain.connect(actx.destination);

      osc.start(t);
      osc.stop(t + (tier >= 4 ? 0.11 : 0.08));
    } catch {
      // Silent on error
    }
  }

  function playLockDing() {
    playTone(220, 'triangle', 0.08, null, 0.1);
  }

  function playLevelUpSound(lvl) {
    const actx = getAudioContext();
    if (!actx || !soundEnabled) return;
    const t = actx.currentTime;

    if (lvl === 5) {
      // Grand Titan Fanfare
      playTone(261.63, 'sawtooth', 0.12, t, 0.2);        // C4
      playTone(523.25, 'square', 0.12, t + 0.10, 0.2);   // C5
      playTone(659.25, 'square', 0.12, t + 0.20, 0.2);   // E5
      playTone(783.99, 'square', 0.14, t + 0.30, 0.22);  // G5
      playTone(1046.50, 'square', 0.35, t + 0.42, 0.25); // C6
      playTone(1318.51, 'square', 0.50, t + 0.58, 0.25); // E6
    } else {
      playTone(523.25, 'square', 0.1, t, 0.15);
      playTone(659.25, 'square', 0.1, t + 0.09, 0.15);
      playTone(783.99, 'square', 0.1, t + 0.18, 0.15);
      playTone(1046.5, 'square', 0.28, t + 0.27, 0.18);
    }
  }

  function playGameOverSound() {
    const actx = getAudioContext();
    if (!actx || !soundEnabled) return;
    try {
      const t = actx.currentTime;
      const osc = actx.createOscillator();
      const gain = actx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, t);
      osc.frequency.exponentialRampToValueAtTime(80, t + 0.45);

      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

      osc.connect(gain);
      gain.connect(actx.destination);

      osc.start(t);
      osc.stop(t + 0.47);
    } catch {
      // Silent on error
    }
  }

  function playVictoryFanfare() {
    const actx = getAudioContext();
    if (!actx || !soundEnabled) return;
    const t = actx.currentTime;
    playTone(523.25, 'square', 0.12, t, 0.18);
    playTone(659.25, 'square', 0.12, t + 0.12, 0.18);
    playTone(783.99, 'square', 0.12, t + 0.24, 0.18);
    playTone(1046.5, 'square', 0.22, t + 0.36, 0.22);
    playTone(880.00, 'square', 0.14, t + 0.60, 0.2);
    playTone(1046.5, 'square', 0.45, t + 0.75, 0.25);
  }

  // ── Activation Controller ─────────────────────────────────────────────────
  function initActivationController() {
    const navLogo = document.querySelector('.nav__logo');
    if (!navLogo) return;

    let clickCount = 0;
    let clickTimer = null;

    // 1. Desktop Click / Double-Click Disambiguation
    navLogo.addEventListener('click', (e) => {
      clickCount++;

      if (clickCount === 1) {
        // Intercept single click temporarily to check for second click
        e.preventDefault();
        clickTimer = setTimeout(() => {
          clickCount = 0;
          // Genuine single click: smooth scroll to #home naturally
          const homeSection = document.querySelector('#home');
          if (homeSection) {
            homeSection.scrollIntoView({ behavior: 'smooth' });
          } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }, 260);
      } else if (clickCount >= 2) {
        // Genuine double click: activate Snake Mode!
        e.preventDefault();
        e.stopPropagation();
        clearTimeout(clickTimer);
        clickCount = 0;
        triggerSnakeActivation();
      }
    });

    // Native dblclick backup
    navLogo.addEventListener('dblclick', (e) => {
      e.preventDefault();
      e.stopPropagation();
      clearTimeout(clickTimer);
      clickCount = 0;
      triggerSnakeActivation();
    });

    // 2. Mobile Double-Tap
    let lastTapTime = 0;
    let tapStartX = 0;
    let tapStartY = 0;

    navLogo.addEventListener('touchstart', (e) => {
      if (e.touches && e.touches[0]) {
        tapStartX = e.touches[0].clientX;
        tapStartY = e.touches[0].clientY;
      }
    }, { passive: true });

    navLogo.addEventListener('touchend', (e) => {
      const now = Date.now();
      const timeDiff = now - lastTapTime;

      let moved = false;
      if (e.changedTouches && e.changedTouches[0]) {
        const dx = Math.abs(e.changedTouches[0].clientX - tapStartX);
        const dy = Math.abs(e.changedTouches[0].clientY - tapStartY);
        if (dx > 15 || dy > 15) moved = true;
      }

      if (!moved && timeDiff > 40 && timeDiff < 380) {
        // Detected double-tap!
        e.preventDefault();
        e.stopPropagation();
        lastTapTime = 0;
        triggerSnakeActivation();
      } else {
        lastTapTime = now;
      }
    });

    // 3. Accessible Keyboard Trigger (Double-Press Enter or Space on logo)
    let lastKeyTime = 0;
    navLogo.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        const now = Date.now();
        if (now - lastKeyTime < 400) {
          e.preventDefault();
          e.stopPropagation();
          lastKeyTime = 0;
          triggerSnakeActivation();
        } else {
          lastKeyTime = now;
        }
      }
    });
  }

  // ── Trigger Activation Sequence ───────────────────────────────────────────
  function triggerSnakeActivation() {
    if (isSnakeActive || isActivating) return;
    isActivating = true;

    // Load saved SFX preference if available
    try {
      const sfx = localStorage.getItem('snake_sfx');
      if (sfx !== null) soundEnabled = (sfx === 'true');
    } catch {
      // Ignore localStorage error
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Power-on chime
    playTone(440, 'square', 0.08, null, 0.12);
    setTimeout(() => playTone(880, 'square', 0.15, null, 0.15), 90);

    // Create Activation Glitch Overlay
    const overlay = document.createElement('div');
    overlay.className = 'snake-activation-overlay';
    overlay.id = 'snake-activation-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Snake Game Mode Activated');

    overlay.innerHTML = `
      <div class="snake-activation-card">
        <div class="snake-activation-tag">★ SECRET EASTER EGG UNLOCKED ★</div>
        <div class="snake-activation-title">SNAKE.EXE</div>
        <div class="snake-activation-sub">EAT THE PORTFOLIO</div>
        <div class="snake-activation-bar">
          <div class="snake-activation-progress" id="snake-activation-fill"></div>
        </div>
        <div class="snake-activation-help">
          USE ARROWS / WASD TO MOVE · CONSUME VISIBLE TEXT<br>
          GROW TO EAT LARGER HEADINGS · PRESS ESC TO EXIT
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const progressFill = overlay.querySelector('#snake-activation-fill');
    setTimeout(() => {
      if (progressFill) progressFill.style.width = '100%';
    }, 40);

    const duration = prefersReducedMotion ? 250 : 850;

    setTimeout(() => {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      isActivating = false;
      launchSnakeGame();
    }, duration);
  }

  // ── DOM Text Scanner & Character Registry (Universal Edibility) ───────────
  function scanAndWrapDOMText() {
    originalHTMLMap.clear();
    characterRegistry = [];
    spatialGrid.clear();

    // Comprehensive selectors covering every text-bearing element on the website
    const eligibleSelectors = [
      'p',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'li',
      'button',
      '.btn',
      '.btn-link',
      '.btn--outline',
      '.btn--primary',
      '.btn--youtube',
      '.hobby-tag',
      '.skill-tag',
      '.tag',
      '.hero__badge',
      '.hero__subtitle-pill',
      '.hero__subtitle-sep',
      '.hero__description',
      '.project-preview__label',
      '.project-badge',
      '.highlight-card__title',
      '.highlight-card__text',
      '.timeline__title',
      '.timeline__description',
      '.timeline__date',
      '.timeline__company',
      '.contact__info-title',
      '.contact__info-text',
      '.contact__label',
      '.contact__value',
      'label.form-label',
      '.drum-card__title',
      '.drum-card__subtitle',
      '.drum-card__instruction',
      '.drum-pad',
      '.drum-btn',
      '.drum-bpm',
      '.drum-channel-link',
      '.footer__copy',
      '.footer__links a',
      '.nav__link',
      '.nav__logo'
    ];

    const elements = Array.from(document.body.querySelectorAll(eligibleSelectors.join(',')));

    // Exclude elements inside SVGs, iframes, code editors, or Snake/Retro game overlays
    const filteredElements = elements.filter(el => {
      if (el.closest('#snake-hud, #snake-canvas, .snake-activation-overlay, .snake-dialog-overlay, .snake-mobile-controls, .snake-banner-lvlup, .snake-locked-hint, #retro-hud, .retro-activation-modal, #retro-crt-overlay, svg, iframe, .hero-editor-container')) {
        return false;
      }
      const style = window.getComputedStyle(el);
      return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
    });

    // Pick top-level containers to prevent duplicate nested saves/wraps
    const topContainers = filteredElements.filter(el => {
      return !filteredElements.some(other => other !== el && other.contains(el));
    });

    // 1. Wrap individual non-whitespace characters in <span class="snake-char">
    topContainers.forEach(container => {
      // Save original innerHTML for 100% exact restoration
      originalHTMLMap.set(container, container.innerHTML);

      // Walk text nodes
      const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
          if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          const tag = parent.tagName.toLowerCase();
          if (['script', 'style', 'svg', 'iframe', 'input', 'textarea'].includes(tag)) {
            return NodeFilter.FILTER_REJECT;
          }
          if (parent.closest('#snake-hud, #snake-canvas, .snake-activation-overlay, .snake-dialog-overlay, .snake-mobile-controls, svg, iframe')) {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      });

      const textNodes = [];
      while (walker.nextNode()) {
        textNodes.push(walker.currentNode);
      }

      textNodes.forEach(node => {
        const text = node.nodeValue;
        const fragment = document.createDocumentFragment();

        for (let i = 0; i < text.length; i++) {
          const ch = text[i];
          if (/\s/.test(ch)) {
            // Keep whitespace as normal text node so browser word-wrapping is fully preserved
            fragment.appendChild(document.createTextNode(ch));
          } else {
            const span = document.createElement('span');
            span.className = 'snake-char';
            span.textContent = ch;
            span.setAttribute('data-char', ch);
            fragment.appendChild(span);
          }
        }

        if (node.parentNode) {
          node.parentNode.replaceChild(fragment, node);
        }
      });
    });

    // 2. Measure geometry and build Character Registry across the entire page
    const allSpans = document.body.querySelectorAll('.snake-char');
    allSpans.forEach((span, index) => {
      const rect = span.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const pageX = rect.left + window.scrollX;
      const pageY = rect.top + window.scrollY;
      const style = window.getComputedStyle(span);
      const fontSize = parseFloat(style.fontSize) || 16;

      // Typography size tier classification (5 Levels)
      let tier = 1;
      let points = 1;
      if (fontSize > 40) {
        tier = 5; // Level 5: Giant display text / Hero Title ("Hi, I'm Krishnasankar") / Logo (<Krishnasankar/>)
        points = 25;
      } else if (fontSize > 26) {
        tier = 4; // Level 4: Major section titles (h2), hero roles, group headers
        points = 10;
      } else if (fontSize > 18) {
        tier = 3; // Level 3: Subheadings, category titles, card titles, project names
        points = 5;
      } else if (fontSize > 14) {
        tier = 2; // Level 2: Regular body text, paragraphs, buttons, nav links, drum pads
        points = 2;
      } else {
        tier = 1; // Level 1: Small text, footer copy, tags, badges, chips, drum key numbers, dates
        points = 1;
      }

      span.setAttribute('data-tier', tier);

      const charObj = {
        id: index,
        char: span.textContent,
        span: span,
        x: pageX,
        y: pageY,
        width: rect.width,
        height: rect.height,
        fontSize: fontSize,
        tier: tier,
        points: points,
        eaten: false
      };

      characterRegistry.push(charObj);

      // Add to spatial hash grid for O(1) collision detection
      const gx = Math.floor(pageX / GRID_BUCKET_SIZE);
      const gy = Math.floor(pageY / GRID_BUCKET_SIZE);
      const key = `${gx},${gy}`;
      if (!spatialGrid.has(key)) {
        spatialGrid.set(key, []);
      }
      spatialGrid.get(key).push(charObj);
    });

    targetGoal = Math.min(characterRegistry.length, 1000);
  }

  // ── Launch Snake Game ─────────────────────────────────────────────────────
  function launchSnakeGame() {
    isSnakeActive = true;
    isPaused = false;
    isGameOver = false;
    isVictory = false;
    score = 0;
    eatenCount = 0;
    snakeLevel = 1;

    // 1. Scan DOM and convert characters to collectibles
    scanAndWrapDOMText();

    // 2. Setup Canvas Overlay
    setupCanvas();

    // 3. Initialize Snake Position
    initSnakePosition();

    // 4. Mount Retro HUD
    mountHUD();

    // 5. Mount Mobile Controls if touch screen
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      mountMobileControls();
    }

    // 6. Bind Keyboard Listeners
    window.addEventListener('keydown', handleGameKeyDown);
    window.addEventListener('resize', handleResize);

    // 7. Start Game Loop
    lastFrameTime = performance.now();
    tickAccumulator = 0;
    animationFrameId = requestAnimationFrame(gameLoop);
  }

  // ── Setup Canvas ──────────────────────────────────────────────────────────
  function setupCanvas() {
    if (document.getElementById('snake-canvas')) {
      canvas = document.getElementById('snake-canvas');
    } else {
      canvas = document.createElement('canvas');
      canvas.id = 'snake-canvas';
      document.body.appendChild(canvas);
    }

    ctx = canvas.getContext('2d');
    resizeCanvas();
  }

  function resizeCanvas() {
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    if (ctx) {
      ctx.scale(dpr, dpr);
    }
  }

  function handleResize() {
    resizeCanvas();
    if (isSnakeActive) {
      reindexCharacters();
    }
  }

  function reindexCharacters() {
    spatialGrid.clear();
    characterRegistry.forEach(charObj => {
      if (charObj.eaten || !charObj.span) return;
      const rect = charObj.span.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      charObj.x = rect.left + window.scrollX;
      charObj.y = rect.top + window.scrollY;
      charObj.width = rect.width;
      charObj.height = rect.height;

      const gx = Math.floor(charObj.x / GRID_BUCKET_SIZE);
      const gy = Math.floor(charObj.y / GRID_BUCKET_SIZE);
      const key = `${gx},${gy}`;
      if (!spatialGrid.has(key)) {
        spatialGrid.set(key, []);
      }
      spatialGrid.get(key).push(charObj);
    });
  }

  // ── Initialize Snake Entity ───────────────────────────────────────────────
  function initSnakePosition() {
    const config = LEVEL_CONFIGS[snakeLevel] || LEVEL_CONFIGS[1];
    currentSnakeWidth = config.width;
    const step = config.step;

    // Start snake in current viewport, nicely aligned with the text
    const startX = Math.floor((window.scrollX + window.innerWidth * 0.2) / step) * step;
    const startY = Math.floor((window.scrollY + Math.max(120, window.innerHeight * 0.25)) / step) * step;

    snakeHead = { x: startX, y: startY };
    snakeDirection = { dx: 1, dy: 0 };
    nextDirection = { dx: 1, dy: 0 };

    // Initial starting segments with retro "SNAKE" letters
    const initChars = ['S', 'N', 'A', 'K', 'E'];
    snakeSegments = [];
    for (let i = 0; i < initChars.length; i++) {
      snakeSegments.push({
        x: startX - (i + 1) * step,
        y: startY,
        char: initChars[i]
      });
    }
  }

  // ── Keyboard Input Controller ─────────────────────────────────────────────
  function handleGameKeyDown(e) {
    if (!isSnakeActive) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      exitSnakeMode();
      return;
    }

    if (isGameOver || isVictory) {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        restartGame();
      }
      return;
    }

    // Directional keys: Arrow Keys or WASD
    let newDx = 0;
    let newDy = 0;

    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        newDx = 0; newDy = -1;
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        newDx = 0; newDy = 1;
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        newDx = -1; newDy = 0;
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        newDx = 1; newDy = 0;
        break;
      default:
        return;
    }

    // Prevent direct 180-degree reversal
    if (newDx !== 0 && snakeDirection.dx === -newDx) return;
    if (newDy !== 0 && snakeDirection.dy === -newDy) return;

    e.preventDefault();
    nextDirection = { dx: newDx, dy: newDy };
  }

  // ── Game Loop ─────────────────────────────────────────────────────────────
  function gameLoop(timestamp) {
    if (!isSnakeActive) return;

    const dt = timestamp - lastFrameTime;
    lastFrameTime = timestamp;

    // Movement speed scaling: starts at 115ms, progressively accelerates down to 65ms
    const tickInterval = Math.max(65, 115 - Math.floor(eatenCount / 25) * 5);

    if (!isPaused && !isGameOver && !isVictory) {
      tickAccumulator += dt;
      if (tickAccumulator >= tickInterval) {
        tickAccumulator -= tickInterval;
        updateGameStep();
      }
    }

    // Render frame
    renderGame(timestamp);

    animationFrameId = requestAnimationFrame(gameLoop);
  }

  // ── Update Game Step (Physics, Collision, Growth) ──────────────────────────
  function updateGameStep() {
    snakeDirection = { ...nextDirection };

    const config = LEVEL_CONFIGS[snakeLevel] || LEVEL_CONFIGS[1];
    currentSnakeWidth = config.width;
    const step = config.step;

    const newHeadX = snakeHead.x + snakeDirection.dx * step;
    const newHeadY = snakeHead.y + snakeDirection.dy * step;

    // Document boundary wrapping & clamping
    const docWidth = document.documentElement.clientWidth || window.innerWidth;
    const docHeight = document.documentElement.scrollHeight || 4000;
    const headerHeight = 75; // Bounded below sticky header

    let wrappedX = newHeadX;
    let wrappedY = newHeadY;

    // Horizontal screen wrap
    if (wrappedX < 0) {
      wrappedX = Math.floor((docWidth - currentSnakeWidth) / step) * step;
    } else if (wrappedX >= docWidth) {
      wrappedX = 0;
    }

    // Vertical clamping / bounce
    if (wrappedY < headerHeight) {
      wrappedY = headerHeight;
      nextDirection = { dx: snakeDirection.dx || 1, dy: 1 };
    } else if (wrappedY > docHeight - 100) {
      wrappedY = docHeight - 100;
      nextDirection = { dx: snakeDirection.dx || 1, dy: -1 };
    }

    // Self-collision check scaled to snake width
    const collisionThreshold = currentSnakeWidth * 0.45;
    for (let i = 3; i < snakeSegments.length; i++) {
      const seg = snakeSegments[i];
      if (Math.abs(wrappedX - seg.x) < collisionThreshold && Math.abs(wrappedY - seg.y) < collisionThreshold) {
        triggerGameOver();
        return;
      }
    }

    // Save previous head for segment trailing
    const prevHead = { ...snakeHead };
    snakeHead = { x: wrappedX, y: wrappedY };

    // Check Character Collision using Spatial Hash Grid
    const gx = Math.floor(snakeHead.x / GRID_BUCKET_SIZE);
    const gy = Math.floor(snakeHead.y / GRID_BUCKET_SIZE);

    let eatenChar = null;

    // Check 3x3 adjacent spatial buckets
    for (let bx = gx - 1; bx <= gx + 1; bx++) {
      for (let by = gy - 1; by <= gy + 1; by++) {
        const bucket = spatialGrid.get(`${bx},${by}`);
        if (!bucket) continue;

        for (let i = 0; i < bucket.length; i++) {
          const charObj = bucket[i];
          if (charObj.eaten) continue;

          // AABB Box intersection with mouth expanding with snake width
          const headBox = {
            left: snakeHead.x - 3,
            right: snakeHead.x + currentSnakeWidth + 3,
            top: snakeHead.y - 3,
            bottom: snakeHead.y + currentSnakeWidth + 3
          };
          const charBox = {
            left: charObj.x,
            right: charObj.x + charObj.width,
            top: charObj.y,
            bottom: charObj.y + charObj.height
          };

          if (headBox.left < charBox.right &&
              headBox.right > charBox.left &&
              headBox.top < charBox.bottom &&
              headBox.bottom > charBox.top) {

            // Size tier check
            if (charObj.tier > snakeLevel) {
              // Character is too large for current level: non-fatal locked warning
              showLockedWarning(charObj);
              continue;
            }

            // Valid consumption!
            eatenChar = charObj;
            break;
          }
        }
        if (eatenChar) break;
      }
      if (eatenChar) break;
    }

    if (eatenChar) {
      // 1. Consume character
      consumeCharacter(eatenChar);

      // 2. Snake grows! New segment inserted at tail
      snakeSegments.unshift({
        x: prevHead.x,
        y: prevHead.y,
        char: eatenChar.char
      });
    } else {
      // Normal movement: shift segments forward
      for (let i = snakeSegments.length - 1; i > 0; i--) {
        snakeSegments[i].x = snakeSegments[i - 1].x;
        snakeSegments[i].y = snakeSegments[i - 1].y;
      }
      if (snakeSegments.length > 0) {
        snakeSegments[0].x = prevHead.x;
        snakeSegments[0].y = prevHead.y;
      }
    }

    // Auto-scroll viewport camera to track snake
    updateCameraScroll();
  }

  // ── Consume Character Mechanics ───────────────────────────────────────────
  function consumeCharacter(charObj) {
    charObj.eaten = true;
    charObj.span.classList.add('snake-char--eaten');
    charObj.span.style.visibility = 'hidden';

    score += charObj.points;
    eatenCount++;

    // Audio feedback
    playEatSound(charObj.tier);

    // Spawn floating score popup
    spawnFloatingPopup(charObj.x, charObj.y, `+${charObj.points}`, charObj.tier >= 3 ? '#f59e0b' : '#10b981');

    // Spawn sparks
    spawnSparks(charObj.x + charObj.width / 2, charObj.y + charObj.height / 2, charObj.tier);

    // Check Level-Up Thresholds
    checkLevelProgression();

    // Update HUD
    updateHUD();

    // Check Game Completion
    if (eatenCount >= targetGoal) {
      triggerVictory();
    }
  }

  function checkLevelProgression() {
    let newLevel = snakeLevel;
    if (eatenCount >= levelThresholds[4]) {
      newLevel = 5;
    } else if (eatenCount >= levelThresholds[3]) {
      newLevel = 4;
    } else if (eatenCount >= levelThresholds[2]) {
      newLevel = 3;
    } else if (eatenCount >= levelThresholds[1]) {
      newLevel = 2;
    }

    if (newLevel > snakeLevel) {
      snakeLevel = newLevel;
      currentSnakeWidth = LEVEL_CONFIGS[snakeLevel].width;
      playLevelUpSound(snakeLevel);
      showLevelUpBanner();
      updateHUD();
    }
  }

  function showLockedWarning(charObj) {
    if (charObj.lockedWarned) return;
    charObj.lockedWarned = true;
    playLockDing();

    const hint = document.createElement('div');
    hint.className = 'snake-locked-hint';
    hint.textContent = `NEED LVL ${charObj.tier}`;
    hint.style.left = `${charObj.x}px`;
    hint.style.top = `${charObj.y - 12}px`;
    document.body.appendChild(hint);

    setTimeout(() => {
      if (hint.parentNode) hint.parentNode.removeChild(hint);
      charObj.lockedWarned = false;
    }, 850);
  }

  function showLevelUpBanner() {
    const banner = document.createElement('div');
    banner.className = 'snake-banner-lvlup';
    const cfg = LEVEL_CONFIGS[snakeLevel] || LEVEL_CONFIGS[1];
    banner.innerHTML = `★ LEVEL UP! <span>TIER ${snakeLevel}: ${cfg.title}</span> UNLOCKED · WIDTH: <span>${cfg.width}PX</span> ★`;
    document.body.appendChild(banner);

    setTimeout(() => {
      if (banner.parentNode) banner.parentNode.removeChild(banner);
    }, 1900);
  }

  // ── Camera Tracking / Smooth Scrolling ────────────────────────────────────
  function updateCameraScroll() {
    const viewTop = window.scrollY;
    const viewBottom = window.scrollY + window.innerHeight;
    const margin = 140;

    // Scroll Down
    if (snakeHead.y > viewBottom - margin) {
      const scrollSpeed = Math.min(18, Math.max(8, (snakeHead.y - (viewBottom - margin)) * 0.4));
      window.scrollBy({ top: scrollSpeed, behavior: 'auto' });
    }
    // Scroll Up
    else if (snakeHead.y < viewTop + margin && window.scrollY > 0) {
      const scrollSpeed = Math.min(18, Math.max(8, ((viewTop + margin) - snakeHead.y) * 0.4));
      window.scrollBy({ top: -scrollSpeed, behavior: 'auto' });
    }
  }

  // ── Particle & Floating Text System ───────────────────────────────────────
  function spawnFloatingPopup(x, y, text, color) {
    floatingPopups.push({
      x: x,
      y: y,
      text: text,
      color: color,
      life: 0,
      maxLife: 45
    });
  }

  function spawnSparks(x, y, tier) {
    const count = tier >= 3 ? 8 : 4;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5);
      const speed = 1.2 + Math.random() * 2.5;
      sparkParticles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: tier >= 3 ? '#f59e0b' : '#10b981',
        life: 0,
        maxLife: 25
      });
    }
  }

  // ── Canvas Renderer ───────────────────────────────────────────────────────
  function renderGame(timestamp) {
    if (!ctx || !canvas) return;

    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    const viewWidth = window.innerWidth;
    const viewHeight = window.innerHeight;

    ctx.clearRect(0, 0, viewWidth, viewHeight);

    const config = LEVEL_CONFIGS[snakeLevel] || LEVEL_CONFIGS[1];
    const currentWidth = config.width;
    const segBoxSize = currentWidth - 2;
    const radius = Math.max(3, Math.floor(currentWidth * 0.22));

    // 1. Draw Snake Segments (Trailing Characters with Dynamic Scaling)
    ctx.font = config.font;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let i = snakeSegments.length - 1; i >= 0; i--) {
      const seg = snakeSegments[i];
      const vx = seg.x - scrollX;
      const vy = seg.y - scrollY;

      // Skip segments outside current viewport
      if (vx < -50 || vx > viewWidth + 50 || vy < -50 || vy > viewHeight + 50) continue;

      // Segment box with dynamic level glow
      ctx.shadowColor = config.glow;
      ctx.shadowBlur = Math.min(20, Math.floor(currentWidth * 0.5));
      ctx.fillStyle = config.fill;

      // Draw rounded segment
      drawRoundedRect(ctx, vx, vy, segBoxSize, segBoxSize, radius);
      ctx.fill();

      // Draw segment character
      ctx.shadowBlur = 0;
      ctx.fillStyle = config.text;
      ctx.fillText(seg.char || '•', vx + segBoxSize / 2, vy + segBoxSize / 2 + 1);
    }

    // 2. Draw Snake Head
    const headVx = snakeHead.x - scrollX;
    const headVy = snakeHead.y - scrollY;

    ctx.shadowColor = config.glow;
    ctx.shadowBlur = Math.min(26, Math.floor(currentWidth * 0.7));
    ctx.fillStyle = '#ffffff';

    drawRoundedRect(ctx, headVx, headVy, currentWidth, currentWidth, radius + 1);
    ctx.fill();

    // Draw Head Eyes with blinking, scaled to width
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#090d16';

    const isBlinking = (Math.floor(timestamp / 2400) % 2 === 0) && ((timestamp % 2400) < 140);
    const eyeSize = isBlinking ? 1 : Math.max(2, Math.floor(currentWidth * 0.18));

    let eye1X, eye1Y, eye2X, eye2Y;
    const eyeOffset1 = Math.floor(currentWidth * 0.2);
    const eyeOffset2 = Math.floor(currentWidth * 0.65);
    const eyeForward = Math.floor(currentWidth * 0.68);
    const eyeSide = Math.floor(currentWidth * 0.18);

    if (snakeDirection.dx === 1) {
      eye1X = headVx + eyeForward; eye1Y = headVy + eyeOffset1;
      eye2X = headVx + eyeForward; eye2Y = headVy + eyeOffset2;
    } else if (snakeDirection.dx === -1) {
      eye1X = headVx + eyeSide; eye1Y = headVy + eyeOffset1;
      eye2X = headVx + eyeSide; eye2Y = headVy + eyeOffset2;
    } else if (snakeDirection.dy === 1) {
      eye1X = headVx + eyeOffset1; eye1Y = headVy + eyeForward;
      eye2X = headVx + eyeOffset2; eye2Y = headVy + eyeForward;
    } else { // Up
      eye1X = headVx + eyeOffset1; eye1Y = headVy + eyeSide;
      eye2X = headVx + eyeOffset2; eye2Y = headVy + eyeSide;
    }

    ctx.fillRect(eye1X, eye1Y, eyeSize, eyeSize);
    ctx.fillRect(eye2X, eye2Y, eyeSize, eyeSize);

    // Cute animated tongue flick, scaled to snake width
    const isTongueOut = (Math.floor(timestamp / 1600) % 2 === 0) && ((timestamp % 1600) < 220);
    if (isTongueOut) {
      ctx.fillStyle = '#ef4444';
      const tLen = Math.floor(currentWidth * 0.35);
      const tThick = Math.max(2, Math.floor(currentWidth * 0.12));
      const mid = Math.floor(currentWidth / 2 - tThick / 2);

      if (snakeDirection.dx === 1) {
        ctx.fillRect(headVx + currentWidth, headVy + mid, tLen, tThick);
      } else if (snakeDirection.dx === -1) {
        ctx.fillRect(headVx - tLen, headVy + mid, tLen, tThick);
      } else if (snakeDirection.dy === 1) {
        ctx.fillRect(headVx + mid, headVy + currentWidth, tThick, tLen);
      } else if (snakeDirection.dy === -1) {
        ctx.fillRect(headVx + mid, headVy - tLen, tThick, tLen);
      }
    }

    // 3. Draw Floating Popups (+1, +5, etc.)
    for (let i = floatingPopups.length - 1; i >= 0; i--) {
      const pop = floatingPopups[i];
      pop.life++;
      pop.y -= 0.8;

      const alpha = 1 - pop.life / pop.maxLife;
      const vx = pop.x - scrollX;
      const vy = pop.y - scrollY;

      ctx.font = '9px "Press Start 2P", monospace';
      ctx.fillStyle = pop.color;
      ctx.globalAlpha = Math.max(0, alpha);
      ctx.shadowColor = pop.color;
      ctx.shadowBlur = 6;
      ctx.fillText(pop.text, vx, vy);

      if (pop.life >= pop.maxLife) {
        floatingPopups.splice(i, 1);
      }
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;

    // 4. Draw Sparks
    for (let i = sparkParticles.length - 1; i >= 0; i--) {
      const sp = sparkParticles[i];
      sp.life++;
      sp.x += sp.vx;
      sp.y += sp.vy;

      const alpha = 1 - sp.life / sp.maxLife;
      const vx = sp.x - scrollX;
      const vy = sp.y - scrollY;

      ctx.fillStyle = sp.color;
      ctx.globalAlpha = Math.max(0, alpha);
      ctx.fillRect(vx, vy, 2, 2);

      if (sp.life >= sp.maxLife) {
        sparkParticles.splice(i, 1);
      }
    }
    ctx.globalAlpha = 1;
  }

  function drawRoundedRect(c, x, y, width, height, radius) {
    c.beginPath();
    c.moveTo(x + radius, y);
    c.lineTo(x + width - radius, y);
    c.quadraticCurveTo(x + width, y, x + width, y + radius);
    c.lineTo(x + width, y + height - radius);
    c.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    c.lineTo(x + radius, y + height);
    c.quadraticCurveTo(x, y + height, x, y + height - radius);
    c.lineTo(x, y + radius);
    c.quadraticCurveTo(x, y, x + radius, y);
    c.closePath();
  }

  // ── Retro Game HUD ────────────────────────────────────────────────────────
  function mountHUD() {
    if (document.getElementById('snake-hud')) return;

    const hud = document.createElement('div');
    hud.className = 'snake-hud';
    hud.id = 'snake-hud';
    hud.setAttribute('role', 'region');
    hud.setAttribute('aria-label', 'Retro Snake HUD');

    hud.innerHTML = `
      <div class="snake-hud__header">
        <div class="snake-hud__title">
          <span class="snake-hud__dot"></span>
          <span>SNAKE.EXE</span>
        </div>
        <div class="snake-hud__actions">
          <button type="button" class="snake-hud__btn" id="snake-sfx-btn" title="Toggle sound">
            SFX: ${soundEnabled ? 'ON' : 'OFF'}
          </button>
          <button type="button" class="snake-hud__btn snake-hud__btn--exit" id="snake-exit-btn" title="Exit (Esc)">
            EXIT [ESC]
          </button>
        </div>
      </div>
      <div class="snake-hud__stats">
        <div class="snake-stat-item">
          <span class="snake-stat-label">SCORE</span>
          <span class="snake-stat-val snake-stat-val--score" id="snake-hud-score">0</span>
        </div>
        <div class="snake-stat-item">
          <span class="snake-stat-label">EATEN</span>
          <span class="snake-stat-val snake-stat-val--eaten" id="snake-hud-eaten">0 / ${targetGoal}</span>
        </div>
        <div class="snake-stat-item">
          <span class="snake-stat-label">LENGTH</span>
          <span class="snake-stat-val" id="snake-hud-len">${snakeSegments.length}</span>
        </div>
        <div class="snake-stat-item">
          <span class="snake-stat-label">LEVEL</span>
          <span class="snake-stat-val snake-stat-val--lvl" id="snake-hud-lvl">LVL 1</span>
        </div>
        <div class="snake-stat-item">
          <span class="snake-stat-label">WIDTH</span>
          <span class="snake-stat-val snake-stat-val--width" id="snake-hud-width">14PX</span>
        </div>
      </div>
      <div class="snake-hud__progress-wrap">
        <div class="snake-hud__progress-bar">
          <div class="snake-hud__progress-fill" id="snake-hud-fill"></div>
        </div>
      </div>
      <div class="snake-hud__hints">
        ARROWS / WASD TO MOVE · ESC TO EXIT
      </div>
    `;

    document.body.appendChild(hud);

    // Audio button
    const sfxBtn = hud.querySelector('#snake-sfx-btn');
    if (sfxBtn) {
      sfxBtn.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        sfxBtn.textContent = `SFX: ${soundEnabled ? 'ON' : 'OFF'}`;
        try {
          localStorage.setItem('snake_sfx', soundEnabled ? 'true' : 'false');
        } catch {
          // Ignore localStorage error
        }
        if (soundEnabled) playTone(880, 'square', 0.05);
      });
    }

    // Exit button
    const exitBtn = hud.querySelector('#snake-exit-btn');
    if (exitBtn) {
      exitBtn.addEventListener('click', () => {
        exitSnakeMode();
      });
    }
  }

  function updateHUD() {
    const scoreEl = document.getElementById('snake-hud-score');
    const eatenEl = document.getElementById('snake-hud-eaten');
    const lenEl = document.getElementById('snake-hud-len');
    const lvlEl = document.getElementById('snake-hud-lvl');
    const widthEl = document.getElementById('snake-hud-width');
    const fillEl = document.getElementById('snake-hud-fill');

    const cfg = LEVEL_CONFIGS[snakeLevel] || LEVEL_CONFIGS[1];

    if (scoreEl) scoreEl.textContent = score;
    if (eatenEl) eatenEl.textContent = `${eatenCount} / ${targetGoal}`;
    if (lenEl) lenEl.textContent = snakeSegments.length + 1;
    if (lvlEl) lvlEl.textContent = `LVL ${snakeLevel}`;
    if (widthEl) widthEl.textContent = `${cfg.width}PX`;

    if (fillEl && targetGoal > 0) {
      const pct = Math.min(100, Math.round((eatenCount / targetGoal) * 100));
      fillEl.style.width = `${pct}%`;
    }
  }

  // ── Mobile Virtual D-Pad Controller ───────────────────────────────────────
  function mountMobileControls() {
    if (document.getElementById('snake-mobile-controls')) return;

    mobileControlsEl = document.createElement('div');
    mobileControlsEl.className = 'snake-mobile-controls';
    mobileControlsEl.id = 'snake-mobile-controls';

    mobileControlsEl.innerHTML = `
      <button type="button" class="snake-dpad-btn snake-dpad-btn--up" data-dir="up" aria-label="Up">▲</button>
      <button type="button" class="snake-dpad-btn snake-dpad-btn--left" data-dir="left" aria-label="Left">◀</button>
      <button type="button" class="snake-dpad-btn snake-dpad-btn--down" data-dir="down" aria-label="Down">▼</button>
      <button type="button" class="snake-dpad-btn snake-dpad-btn--right" data-dir="right" aria-label="Right">▶</button>
    `;

    document.body.appendChild(mobileControlsEl);

    const triggerDir = (dir) => {
      let ndx = 0, ndy = 0;
      if (dir === 'up')    { ndx = 0; ndy = -1; }
      if (dir === 'down')  { ndx = 0; ndy = 1; }
      if (dir === 'left')  { ndx = -1; ndy = 0; }
      if (dir === 'right') { ndx = 1; ndy = 0; }

      if (ndx !== 0 && snakeDirection.dx === -ndx) return;
      if (ndy !== 0 && snakeDirection.dy === -ndy) return;
      nextDirection = { dx: ndx, dy: ndy };
    };

    mobileControlsEl.querySelectorAll('.snake-dpad-btn').forEach(btn => {
      btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        triggerDir(btn.getAttribute('data-dir'));
      }, { passive: false });
    });

    // Touch Swipe Gesture Detection on Canvas
    let touchStartX = 0;
    let touchStartY = 0;

    window.addEventListener('touchstart', (e) => {
      if (!isSnakeActive) return;
      if (e.target && e.target.closest('.snake-hud, .snake-mobile-controls, .snake-dialog-card')) return;
      if (e.touches && e.touches[0]) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });

    window.addEventListener('touchend', (e) => {
      if (!isSnakeActive) return;
      if (e.target && e.target.closest('.snake-hud, .snake-mobile-controls, .snake-dialog-card')) return;
      if (!e.changedTouches || !e.changedTouches[0]) return;

      const dx = e.changedTouches[0].clientX - touchStartX;
      const dy = e.changedTouches[0].clientY - touchStartY;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      if (Math.max(absDx, absDy) > 25) {
        if (absDx > absDy) {
          triggerDir(dx > 0 ? 'right' : 'left');
        } else {
          triggerDir(dy > 0 ? 'down' : 'up');
        }
      }
    }, { passive: true });
  }

  // ── Game Over & Completion Dialogs ────────────────────────────────────────
  function triggerGameOver() {
    isGameOver = true;
    playGameOverSound();

    const overlay = document.createElement('div');
    overlay.className = 'snake-dialog-overlay';
    overlay.id = 'snake-dialog-gameover';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');

    overlay.innerHTML = `
      <div class="snake-dialog-card snake-dialog-card--gameover">
        <div class="snake-dialog-icon">👾</div>
        <div class="snake-dialog-title">GAME OVER</div>
        <div class="snake-dialog-sub">THE WEBSITE SURVIVED.</div>
        <div class="snake-dialog-stats">
          <div class="snake-dialog-stat-row">
            <span>FINAL SCORE</span>
            <span style="color: var(--snake-amber);">${score}</span>
          </div>
          <div class="snake-dialog-stat-row">
            <span>CHARACTERS EATEN</span>
            <span style="color: var(--snake-cyan);">${eatenCount} / ${targetGoal}</span>
          </div>
          <div class="snake-dialog-stat-row">
            <span>MAX LENGTH</span>
            <span>${snakeSegments.length + 1}</span>
          </div>
          <div class="snake-dialog-stat-row">
            <span>TIER REACHED</span>
            <span style="color: var(--snake-green);">LVL ${snakeLevel}</span>
          </div>
        </div>
        <div class="snake-dialog-actions">
          <button type="button" class="snake-dialog-btn snake-dialog-btn--primary" id="snake-btn-retry">
            PLAY AGAIN [SPACE]
          </button>
          <button type="button" class="snake-dialog-btn snake-dialog-btn--secondary" id="snake-btn-exit">
            RETURN TO SITE [ESC]
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    overlay.querySelector('#snake-btn-retry').addEventListener('click', () => {
      restartGame();
    });
    overlay.querySelector('#snake-btn-exit').addEventListener('click', () => {
      exitSnakeMode();
    });
  }

  function triggerVictory() {
    isVictory = true;
    playVictoryFanfare();

    // Save achievement to localStorage
    try {
      localStorage.setItem('snake_achievement_eater', JSON.stringify({
        unlocked: true,
        score: score,
        characters: eatenCount,
        date: new Date().toISOString()
      }));
    } catch {
      // Ignore localStorage error
    }

    const overlay = document.createElement('div');
    overlay.className = 'snake-dialog-overlay';
    overlay.id = 'snake-dialog-victory';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');

    overlay.innerHTML = `
      <div class="snake-dialog-card snake-dialog-card--victory">
        <div class="snake-dialog-icon">🏆</div>
        <div class="snake-dialog-title">GAME COMPLETE!</div>
        <div class="snake-dialog-sub">YOU ATE THE ENTIRE WEBSITE!</div>
        <div class="snake-dialog-stats">
          <div class="snake-dialog-stat-row">
            <span>TOTAL SCORE</span>
            <span style="color: var(--snake-amber);">${score}</span>
          </div>
          <div class="snake-dialog-stat-row">
            <span>CHARACTERS CONSUMED</span>
            <span style="color: var(--snake-cyan);">${eatenCount}</span>
          </div>
          <div class="snake-dialog-stat-row">
            <span>FINAL LEVEL</span>
            <span style="color: var(--snake-green);">MAX (LVL 5)</span>
          </div>
          <div class="snake-dialog-stat-row">
            <span>ACHIEVEMENT</span>
            <span>WEBSITE EATER ★</span>
          </div>
        </div>
        <div class="snake-dialog-actions">
          <button type="button" class="snake-dialog-btn snake-dialog-btn--primary" id="snake-btn-win-exit">
            RESTORE PORTFOLIO [ESC]
          </button>
          <button type="button" class="snake-dialog-btn snake-dialog-btn--secondary" id="snake-btn-win-retry">
            PLAY AGAIN [SPACE]
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    overlay.querySelector('#snake-btn-win-exit').addEventListener('click', () => {
      exitSnakeMode();
    });
    overlay.querySelector('#snake-btn-win-retry').addEventListener('click', () => {
      restartGame();
    });
  }

  function restartGame() {
    // Remove any active dialog overlays
    document.querySelectorAll('.snake-dialog-overlay').forEach(el => {
      if (el.parentNode) el.parentNode.removeChild(el);
    });

    // 1. Lossless restore DOM text before re-wrapping
    restoreOriginalDOM();

    // 2. Restart game loop and state
    launchSnakeGame();
  }

  // ── Lossless DOM Restoration & Clean Exit ──────────────────────────────────
  function restoreOriginalDOM() {
    originalHTMLMap.forEach((originalHTML, container) => {
      if (container && container.parentNode) {
        container.innerHTML = originalHTML;
      }
    });
    originalHTMLMap.clear();
    characterRegistry = [];
    spatialGrid.clear();
  }

  function exitSnakeMode() {
    if (!isSnakeActive && !isActivating) return;
    isSnakeActive = false;
    isActivating = false;
    isPaused = false;
    isGameOver = false;
    isVictory = false;

    // 1. Cancel Animation Frame
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }

    // 2. Remove Canvas Overlay
    if (canvas && canvas.parentNode) {
      canvas.parentNode.removeChild(canvas);
      canvas = null;
      ctx = null;
    }

    // 3. Remove HUD & Modals
    const hud = document.getElementById('snake-hud');
    if (hud && hud.parentNode) hud.parentNode.removeChild(hud);

    const mobileControls = document.getElementById('snake-mobile-controls');
    if (mobileControls && mobileControls.parentNode) mobileControls.parentNode.removeChild(mobileControls);

    document.querySelectorAll('.snake-dialog-overlay, .snake-activation-overlay, .snake-banner-lvlup, .snake-locked-hint').forEach(el => {
      if (el.parentNode) el.parentNode.removeChild(el);
    });

    // 4. Remove Event Listeners
    window.removeEventListener('keydown', handleGameKeyDown);
    window.removeEventListener('resize', handleResize);

    // 5. 100% Lossless DOM Restoration
    restoreOriginalDOM();

    // 6. Return focus to header logo
    const navLogo = document.querySelector('.nav__logo');
    if (navLogo) {
      navLogo.focus({ preventScroll: true });
    }
  }

  // ── Auto-Initialize Activation Controller ─────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initActivationController);
  } else {
    initActivationController();
  }

})();
