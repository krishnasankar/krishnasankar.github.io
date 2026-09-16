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

    // ── 16-Step Drum Groove Sequencer ────────────────────────────────────────
    // 108 BPM rock/funk pocket beat with ghost fills
    const GROOVE_BPM = 108;
    const STEP_TIME  = (60 / GROOVE_BPM) / 4; // 16th note duration (~139ms)

    // Beat map for 16 steps (step 0 to 15)
    const grooveSteps = [
      ['kick', 'hihat', 'crash'], // Step 0  (Beat 1 - accent)
      [],                         // Step 1
      ['hihat'],                  // Step 2  (8th note)
      [],                         // Step 3
      ['snare', 'hihat'],         // Step 4  (Beat 2)
      [],                         // Step 5
      ['hihat'],                  // Step 6  (8th note)
      ['kick'],                   // Step 7  (syncopated upbeat kick)
      ['kick', 'hihat'],          // Step 8  (Beat 3)
      [],                         // Step 9
      ['hihat'],                  // Step 10 (8th note)
      ['tom'],                    // Step 11 (mid fill)
      ['snare', 'hihat'],         // Step 12 (Beat 4)
      [],                         // Step 13
      ['hihat'],                  // Step 14 (8th note)
      ['snare'],                  // Step 15 (ghost snare tap)
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
        currentStep = (currentStep + 1) % 16;
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
        grooveBtn.setAttribute('aria-label', 'Play automatic drum groove demo');
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

});

