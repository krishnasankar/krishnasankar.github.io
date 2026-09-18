/**
 * ==========================================================================
 * KRISHNASANKAR.EXE — 8-BIT RETRO GAME MODE (KONAMI CODE EASTER EGG)
 * Activated by: ↑ ↑ ↓ ↓ ← → ← → B A
 * Mobile secret: 5 rapid taps on the nav logo within 2 seconds
 * Exit by: Escape key or [EXIT] button in HUD
 * ==========================================================================
 */

(() => {
  'use strict';

  // ── State Variables ───────────────────────────────────────────────────────
  let isRetroActive = false;
  let audioCtx = null;
  let soundEnabled = true;
  let activeNavIndex = 0;
  let keySequenceTimer = null;
  let touchTapCounter = 0;
  let touchTapTimer = null;
  let lastActivationTime = 0;

  const KONAMI_SEQUENCE = [
    'ArrowUp',
    'ArrowUp',
    'ArrowDown',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight',
    'ArrowLeft',
    'ArrowRight',
    'b',
    'a',
  ];
  let konamiIndex = 0;

  // ── Web Audio API 8-Bit Chiptune Sound Synthesizer ────────────────────────
  function getAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playTone(freq, type, duration, startTime, vol = 0.15) {
    if (!soundEnabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const t = startTime || ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type || 'square';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(vol, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + duration + 0.02);
    } catch {
      // Ignore audio synthesis errors on locked browsers
    }
  }

  function playKeyBlip() {
    // Subtle arcade chirp on each correct Konami key
    const freqs = [330, 392, 440, 523, 587, 659, 784, 880, 988, 1175];
    const f = freqs[konamiIndex % freqs.length] || 440;
    playTone(f, 'square', 0.06, null, 0.1);
  }

  function playCheatCodeFanfare() {
    const ctx = getAudioContext();
    if (!ctx || !soundEnabled) return;
    const now = ctx.currentTime;
    // Classic 8-bit fanfare arpeggio: C5 -> E5 -> G5 -> C6 -> G5 -> C6
    playTone(523.25, 'square', 0.12, now, 0.18);
    playTone(659.25, 'square', 0.12, now + 0.1, 0.18);
    playTone(783.99, 'square', 0.12, now + 0.2, 0.18);
    playTone(1046.50, 'square', 0.28, now + 0.3, 0.22);
    playTone(783.99, 'square', 0.1, now + 0.58, 0.16);
    playTone(1046.50, 'square', 0.45, now + 0.68, 0.24);
  }

  function playNavTick() {
    playTone(880, 'square', 0.04, null, 0.08);
  }

  function playExitWarp() {
    const ctx = getAudioContext();
    if (!ctx || !soundEnabled) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(750, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.25);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.26);
    } catch {
      // Silent on error
    }
  }

  // ── Konami Code Detector ──────────────────────────────────────────────────
  function initKonamiDetector() {
    window.addEventListener('keydown', (e) => {
      // Ignore typing inside forms, textareas, contenteditable or code editors
      const tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : '';
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || (e.target && e.target.isContentEditable)) {
        return;
      }

      // Ignore modifier keys
      if (e.ctrlKey || e.altKey || e.metaKey) {
        return;
      }

      // If retro mode is active, handle Esc and Menu navigation
      if (isRetroActive) {
        if (e.key === 'Escape') {
          e.preventDefault();
          exitRetroMode();
          return;
        }

        if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'Up' || e.key === 'Down') {
          e.preventDefault();
          handleRetroKeyboardNav((e.key === 'ArrowDown' || e.key === 'Down') ? 1 : -1);
          return;
        }

        if (e.key === 'Enter') {
          // Ignore reflex 'Start' (Enter) pressed immediately after 'A'
          if (Date.now() - lastActivationTime < 800) {
            return;
          }
          const links = document.querySelectorAll('.nav__link');
          if (links[activeNavIndex]) {
            e.preventDefault();
            const targetId = links[activeNavIndex].getAttribute('href');
            if (targetId && targetId.startsWith('#')) {
              const targetEl = document.querySelector(targetId);
              if (targetEl) {
                targetEl.scrollIntoView({ behavior: 'smooth' });
              }
            } else {
              links[activeNavIndex].click();
            }
          }
          return;
        }
      }

      // Normalize key across e.key, e.code, and legacy browser identifiers
      let pressedKey = '';
      if (e.code === 'ArrowUp' || e.key === 'ArrowUp' || e.key === 'Up') {
        pressedKey = 'ArrowUp';
      } else if (e.code === 'ArrowDown' || e.key === 'ArrowDown' || e.key === 'Down') {
        pressedKey = 'ArrowDown';
      } else if (e.code === 'ArrowLeft' || e.key === 'ArrowLeft' || e.key === 'Left') {
        pressedKey = 'ArrowLeft';
      } else if (e.code === 'ArrowRight' || e.key === 'ArrowRight' || e.key === 'Right') {
        pressedKey = 'ArrowRight';
      } else if (e.code === 'KeyB' || e.key.toLowerCase() === 'b') {
        pressedKey = 'b';
      } else if (e.code === 'KeyA' || e.key.toLowerCase() === 'a') {
        pressedKey = 'a';
      } else {
        pressedKey = e.key;
      }

      // Normal Mode: match Konami sequence: ↑ ↑ ↓ ↓ ← → ← → B A
      const expectedKey = KONAMI_SEQUENCE[konamiIndex];

      if (pressedKey === expectedKey) {
        playKeyBlip();
        konamiIndex++;

        // Reset timer if idle > 3 seconds
        clearTimeout(keySequenceTimer);
        keySequenceTimer = setTimeout(() => {
          konamiIndex = 0;
        }, 3000);

        if (konamiIndex === KONAMI_SEQUENCE.length) {
          clearTimeout(keySequenceTimer);
          konamiIndex = 0;
          if (!isRetroActive) {
            triggerActivationSequence();
          }
        }
      } else {
        // If wrong key, check if it can start or continue with ArrowUp
        clearTimeout(keySequenceTimer);
        if (pressedKey === 'ArrowUp') {
          // If already pressed an ArrowUp, keep at 2 so next ArrowDown continues smoothly
          konamiIndex = (konamiIndex >= 1) ? 2 : 1;
          playKeyBlip();
        } else {
          konamiIndex = 0;
        }
      }
    });
  }

  // ── Secret Mobile Activation: 5 Rapid Taps on Logo ─────────────────────────
  function initMobileSecret() {
    const navLogo = document.querySelector('.nav__logo');
    if (!navLogo) return;

    navLogo.addEventListener('click', (e) => {
      // Count rapid taps within 2s window
      touchTapCounter++;
      clearTimeout(touchTapTimer);

      touchTapTimer = setTimeout(() => {
        touchTapCounter = 0;
      }, 2000);

      if (touchTapCounter >= 5) {
        e.preventDefault();
        touchTapCounter = 0;
        clearTimeout(touchTapTimer);
        if (!isRetroActive) {
          triggerActivationSequence();
        } else {
          exitRetroMode();
        }
      }
    });
  }

  // ── Retro Keyboard Navigation (Arrow Keys + Enter) ─────────────────────────
  function handleRetroKeyboardNav(delta) {
    const navLinks = Array.from(document.querySelectorAll('.nav__link'));
    if (navLinks.length === 0) return;

    activeNavIndex = (activeNavIndex + delta + navLinks.length) % navLinks.length;
    playNavTick();

    navLinks.forEach((link, idx) => {
      if (idx === activeNavIndex) {
        link.classList.add('active-link');
        link.focus({ preventScroll: true });
      } else {
        link.classList.remove('active-link');
      }
    });
  }

  // ── Activation Sequence Orchestrator ──────────────────────────────────────
  function triggerActivationSequence() {
    playCheatCodeFanfare();

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Create activation modal
    const modal = document.createElement('div');
    modal.className = 'retro-activation-modal';
    modal.id = 'retro-activation-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', '8-Bit Mode Activated');

    modal.innerHTML = `
      <div class="retro-activation-box">
        <div class="retro-activation-box__header">★ CHEAT CODE ACCEPTED ★</div>
        <div class="retro-activation-box__title">KRISHNASANKAR.EXE</div>
        <div class="retro-activation-box__subtitle">8-BIT MODE ACTIVATED</div>
        <div class="retro-activation-box__progress-bar">
          <div class="retro-activation-box__progress-fill" id="retro-progress-fill"></div>
        </div>
        <div class="retro-activation-box__tip">ENTERING DEVELOPER RETRO MODE... [PRESS ESC TO CANCEL]</div>
      </div>
    `;

    document.body.appendChild(modal);

    const progressFill = modal.querySelector('#retro-progress-fill');

    // Smooth progress fill
    setTimeout(() => {
      if (progressFill) progressFill.style.width = '100%';
    }, 50);

    // Escape listener to skip sequence
    const skipHandler = (e) => {
      if (e.key === 'Escape' || e.type === 'click') {
        cleanupSequence();
        applyRetroMode();
      }
    };

    window.addEventListener('keydown', skipHandler, { once: true });
    modal.addEventListener('click', skipHandler, { once: true });

    const duration = prefersReducedMotion ? 600 : 1500;

    const sequenceTimeout = setTimeout(() => {
      cleanupSequence();
      applyRetroMode();
    }, duration);

    function cleanupSequence() {
      clearTimeout(sequenceTimeout);
      window.removeEventListener('keydown', skipHandler);
      if (modal && modal.parentNode) {
        modal.parentNode.removeChild(modal);
      }
    }
  }

  // ── Apply Retro Mode & Dynamic Enhancements ────────────────────────────────
  function applyRetroMode() {
    isRetroActive = true;
    lastActivationTime = Date.now();
    document.documentElement.setAttribute('data-mode', 'retro');

    // 1. Mount CRT Scanline Overlay
    if (!document.getElementById('retro-crt-overlay')) {
      const crt = document.createElement('div');
      crt.className = 'retro-crt-overlay';
      crt.id = 'retro-crt-overlay';
      crt.setAttribute('aria-hidden', 'true');
      document.body.appendChild(crt);
    }

    // 2. Mount Retro HUD Bar
    mountRetroHUD();

    // 3. Mount RPG Character Profile Card in About / Hero
    mountRPGCharacterCard();

    // 4. Enhance Skills with Decorative RPG Stat View
    enhanceSkillsRPGView();

    // 5. Enhance Projects with Mission Headers
    enhanceProjectsMissionView();

    // 6. Show Achievement Banner
    showAchievementBanner();

    // 7. Save unlock state to localStorage
    try {
      localStorage.setItem('retro_mode_unlocked', 'true');
    } catch {
      // Ignore localStorage errors
    }
  }

  // ── Mount Retro HUD ───────────────────────────────────────────────────────
  function mountRetroHUD() {
    if (document.getElementById('retro-hud')) return;

    const hud = document.createElement('aside');
    hud.className = 'retro-hud';
    hud.id = 'retro-hud';
    hud.setAttribute('role', 'region');
    hud.setAttribute('aria-label', 'Retro Game HUD');

    hud.innerHTML = `
      <div class="retro-hud__left">
        <span class="retro-hud__status-dot"></span>
        <span>[1P] KRISHNA</span>
      </div>
      <div class="retro-hud__center">
        <span>CLASS: SR. SOFTWARE ENGINEER</span>
        <span>·</span>
        <span>LVL: 10+ YRS (OFSS)</span>
        <span>·</span>
        <span>MODE: 8-BIT</span>
      </div>
      <div class="retro-hud__right">
        <button type="button" class="retro-hud__btn" id="retro-sound-btn" title="Toggle 8-bit sound effects">
          SFX: ${soundEnabled ? 'ON' : 'OFF'}
        </button>
        <button type="button" class="retro-hud__btn retro-hud__btn--exit" id="retro-exit-btn" title="Exit 8-Bit Mode (or press Esc)">
          EXIT [ESC]
        </button>
      </div>
    `;

    document.body.prepend(hud);

    // Sound toggle
    const soundBtn = document.getElementById('retro-sound-btn');
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        soundBtn.textContent = `SFX: ${soundEnabled ? 'ON' : 'OFF'}`;
        if (soundEnabled) playNavTick();
      });
    }

    // Exit button
    const exitBtn = document.getElementById('retro-exit-btn');
    if (exitBtn) {
      exitBtn.addEventListener('click', () => {
        exitRetroMode();
      });
    }
  }

  // ── RPG Character Card (Strictly Portfolio Facts) ──────────────────────────
  function mountRPGCharacterCard() {
    if (document.getElementById('retro-character-card')) return;

    const heroContent = document.querySelector('.hero__content');
    if (!heroContent) return;

    const card = document.createElement('div');
    card.className = 'retro-character-card';
    card.id = 'retro-character-card';

    card.innerHTML = `
      <div class="retro-character-card__header">
        <h3 class="retro-character-card__title">
          <span>👾</span> PLAYER PROFILE: KRISHNA
        </h3>
        <span class="retro-character-card__tag">CLASS: SR. SOFTWARE ENGINEER</span>
      </div>
      <div class="retro-character-grid">
        <div class="retro-stat-box">
          <span class="retro-stat-box__label">GUILD / EMPLOYER</span>
          <div class="retro-stat-box__value">Oracle Financial Services Software (OFSS)</div>
        </div>
        <div class="retro-stat-box">
          <span class="retro-stat-box__label">EXPERIENCE / LEVEL</span>
          <div class="retro-stat-box__value">10+ Years · Bengaluru, India</div>
        </div>
        <div class="retro-stat-box">
          <span class="retro-stat-box__label">PRIMARY TECH ABILITIES</span>
          <ul class="retro-character-card__list">
            <li><strong>CORE JAVA:</strong> Scalable Enterprise Architecture</li>
            <li><strong>SPRING BOOT:</strong> RESTful Microservices</li>
            <li><strong>ORACLE SQL:</strong> Database Modeling & Optimization</li>
            <li><strong>ANDROID SDK:</strong> Room DB, MVVM & Offline Apps</li>
            <li><strong>AI TOOLING:</strong> OpenRouter LLM Tool Calling</li>
          </ul>
        </div>
        <div class="retro-stat-box">
          <span class="retro-stat-box__label">ACTIVE SIDE QUESTS</span>
          <ul class="retro-character-card__list">
            <li><strong>DRUMS:</strong> Trinity Grade 3 Distinction (@KrishnaDrums)</li>
            <li><strong>STRATEGY:</strong> Catan, Saboteur, Video Games</li>
            <li><strong>FLOW ARTS:</strong> Poi Spinning (Māori Coordination Art)</li>
          </ul>
        </div>
      </div>
    `;

    // Insert just below hero buttons
    const heroButtons = heroContent.querySelector('.hero__buttons');
    if (heroButtons) {
      heroContent.insertBefore(card, heroButtons.nextSibling);
    } else {
      heroContent.appendChild(card);
    }
  }

  // ── Decorative RPG Skills View ─────────────────────────────────────────────
  function enhanceSkillsRPGView() {
    const skillsHeader = document.querySelector('.skills .section__header');
    if (skillsHeader && !document.getElementById('retro-skills-disclaimer')) {
      const disclaimer = document.createElement('p');
      disclaimer.id = 'retro-skills-disclaimer';
      disclaimer.className = 'retro-skills-disclaimer';
      disclaimer.textContent = '[ RETRO STAT VIEW // DECORATIVE RPG ATTRIBUTE DISPLAY ]';
      skillsHeader.appendChild(disclaimer);
    }

    // Add decorative 8-bit attribute blocks to skill tags
    const skillTags = document.querySelectorAll('.skill-tag');
    skillTags.forEach((tag) => {
      if (!tag.querySelector('.retro-stat-bar')) {
        const bar = document.createElement('span');
        bar.className = 'retro-stat-bar';
        bar.setAttribute('aria-hidden', 'true');
        bar.style.color = 'var(--retro-green)';
        bar.style.marginLeft = '5px';
        bar.textContent = '[■■■■■]';
        tag.appendChild(bar);
      }
    });
  }

  // ── Mission View for Project Cards ────────────────────────────────────────
  function enhanceProjectsMissionView() {
    const projectCards = document.querySelectorAll('.project-card');
    const missionTitles = [
      'MISSION 01: OFFLINE ANDROID PERSISTENCE',
      'MISSION 02: AUTONOMOUS AI AGENT & TOOL CALLING',
      'MISSION 03: ZERO-BUILD WEB ARCHITECTURE',
      'MISSION 04: RETRO ARCADE 2D GAME ENGINE'
    ];

    projectCards.forEach((card, idx) => {
      if (!card.querySelector('.retro-mission-header')) {
        const header = document.createElement('div');
        header.className = 'retro-mission-header';
        header.innerHTML = `<span>★</span> <span>${missionTitles[idx] || `MISSION 0${idx + 1}`}</span>`;
        const content = card.querySelector('.project-card__content');
        if (content) {
          content.prepend(header);
        }
      }
    });
  }

  // ── Achievement Banner ────────────────────────────────────────────────────
  function showAchievementBanner() {
    if (document.getElementById('retro-achievement')) return;

    const banner = document.createElement('div');
    banner.className = 'retro-achievement';
    banner.id = 'retro-achievement';
    banner.setAttribute('role', 'alert');
    banner.setAttribute('aria-live', 'polite');

    banner.innerHTML = `
      <div class="retro-achievement__icon" aria-hidden="true">🏆</div>
      <div class="retro-achievement__text">
        <span class="retro-achievement__badge">ACHIEVEMENT UNLOCKED</span>
        <h4 class="retro-achievement__title">CHEAT CODE MASTER</h4>
        <p class="retro-achievement__desc">You discovered the hidden 8-bit developer mode!</p>
      </div>
      <button type="button" class="retro-achievement__close" aria-label="Close notification">&times;</button>
    `;

    document.body.appendChild(banner);

    const closeBtn = banner.querySelector('.retro-achievement__close');
    const dismiss = () => {
      banner.classList.add('hide');
      setTimeout(() => {
        if (banner.parentNode) banner.parentNode.removeChild(banner);
      }, 400);
    };

    if (closeBtn) closeBtn.addEventListener('click', dismiss);
    setTimeout(dismiss, 5000);
  }

  // ── Clean Exit & State Restoration ────────────────────────────────────────
  function exitRetroMode() {
    if (!isRetroActive) return;
    isRetroActive = false;

    playExitWarp();

    // Remove retro attribute
    document.documentElement.removeAttribute('data-mode');

    // Remove CRT overlay
    const crt = document.getElementById('retro-crt-overlay');
    if (crt && crt.parentNode) crt.parentNode.removeChild(crt);

    // Remove HUD
    const hud = document.getElementById('retro-hud');
    if (hud && hud.parentNode) hud.parentNode.removeChild(hud);

    // Remove RPG Character Card
    const charCard = document.getElementById('retro-character-card');
    if (charCard && charCard.parentNode) charCard.parentNode.removeChild(charCard);

    // Remove Skills disclaimer and restore tag labels
    const disclaimer = document.getElementById('retro-skills-disclaimer');
    if (disclaimer && disclaimer.parentNode) disclaimer.parentNode.removeChild(disclaimer);

    document.querySelectorAll('.retro-stat-bar').forEach(bar => {
      if (bar.parentNode) bar.parentNode.removeChild(bar);
    });

    // Remove Mission Headers
    const missionHeaders = document.querySelectorAll('.retro-mission-header');
    missionHeaders.forEach(mh => {
      if (mh.parentNode) mh.parentNode.removeChild(mh);
    });

    // Remove Achievement Banner
    const banner = document.getElementById('retro-achievement');
    if (banner && banner.parentNode) banner.parentNode.removeChild(banner);

    // Restore active nav link
    document.querySelectorAll('.nav__link').forEach(link => {
      link.blur();
    });
  }

  // ── Initialize on DOMContentLoaded ────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initKonamiDetector();
      initMobileSecret();
    });
  } else {
    initKonamiDetector();
    initMobileSecret();
  }

})();
