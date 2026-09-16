/**
 * Main JavaScript for Personal Website / Portfolio
 * Handles:
 *  - Dark / Light Theme switching with localStorage persistence
 *  - Mobile Navigation Drawer Toggle (with aria-expanded)
 *  - Active Navigation Link on Scroll (IntersectionObserver-based)
 *  - Header scroll shadow
 *  - Scroll-reveal animations (IntersectionObserver)
 *  - Interactive REPL terminal in hero section
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
     8. INTERACTIVE REPL TERMINAL
     ========================================================================== */
  const replInput    = document.getElementById('repl-input');
  const replOutput   = document.getElementById('repl-output');
  const replHints    = document.querySelectorAll('.repl-hint');
  const replTabs     = document.querySelectorAll('.repl-tab');

  if (replInput && replOutput) {

    // ── Data model ─────────────────────────────────────────────────────────
    const engineer = {
      name:        'Krishnasankar',
      role:        'Senior Software Engineer',
      company:     'Oracle (OFSS)',
      experience:  '10+ Years',
      location:    'Bengaluru, India',
      coreStack:   ['Core Java', 'Spring Boot', 'Oracle SQL', 'Modern UI'],
      passions:    ['Drumming (@KrishnaDrums)', 'Android & AI Apps'],
      hobbies:     ['Board Games', 'Poi Spinning', 'Long Drives'],
    };

    // ── All queryable expressions ───────────────────────────────────────────
    const COMMANDS = [
      'engineer.name', 'engineer.role', 'engineer.company',
      'engineer.experience', 'engineer.location',
      'engineer.coreStack', 'engineer.passions', 'engineer.hobbies',
      'Object.keys(engineer)', 'engineer', 'help', 'clear',
    ];

    // ── Command history ─────────────────────────────────────────────────────
    let history    = [];
    let historyIdx = -1;

    // ── Tab-switching ───────────────────────────────────────────────────────
    replTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.tab;
        replTabs.forEach(t => {
          t.classList.toggle('repl-tab--active', t === tab);
          t.setAttribute('aria-selected', String(t === tab));
        });
        document.getElementById('panel-repl').classList.toggle('repl-panel--hidden',   target !== 'repl');
        document.getElementById('panel-source').classList.toggle('repl-panel--hidden', target !== 'source');
        if (target === 'repl') replInput.focus();
      });
    });

    // ── Helpers ─────────────────────────────────────────────────────────────
    function addLine(text, type, delay = 0) {
      return new Promise(resolve => {
        setTimeout(() => {
          const div = document.createElement('div');
          div.className = `repl-line repl-line--${type} repl-line--new`;
          div.textContent = text;
          replOutput.appendChild(div);
          replOutput.scrollTop = replOutput.scrollHeight;
          // Remove animation class after it plays so it doesn't retrigger
          div.addEventListener('animationend', () => div.classList.remove('repl-line--new'), { once: true });
          resolve(div);
        }, delay);
      });
    }

    function formatValue(val) {
      if (Array.isArray(val)) {
        const items = val.map(v => `  '${v}'`).join(',\n');
        return { text: `[\n${items}\n]`, type: 'array' };
      }
      if (typeof val === 'object' && val !== null) {
        const lines = Object.entries(val)
          .map(([k, v]) => `  ${k}: ${JSON.stringify(v)}`)
          .join(',\n');
        return { text: `{\n${lines}\n}`, type: 'object' };
      }
      if (typeof val === 'string') return { text: `'${val}'`, type: 'string' };
      if (typeof val === 'number') return { text: String(val), type: 'number' };
      return { text: String(val), type: 'info' };
    }

    function clearOutput() {
      replOutput.innerHTML = '';
      addLine('// Output cleared.', 'comment');
    }

    function showHelp() {
      const lines = [
        '// Available expressions:',
        '  engineer              → the full object',
        '  engineer.name         → \'Krishnasankar\'',
        '  engineer.role         → job title',
        '  engineer.company      → employer',
        '  engineer.experience   → years',
        '  engineer.location     → city & country',
        '  engineer.coreStack    → tech stack array',
        '  engineer.passions     → creative projects',
        '  engineer.hobbies      → life outside code',
        '  Object.keys(engineer) → all property names',
        '  clear                 → clear the output',
        '',
        '// Tip: press ↑/↓ to recall history, Tab to autocomplete.',
      ];
      lines.forEach((l, i) => {
        const type = l.startsWith('//') ? 'comment' : l.startsWith('  //') ? 'comment' : 'help';
        addLine(l, type, i * 30);
      });
    }

    // ── Evaluate user input ─────────────────────────────────────────────────
    function evaluate(raw) {
      const cmd = raw.trim();
      if (!cmd) return;

      // Record to history
      if (history[0] !== cmd) history.unshift(cmd);
      if (history.length > 30) history.pop();
      historyIdx = -1;

      addLine(cmd, 'input');

      if (cmd === 'clear') { clearOutput(); return; }
      if (cmd === 'help')  { showHelp();    return; }

      // Easter eggs
      if (/^(hi|hello|hey)$/i.test(cmd)) {
        addLine(`'Hey there! 👋 Try: engineer.name'`, 'string'); return;
      }
      if (/^(drums?|drumming|music)/i.test(cmd)) {
        addLine(`'🥁 Check out @KrishnaDrums on YouTube!'`, 'string'); return;
      }
      if (/^(42|meaning of life)/i.test(cmd)) {
        addLine(`42  // The answer to life, the universe, and everything.`, 'number'); return;
      }
      if (/^(rm\s+-rf|sudo|hack|exit)/i.test(cmd)) {
        addLine(`Error: Nice try 😄  — this REPL is sandboxed!`, 'error'); return;
      }
      if (/^console\.log/i.test(cmd)) {
        const inner = cmd.match(/console\.log\(["']?(.+?)["']?\)/)?.[1] ?? '...';
        addLine(inner, 'info'); return;
      }

      // Resolve against engineer object
      try {
        let result;
        const normalized = cmd
          .replace(/^engineer\./, '')           // strip leading engineer.
          .replace(/\[(\d+)\]/g, '[$1]');       // keep array access

        if (cmd === 'engineer' || cmd === 'engineer;') {
          result = engineer;
        } else if (cmd === 'Object.keys(engineer)') {
          result = Object.keys(engineer);
        } else if (Object.prototype.hasOwnProperty.call(engineer, normalized.split('[')[0])) {
          // Support: engineer.hobbies[0]
          const propMatch = normalized.match(/^(\w+)(?:\[(\d+)\])?$/);
          if (propMatch) {
            const prop  = propMatch[1];
            const idx   = propMatch[2] !== undefined ? Number(propMatch[2]) : undefined;
            result      = idx !== undefined ? engineer[prop]?.[idx] : engineer[prop];
          } else {
            result = engineer[normalized];
          }
        } else {
          throw new Error(`'${cmd}' is not defined`);
        }

        if (result === undefined) {
          addLine('undefined', 'info');
        } else {
          const { text, type } = formatValue(result);
          addLine(text, type);
        }
      } catch (err) {
        addLine(`ReferenceError: ${err.message}`, 'error');
        setTimeout(() => addLine('// Hint: type help for available commands.', 'comment'), 120);
      }
    }

    // ── Autocomplete ────────────────────────────────────────────────────────
    let autocompleteEl = document.querySelector('.repl-autocomplete');
    if (!autocompleteEl) {
      autocompleteEl = document.createElement('span');
      autocompleteEl.className = 'repl-autocomplete';
      autocompleteEl.setAttribute('aria-hidden', 'true');
      replInput.parentElement.appendChild(autocompleteEl);
    }

    function getSuggestion(val) {
      if (!val) return '';
      const match = COMMANDS.find(c => c.startsWith(val) && c !== val);
      return match ? match.slice(val.length) : '';
    }

    replInput.addEventListener('input', () => {
      autocompleteEl.textContent = getSuggestion(replInput.value);
    });

    // ── Keyboard handling ───────────────────────────────────────────────────
    replInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const val = replInput.value;
        autocompleteEl.textContent = '';
        replInput.value = '';
        evaluate(val);
      }

      if (e.key === 'Tab') {
        e.preventDefault();
        const suggestion = getSuggestion(replInput.value);
        if (suggestion) {
          replInput.value += suggestion;
          autocompleteEl.textContent = '';
        }
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (historyIdx < history.length - 1) {
          historyIdx++;
          replInput.value = history[historyIdx];
          autocompleteEl.textContent = getSuggestion(replInput.value);
          // Move cursor to end
          setTimeout(() => replInput.setSelectionRange(replInput.value.length, replInput.value.length), 0);
        }
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (historyIdx > 0) {
          historyIdx--;
          replInput.value = history[historyIdx];
        } else {
          historyIdx = -1;
          replInput.value = '';
        }
        autocompleteEl.textContent = getSuggestion(replInput.value);
      }
    });

    // ── Hint chip clicks ────────────────────────────────────────────────────
    replHints.forEach(btn => {
      btn.addEventListener('click', () => {
        replInput.value = btn.dataset.cmd;
        autocompleteEl.textContent = '';
        replInput.focus();
        evaluate(btn.dataset.cmd);
        replInput.value = '';
      });
    });

    // ── Click anywhere in the output area focuses the input ────────────────
    replOutput.addEventListener('click', () => replInput.focus());

    // ── Auto-run a welcome demo after a short delay ─────────────────────────
    setTimeout(() => {
      if (replOutput.children.length <= 2) { // only if still showing welcome msgs
        replInput.placeholder = 'engineer.name';
      }
    }, 1800);
  }

});

