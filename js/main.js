/**
 * Main JavaScript for Personal Website / Portfolio
 * Handles:
 *  - Dark / Light Theme switching with localStorage persistence
 *  - Mobile Navigation Drawer Toggle (with aria-expanded)
 *  - Active Navigation Link on Scroll (IntersectionObserver-based)
 *  - Header scroll shadow
 *  - Scroll-reveal animations (IntersectionObserver)
 *  - Interactive Drum Pad & Beat Machine in hero section (@KrishnaDrums)
 *  - Dynamic Copyright Year
 *  - Contact Form submission with loading state & feedback
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================================================
     1. THEME SWITCHER (Dark / Light Mode)
     ========================================================================== */
  const themeToggleBtn = document.getElementById('theme-toggle');
  const rootElement    = document.documentElement;

  // Retrieve saved theme or fall back to system preference
  const savedTheme       = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme     = savedTheme || (systemPrefersDark ? 'dark' : 'light');

  rootElement.setAttribute('data-theme', initialTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = rootElement.getAttribute('data-theme');
      const newTheme     = currentTheme === 'dark' ? 'light' : 'dark';
      rootElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
    });
  }

  /* ==========================================================================
     2. MOBILE NAVIGATION MENU
     ========================================================================== */
  const navToggle = document.getElementById('nav-toggle');
  const navMenu   = document.getElementById('nav-menu');
  const navLinks  = document.querySelectorAll('.nav__link');

  const closeMenu = () => {
    if (navMenu)   navMenu.classList.remove('active');
    if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
  };

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('active');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    // Close when clicking any nav link
    navLinks.forEach(link => link.addEventListener('click', closeMenu));

    // Close when clicking outside the menu
    document.addEventListener('click', (e) => {
      if (
        !navMenu.contains(e.target) &&
        !navToggle.contains(e.target) &&
        navMenu.classList.contains('active')
      ) {
        closeMenu();
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMenu.classList.contains('active')) {
        closeMenu();
        navToggle.focus();
      }
    });
  }

  /* ==========================================================================
     3. HEADER SCROLL SHADOW
     ========================================================================== */
  const header = document.getElementById('header');

  if (header) {
    const onScroll = () => {
      header.classList.toggle('scrolled', window.scrollY > 20);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // Run once on load
  }

  /* ==========================================================================
     4. ACTIVE NAV LINK HIGHLIGHT ON SCROLL
     ========================================================================== */
  const sections = document.querySelectorAll('section[id]');

  if (sections.length > 0) {
    const navObserverOptions = {
      rootMargin: '-30% 0px -60% 0px',
      threshold: 0,
    };

    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const id       = entry.target.getAttribute('id');
        const link     = document.querySelector(`.nav__link[href="#${id}"]`);
        if (!link) return;

        if (entry.isIntersecting) {
          document.querySelectorAll('.nav__link').forEach(l => l.classList.remove('active-link'));
          link.classList.add('active-link');
        }
      });
    }, navObserverOptions);

    sections.forEach(section => navObserver.observe(section));
  }

  /* ==========================================================================
     5. SCROLL REVEAL ANIMATIONS (IntersectionObserver)
     ========================================================================== */
  const revealElements = document.querySelectorAll('.reveal');

  if (revealElements.length > 0 &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target); // Animate once
        }
      });
    }, {
      rootMargin: '0px 0px -60px 0px',
      threshold: 0.08,
    });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    // If reduced-motion: make all elements visible immediately
    revealElements.forEach(el => el.classList.add('visible'));
  }

  /* ==========================================================================
     6. DYNAMIC YEAR IN FOOTER
     ========================================================================== */
  const yearElement = document.getElementById('year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  /* ==========================================================================
     7. CONTACT FORM HANDLER (Web3Forms)
     ========================================================================== */
  const contactForm = document.getElementById('contact-form');
  const formStatus  = document.getElementById('form-status');
  const submitBtn   = document.getElementById('submit-btn');

  if (contactForm && formStatus && submitBtn) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name    = document.getElementById('name').value.trim();
      const email   = document.getElementById('email').value.trim();
      const message = document.getElementById('message').value.trim();

      if (!name || !email || !message) {
        formStatus.textContent = 'Please fill out all fields.';
        formStatus.className   = 'form-status error';
        return;
      }

      const formData = new FormData(contactForm);
      const object   = Object.fromEntries(formData);

      if (object.access_key === 'YOUR_ACCESS_KEY_HERE') {
        formStatus.textContent = 'Please add your Web3Forms Access Key in index.html to receive messages.';
        formStatus.className   = 'form-status error';
        return;
      }

      // Animate button while submitting
      const originalBtnHTML   = submitBtn.innerHTML;
      submitBtn.disabled      = true;
      submitBtn.innerHTML     = '<span>Sending…</span>';
      formStatus.textContent  = '';
      formStatus.className    = 'form-status';

      try {
        const response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(object),
        });

        const result = await response.json();

        if (response.status === 200 && result.success) {
          formStatus.textContent = '✓ Thank you! Your message has been sent successfully.';
          formStatus.className   = 'form-status success';
          contactForm.reset();
        } else {
          formStatus.textContent = result.message || 'Something went wrong. Please try again.';
          formStatus.className   = 'form-status error';
        }
      } catch {
        formStatus.textContent = 'Network error — please check your connection and try again.';
        formStatus.className   = 'form-status error';
      } finally {
        submitBtn.disabled  = false;
        submitBtn.innerHTML = originalBtnHTML;

        // Auto-clear status after 7 s
        setTimeout(() => {
          formStatus.textContent = '';
          formStatus.className   = 'form-status';
        }, 7000);
      }
    });
  }

  /* ==========================================================================
     8. INTERACTIVE DRUM PAD & BEAT MACHINE (@KrishnaDrums)
     ========================================================================== */
  const drumCard      = document.getElementById('drum-card');
  const drumPads      = document.querySelectorAll('.drum-pad');
  const grooveBtn     = document.getElementById('drum-groove-btn');
  const grooveIcon    = document.getElementById('groove-icon');
  const grooveText    = document.getElementById('groove-text');
  const muteBtn       = document.getElementById('drum-mute-btn');

  if (drumCard && drumPads.length > 0) {
    let audioCtx   = null;
    let masterGain = null;
    let noiseBuff  = null;
    let isMuted    = false;

    // ── Minimize / Maximize Toggle ───────────────────────────────────────────
    const toggleBtn  = document.getElementById('drum-toggle-btn');
    const cardHeader = document.getElementById('drum-card-header');
    let isMinimized  = false;

    function toggleMinimize() {
      isMinimized = !isMinimized;
      drumCard.classList.toggle('drum-card--minimized', isMinimized);
      if (isMinimized && typeof stopGroove === 'function' && isGroovePlaying) {
        stopGroove();
      }
      if (toggleBtn) {
        toggleBtn.setAttribute('aria-expanded', isMinimized ? 'false' : 'true');
        toggleBtn.setAttribute('aria-label', isMinimized ? 'Maximize drum pad' : 'Minimize drum pad');
        toggleBtn.setAttribute('title', isMinimized ? 'Maximize' : 'Minimize');
      }
    }

    if (toggleBtn) {
      toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMinimize();
      });
    }

    // Clicking header while collapsed expands the card
    if (cardHeader) {
      cardHeader.addEventListener('click', () => {
        if (isMinimized) {
          toggleMinimize();
        }
      });
    }

    // ── Lazy AudioContext Initialization ─────────────────────────────────────
    function initAudio() {
      if (!audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return null;
        audioCtx = new AudioContextClass();

        masterGain = audioCtx.createGain();
        masterGain.gain.setValueAtTime(0.85, audioCtx.currentTime);
        masterGain.connect(audioCtx.destination);

        // Pre-render a 2-second white noise buffer for snare, hats, crash
        const bufferSize = audioCtx.sampleRate * 2;
        noiseBuff = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const output = noiseBuff.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }
      }

      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      return audioCtx;
    }

    // ── Sound Synthesizers ──────────────────────────────────────────────────
    function playKick(time) {
      if (!initAudio()) return;
      const t = time || audioCtx.currentTime;

      const osc  = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      // Pitch drop from 145Hz to 32Hz
      osc.frequency.setValueAtTime(145, t);
      osc.frequency.exponentialRampToValueAtTime(32, t + 0.08);

      // Punchy volume envelope
      gain.gain.setValueAtTime(1.0, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(t);
      osc.stop(t + 0.36);
    }

    function playSnare(time) {
      if (!initAudio()) return;
      const t = time || audioCtx.currentTime;

      // 1. Tonal body (triangle wave 185Hz -> 65Hz)
      const osc     = audioCtx.createOscillator();
      const oscGain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(185, t);
      osc.frequency.exponentialRampToValueAtTime(65, t + 0.07);
      oscGain.gain.setValueAtTime(0.7, t);
      oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
      osc.connect(oscGain);
      oscGain.connect(masterGain);
      osc.start(t);
      osc.stop(t + 0.13);

      // 2. Snare rattle (filtered noise)
      if (noiseBuff) {
        const noise     = audioCtx.createBufferSource();
        const filter    = audioCtx.createBiquadFilter();
        const noiseGain = audioCtx.createGain();

        noise.buffer = noiseBuff;
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1250, t);
        filter.Q.setValueAtTime(1.2, t);

        noiseGain.gain.setValueAtTime(0.85, t);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(masterGain);

        noise.start(t);
        noise.stop(t + 0.23);
      }
    }

    function playHiHat(time) {
      if (!initAudio()) return;
      const t = time || audioCtx.currentTime;

      if (noiseBuff) {
        const noise  = audioCtx.createBufferSource();
        const filter = audioCtx.createBiquadFilter();
        const gain   = audioCtx.createGain();

        noise.buffer = noiseBuff;
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(7500, t);

        // Fast metallic sizzle
        gain.gain.setValueAtTime(0.75, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.055);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(masterGain);

        noise.start(t);
        noise.stop(t + 0.06);
      }
    }

    function playTom(time) {
      if (!initAudio()) return;
      const t = time || audioCtx.currentTime;

      const osc  = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(130, t);
      osc.frequency.exponentialRampToValueAtTime(55, t + 0.2);

      gain.gain.setValueAtTime(0.9, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.32);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(t);
      osc.stop(t + 0.33);
    }

    function playCrash(time) {
      if (!initAudio()) return;
      const t = time || audioCtx.currentTime;

      if (noiseBuff) {
        const noise  = audioCtx.createBufferSource();
        const filter = audioCtx.createBiquadFilter();
        const gain   = audioCtx.createGain();

        noise.buffer = noiseBuff;
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(4500, t);

        // Long splash decay
        gain.gain.setValueAtTime(0.65, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(masterGain);

        noise.start(t);
        noise.stop(t + 1.25);
      }
    }

    // ── Sound Dispatcher ───────────────────────────────────────────────────
    const soundMap = {
      kick:  playKick,
      snare: playSnare,
      hihat: playHiHat,
      tom:   playTom,
      crash: playCrash,
    };

    function triggerPad(sound, time) {
      const fn = soundMap[sound];
      if (fn) fn(time);

      // Visual pad hit animation
      const padEl = document.querySelector(`.drum-pad[data-sound="${sound}"]`);
      if (padEl) {
        padEl.classList.remove('drum-pad--active');
        void padEl.offsetWidth; // force reflow for re-trigger
        padEl.classList.add('drum-pad--active');
        setTimeout(() => padEl.classList.remove('drum-pad--active'), 120);
      }
    }

    // ── Pad Pointer / Click Listeners ───────────────────────────────────────
    drumPads.forEach(pad => {
      // Use pointerdown for zero tap latency on touch devices
      pad.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        initAudio();
        const sound = pad.getAttribute('data-sound');
        triggerPad(sound);
      });
    });

    // ── Keyboard Shortcuts ──────────────────────────────────────────────────
    const keyMap = {
      '1': 'kick',  'k': 'kick',  'K': 'kick',
      '2': 'snare', 's': 'snare', 'S': 'snare',
      '3': 'hihat', 'h': 'hihat', 'H': 'hihat',
      '4': 'tom',   't': 'tom',   'T': 'tom',
      '5': 'crash', 'c': 'crash', 'C': 'crash',
    };

    window.addEventListener('keydown', (e) => {
      // Do not respond to keyboard inputs if the drum card is minimized
      if (isMinimized) return;

      // Ignore key events when the user is typing in form fields
      const tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : '';
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || (e.target && e.target.isContentEditable)) {
        return;
      }

      if (keyMap[e.key]) {
        e.preventDefault();
        initAudio();
        triggerPad(keyMap[e.key]);
      } else if (e.key === ' ' && grooveBtn) {
        // Spacebar toggles groove
        e.preventDefault();
        toggleGroove();
      }
    });

    // ── Mute / Unmute ───────────────────────────────────────────────────────
    if (muteBtn) {
      muteBtn.addEventListener('click', () => {
        initAudio();
        isMuted = !isMuted;
        if (masterGain) {
          masterGain.gain.setValueAtTime(isMuted ? 0 : 0.85, audioCtx.currentTime);
        }
        muteBtn.classList.toggle('is-muted', isMuted);
        muteBtn.setAttribute('aria-label', isMuted ? 'Unmute drum sound' : 'Mute drum sound');
        muteBtn.innerHTML = isMuted
          ? `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>`
          : `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>`;
      });
    }

    // ── Radiohead - "Creep" Drum Groove Sequencer ───────────────────────────
    // Iconic verse beat at original song tempo (92 BPM)
    const GROOVE_BPM = 92;
    const STEP_TIME  = (60 / GROOVE_BPM) / 4; // 16th note duration (~163ms)

    // 2-Bar (32-step) loop of the classic verse groove from Radiohead's "Creep":
    // Straight 8th-note closed hi-hats, snare backbeat on 2 & 4, and signature kick on 1, 3, and 3-&.
    // Bar 1 starts with downbeat Crash + Kick; Bar 2 keeps the tight pocket rolling.
    const grooveSteps = [
      // ── Bar 1 ─────────────────────────────────────────────────────────────
      ['kick', 'crash'],          // Step 0  [Beat 1] Downbeat Kick + Crash
      [],                         // Step 1
      ['hihat'],                  // Step 2  [1 &] Hi-Hat
      [],                         // Step 3
      ['snare', 'hihat'],         // Step 4  [Beat 2] Snare + Hi-Hat
      [],                         // Step 5
      ['hihat'],                  // Step 6  [2 &] Hi-Hat
      [],                         // Step 7
      ['kick', 'hihat'],          // Step 8  [Beat 3] Kick + Hi-Hat
      [],                         // Step 9
      ['kick', 'hihat'],          // Step 10 [3 &] Kick + Hi-Hat
      [],                         // Step 11
      ['snare', 'hihat'],         // Step 12 [Beat 4] Snare + Hi-Hat
      [],                         // Step 13
      ['hihat'],                  // Step 14 [4 &] Hi-Hat
      [],                         // Step 15

      // ── Bar 2 ─────────────────────────────────────────────────────────────
      ['kick', 'hihat'],          // Step 16 [Beat 1] Kick + Hi-Hat
      [],                         // Step 17
      ['hihat'],                  // Step 18 [1 &] Hi-Hat
      [],                         // Step 19
      ['snare', 'hihat'],         // Step 20 [Beat 2] Snare + Hi-Hat
      [],                         // Step 21
      ['hihat'],                  // Step 22 [2 &] Hi-Hat
      [],                         // Step 23
      ['kick', 'hihat'],          // Step 24 [Beat 3] Kick + Hi-Hat
      [],                         // Step 25
      ['kick', 'hihat'],          // Step 26 [3 &] Kick + Hi-Hat
      [],                         // Step 27
      ['snare', 'hihat'],         // Step 28 [Beat 4] Snare + Hi-Hat
      [],                         // Step 29
      ['hihat'],                  // Step 30 [4 &] Hi-Hat
      [],                         // Step 31
    ];

    let isGroovePlaying  = false;
    let currentStep      = 0;
    let nextStepTime     = 0;
    let scheduleInterval = null;

    function scheduleGroove() {
      // Lookahead scheduling using audioCtx.currentTime for rock-solid timing
      while (nextStepTime < audioCtx.currentTime + 0.1) {
        const sounds = grooveSteps[currentStep];
        sounds.forEach(snd => triggerPad(snd, nextStepTime));

        nextStepTime += STEP_TIME;
        currentStep = (currentStep + 1) % grooveSteps.length;
      }
    }

    function startGroove() {
      initAudio();
      isGroovePlaying = true;
      currentStep = 0;
      nextStepTime = audioCtx.currentTime + 0.05;

      if (grooveBtn) {
        grooveBtn.classList.add('is-playing');
        grooveIcon.textContent = '⏹';
        grooveText.textContent = 'Stop Groove';
        grooveBtn.setAttribute('aria-label', 'Stop drum groove');
      }

      scheduleInterval = setInterval(scheduleGroove, 25);
    }

    function stopGroove() {
      isGroovePlaying = false;
      if (scheduleInterval) {
        clearInterval(scheduleInterval);
        scheduleInterval = null;
      }

      if (grooveBtn) {
        grooveBtn.classList.remove('is-playing');
        grooveIcon.textContent = '▶';
        grooveText.textContent = 'Play Groove';
        grooveBtn.setAttribute('aria-label', 'Play Radiohead - Creep drum groove');
      }
    }

    function toggleGroove() {
      if (isGroovePlaying) {
        stopGroove();
      } else {
        startGroove();
      }
    }

    if (grooveBtn) {
      grooveBtn.addEventListener('click', toggleGroove);
    }
  }

  /* ==========================================================================
     INTERACTIVE HOBBIES DRAWER
     ========================================================================== */
  const hobbyDrawer = document.getElementById('hobby-drawer');
  const hobbyButtons = document.querySelectorAll('.hobby-tag--btn');
  const hobbyPanes = document.querySelectorAll('.hobby-drawer__pane');
  const hobbyCloseButtons = document.querySelectorAll('.hobby-drawer__close');
  const drummingLink = document.querySelector('.hobby-tag--link');

  if (hobbyDrawer && hobbyButtons.length > 0) {
    function closeHobbyDrawer() {
      hobbyDrawer.hidden = true;
      hobbyButtons.forEach((btn) => {
        btn.setAttribute('aria-expanded', 'false');
        btn.classList.remove('is-active');
      });
      hobbyPanes.forEach((pane) => pane.classList.remove('is-active'));
    }

    function openHobbyPane(hobbyKey, triggerBtn) {
      const targetPane = document.getElementById(`hobby-pane-${hobbyKey}`);
      if (!targetPane) return;

      const isAlreadyActive = triggerBtn.getAttribute('aria-expanded') === 'true';

      if (isAlreadyActive) {
        closeHobbyDrawer();
        return;
      }

      // Reset all buttons & panes
      hobbyButtons.forEach((btn) => {
        btn.setAttribute('aria-expanded', 'false');
        btn.classList.remove('is-active');
      });
      hobbyPanes.forEach((pane) => pane.classList.remove('is-active'));

      // Activate selected
      triggerBtn.setAttribute('aria-expanded', 'true');
      triggerBtn.classList.add('is-active');
      hobbyDrawer.hidden = false;
      targetPane.classList.add('is-active');
    }

    hobbyButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const hobbyKey = btn.getAttribute('data-hobby');
        openHobbyPane(hobbyKey, btn);
      });
    });

    hobbyCloseButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeHobbyDrawer();
      });
    });

    if (drummingLink) {
      drummingLink.addEventListener('click', () => {
        closeHobbyDrawer();
      });
    }


    // Close on Escape key if inside drawer
    hobbyDrawer.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const activeBtn = document.querySelector('.hobby-tag--btn.is-active');
        closeHobbyDrawer();
        if (activeBtn) activeBtn.focus();
      }
    });
  }

  /* ==========================================================================
     11. HERO INTERACTIVE TEXT & LIVE HTML EDITOR
     - Enlarged custom cursor appears when hovering over hero text
     - Double-click reveals actual HTML version with tags and styles
     - Edit format/styles and press Tab or click outside to commit changes
     - Esc cancels edit; "Reset Original" button restores default text
     ========================================================================== */
  const initHeroInteractiveText = () => {
    const heroContent = document.querySelector('.hero__content');
    if (!heroContent) return;

    // Cache of original outerHTML snippets by element identity for resetting
    const originalSnippets = new WeakMap();

    // Currently open editor state
    let activeEditor = null;

    // Check hover capability
    const isHoverCapable = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    // Create the enlarged custom cursor element
    let heroCursor = document.getElementById('hero-cursor');
    if (!heroCursor && isHoverCapable) {
      heroCursor = document.createElement('div');
      heroCursor.className = 'hero-cursor';
      heroCursor.id = 'hero-cursor';
      heroCursor.setAttribute('aria-hidden', 'true');
      heroCursor.innerHTML = `
        <span class="hero-cursor__glyph">&lt;/&gt;</span>
        <span class="hero-cursor__badge">Double-click to edit</span>
      `;
      document.body.appendChild(heroCursor);

      // Track cursor position and hover status
      window.addEventListener('pointermove', (e) => {
        heroCursor.style.left = `${e.clientX}px`;
        heroCursor.style.top = `${e.clientY}px`;

        if (activeEditor) {
          heroCursor.classList.remove('is-active');
          return;
        }

        const interactiveEl = e.target.closest('.hero-interactive-text');
        if (interactiveEl && heroContent.contains(interactiveEl)) {
          heroCursor.classList.add('is-active');
        } else {
          heroCursor.classList.remove('is-active');
        }
      });

      // Quick scale punch on click
      window.addEventListener('pointerdown', (e) => {
        if (e.target.closest('.hero-interactive-text')) {
          heroCursor.classList.add('is-clicked');
        }
      });

      window.addEventListener('pointerup', () => {
        heroCursor.classList.remove('is-clicked');
      });

      document.addEventListener('mouseleave', () => {
        heroCursor.classList.remove('is-active');
      });
    }

    // Helper to auto-resize textarea height to its content
    const autoResizeTextarea = (ta) => {
      ta.style.height = 'auto';
      ta.style.height = `${Math.max(68, ta.scrollHeight + 4)}px`;
    };

    // Helper to open the live HTML editor on an interactive element
    const openEditor = (targetElement) => {
      // If already editing, close previous
      if (activeEditor) {
        if (activeEditor.originalElement === targetElement) return;
        activeEditor.commit();
      }

      // Hide custom cursor during editing
      if (heroCursor) heroCursor.classList.remove('is-active');

      // Save initial HTML for this element if not already saved
      if (!originalSnippets.has(targetElement)) {
        originalSnippets.set(targetElement, targetElement.outerHTML);
      }

      const initialHtml = targetElement.outerHTML;

      // Create editor container
      const editorContainer = document.createElement('div');
      editorContainer.className = 'hero-editor-container';

      editorContainer.innerHTML = `
        <div class="hero-editor-header">
          <span class="hero-editor-badge">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
              <polyline points="16 18 22 12 16 6"></polyline>
              <polyline points="8 6 2 12 8 18"></polyline>
            </svg>
            HTML Code Editor
          </span>
          <span class="hero-editor-tips">Press <kbd>Tab</kbd> or click outside to apply · <kbd>Esc</kbd> to cancel</span>
        </div>
        <textarea class="hero-html-editor" spellcheck="false" aria-label="Edit HTML code"></textarea>
        <div class="hero-editor-footer">
          <button type="button" class="hero-editor-btn hero-editor-btn--reset" title="Restore original text before edits">↺ Reset Original</button>
          <button type="button" class="hero-editor-btn hero-editor-btn--cancel">Cancel</button>
          <button type="button" class="hero-editor-btn hero-editor-btn--apply">✓ Apply</button>
        </div>
      `;

      const textarea = editorContainer.querySelector('.hero-html-editor');
      const resetBtn = editorContainer.querySelector('.hero-editor-btn--reset');
      const cancelBtn = editorContainer.querySelector('.hero-editor-btn--cancel');
      const applyBtn = editorContainer.querySelector('.hero-editor-btn--apply');

      textarea.value = initialHtml.trim();

      // Insert editor before target and temporarily hide target
      targetElement.style.display = 'none';
      targetElement.parentNode.insertBefore(editorContainer, targetElement);

      autoResizeTextarea(textarea);

      let isFinished = false;

      const cleanupListeners = () => {
        document.removeEventListener('pointerdown', onDocumentPointerDown, true);
        activeEditor = null;
      };

      const cancelEdit = () => {
        if (isFinished) return;
        isFinished = true;
        cleanupListeners();
        editorContainer.remove();
        targetElement.style.display = '';
      };

      const commitEdit = () => {
        if (isFinished) return;
        isFinished = true;
        cleanupListeners();

        const rawVal = textarea.value.trim();
        if (!rawVal) {
          editorContainer.remove();
          targetElement.style.display = '';
          return;
        }

        // Parse HTML
        const temp = document.createElement('div');
        temp.innerHTML = rawVal;

        // If user provided a single root HTML tag (e.g. <h1...> or <p...> or <div...>)
        if (temp.children.length === 1 && rawVal.startsWith('<') && rawVal.endsWith('>')) {
          const newEl = temp.firstElementChild;
          // Ensure new element retains interactive class and title
          newEl.classList.add('hero-interactive-text');
          newEl.setAttribute('data-hero-interactive', 'true');
          if (!newEl.hasAttribute('title')) {
            newEl.setAttribute('title', 'Double click to edit HTML');
          }

          // Transfer original snippet cache to new element
          const originalSnippet = originalSnippets.get(targetElement) || initialHtml;
          originalSnippets.set(newEl, originalSnippet);

          editorContainer.replaceWith(newEl);
          targetElement.remove();

          // Flash success animation
          newEl.classList.add('hero-flash-success');
          setTimeout(() => newEl.classList.remove('hero-flash-success'), 900);
        } else {
          // User edited inner HTML or plain text
          targetElement.innerHTML = rawVal;
          editorContainer.remove();
          targetElement.style.display = '';

          // Flash success animation
          targetElement.classList.add('hero-flash-success');
          setTimeout(() => targetElement.classList.remove('hero-flash-success'), 900);
        }
      };

      // Outside boundary click handler
      const onDocumentPointerDown = (e) => {
        if (!editorContainer.contains(e.target)) {
          commitEdit();
        }
      };

      // Bind active editor record
      activeEditor = {
        container: editorContainer,
        originalElement: targetElement,
        commit: commitEdit,
        cancel: cancelEdit,
      };

      // Listen for outside clicks after slight tick to prevent trigger from current dblclick
      setTimeout(() => {
        document.addEventListener('pointerdown', onDocumentPointerDown, true);
      }, 50);

      // Textarea keyboard shortcuts: Tab / Shift+Tab / Esc / Ctrl+Enter
      textarea.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
          e.preventDefault();
          commitEdit();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          cancelEdit();
        } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          commitEdit();
        }
      });

      // Auto-resize on typing
      textarea.addEventListener('input', () => autoResizeTextarea(textarea));

      // Button event listeners
      cancelBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        cancelEdit();
      });

      applyBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        commitEdit();
      });

      resetBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const orig = originalSnippets.get(targetElement);
        if (orig) {
          textarea.value = orig.trim();
          autoResizeTextarea(textarea);
        }
      });

      // Focus textarea
      setTimeout(() => {
        textarea.focus();
      }, 20);
    };

    // Event delegation on hero content for double-click
    heroContent.addEventListener('dblclick', (e) => {
      // Don't trigger if inside an already open editor
      if (e.target.closest('.hero-editor-container')) return;

      const interactiveTarget = e.target.closest('.hero-interactive-text');
      if (interactiveTarget && heroContent.contains(interactiveTarget)) {
        e.preventDefault();
        openEditor(interactiveTarget);
      }
    });
  };

  initHeroInteractiveText();

  /* ==========================================================================
     10. SKILLS BOX GRAVITY COLLAPSE ON HOVER (ALL BOXES)
     ========================================================================== */
  const initSkillsGravity = () => {
    const categories = document.querySelectorAll('.skills__category');
    if (categories.length === 0) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    categories.forEach((categoryBox) => {
      const skillsList = categoryBox.querySelector('.skills__list');
      if (!skillsList) return;

      const tags = Array.from(skillsList.querySelectorAll('.skill-tag'));
      const N = tags.length;
      if (N === 0) return;

      let isFallen = false;
      let animFrameId = null;
      let restoreTimeout = null;
      let tagsData = [];

      const xPattern   = [-28, 28, 0, -35, 35, -5, -20, 20, 0];
      const rotPattern = [-4, 6, -7, 10, -9, 8, -12, 11, -3];

      const triggerFall = () => {
        if (isFallen) return;
        isFallen = true;

        if (restoreTimeout) {
          clearTimeout(restoreTimeout);
          restoreTimeout = null;
        }
        if (animFrameId) {
          cancelAnimationFrame(animFrameId);
          animFrameId = null;
        }

        categoryBox.classList.add('gravity-active');

        if (prefersReducedMotion) {
          tags.forEach((tag, idx) => {
            const progress = N - 1 - idx;
            const tier = progress < 3 ? 0 : (progress < 6 ? 22 : 44);
            const xShift = xPattern[progress % xPattern.length];
            const rot = rotPattern[progress % rotPattern.length];
            tag.style.transition = 'transform 0.4s ease';
            tag.style.transform = `translate3d(${xShift}px, ${30 + tier * 0.3}px, 0) rotate(${rot * 0.5}deg)`;
          });
          return;
        }

        // Measure live box boundaries
        const boxRect = categoryBox.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(categoryBox);
        const paddingBottom = parseFloat(computedStyle.paddingBottom) || 28;
        const floorY = boxRect.bottom - paddingBottom;
        const boxCenterX = boxRect.left + boxRect.width / 2;

        const now = performance.now();
        tagsData = tags.map((tag, idx) => {
          const rect = tag.getBoundingClientRect();
          const progress = N - 1 - idx;

          const tier = progress < 3 ? 0 : (progress < 6 ? 22 : (progress < 8 ? 44 : 52));
          const delay = progress * 22; // bottom tags drop first
          const xShift = xPattern[progress % xPattern.length];
          const targetRot = rotPattern[progress % rotPattern.length];

          const targetY = (floorY - tier) - rect.bottom;
          const tagCenterX = rect.left + rect.width / 2;
          const targetX = (boxCenterX - tagCenterX) * 0.4 + xShift;

          tag.style.transition = 'none';
          tag.style.willChange = 'transform';
          tag.style.zIndex = String(10 + (N - 1 - idx));

          return {
            el: tag,
            idx,
            targetX,
            targetY,
            targetRot,
            delay,
            x: 0,
            y: 0,
            rot: 0,
            vy: 0,
            bounces: 0,
            settled: false
          };
        });

        const gravity = 3200; // px/s^2 for tactile, responsive drop
        let lastTime = performance.now();

        const physicsStep = (time) => {
          if (!isFallen) return;

          const dt = Math.min((time - lastTime) / 1000, 0.033);
          lastTime = time;
          const elapsed = time - now;

          let allSettled = true;

          tagsData.forEach((item) => {
            if (elapsed < item.delay) {
              allSettled = false;
              return;
            }

            if (item.settled) return;

            allSettled = false;

            // Gravity acceleration
            item.vy += gravity * dt;
            item.y += item.vy * dt;

            // Smooth interpolation towards pile slot
            item.x += (item.targetX - item.x) * Math.min(1, 15 * dt);
            item.rot += (item.targetRot - item.rot) * Math.min(1, 14 * dt);

            // Floor collision check
            if (item.y >= item.targetY) {
              item.y = item.targetY;
              if (item.bounces < 2 && Math.abs(item.vy) > 120) {
                item.vy = -item.vy * 0.28;
                item.bounces++;
              } else {
                item.vy = 0;
                item.x = item.targetX;
                item.rot = item.targetRot;
                item.settled = true;
              }
            }

            item.el.style.transform = `translate3d(${item.x.toFixed(1)}px, ${item.y.toFixed(1)}px, 0) rotate(${item.rot.toFixed(1)}deg)`;
          });

          if (!allSettled) {
            animFrameId = requestAnimationFrame(physicsStep);
          } else {
            animFrameId = null;
          }
        };

        animFrameId = requestAnimationFrame(physicsStep);
      };

      const triggerRestore = () => {
        if (!isFallen) return;
        isFallen = false;

        if (animFrameId) {
          cancelAnimationFrame(animFrameId);
          animFrameId = null;
        }

        categoryBox.classList.remove('gravity-active');

        // Staggered magnetic spring return
        tags.forEach((tag, idx) => {
          const returnDelay = idx * 22;
          tag.style.transition = `transform 0.48s cubic-bezier(0.34, 1.56, 0.64, 1) ${returnDelay}ms`;
          tag.style.transform = 'translate3d(0, 0, 0) rotate(0deg)';
        });

        const totalReturnTime = 480 + (tags.length * 22) + 60;
        restoreTimeout = setTimeout(() => {
          tags.forEach((tag) => {
            tag.style.transition = '';
            tag.style.transform = '';
            tag.style.zIndex = '';
            tag.style.willChange = '';
          });
          restoreTimeout = null;
        }, totalReturnTime);
      };

      // Desktop hover
      categoryBox.addEventListener('mouseenter', triggerFall);
      categoryBox.addEventListener('mouseleave', triggerRestore);

      // Mobile / touch tap toggling
      categoryBox.addEventListener('click', () => {
        if (window.matchMedia('(hover: none)').matches) {
          if (isFallen) {
            triggerRestore();
          } else {
            triggerFall();
          }
        }
      });

      // Tap outside to restore
      document.addEventListener('pointerdown', (e) => {
        if (isFallen && !categoryBox.contains(e.target)) {
          triggerRestore();
        }
      });

      // Micro-interaction: playful nudge on fallen tiles
      tags.forEach((tag) => {
        tag.addEventListener('mouseenter', () => {
          if (isFallen && !animFrameId) {
            const item = tagsData.find(d => d.el === tag);
            if (item && item.settled) {
              tag.style.transition = 'transform 0.15s ease-out';
              tag.style.transform = `translate3d(${item.targetX}px, ${(item.targetY - 8).toFixed(1)}px, 0) rotate(${(item.targetRot * 1.3).toFixed(1)}deg) scale(1.05)`;
            }
          }
        });
        tag.addEventListener('mouseleave', () => {
          if (isFallen && !animFrameId) {
            const item = tagsData.find(d => d.el === tag);
            if (item && item.settled) {
              tag.style.transition = 'transform 0.2s ease-out';
              tag.style.transform = `translate3d(${item.targetX}px, ${item.targetY.toFixed(1)}px, 0) rotate(${item.targetRot.toFixed(1)}deg) scale(1)`;
            }
          }
        });
      });
    });
  };

  initSkillsGravity();

});

