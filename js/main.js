/**
 * Main JavaScript for Personal Website / Portfolio
 * Handles:
 *  - Dark / Light Theme switching with localStorage persistence
 *  - Mobile Navigation Drawer Toggle (with aria-expanded)
 *  - Active Navigation Link on Scroll (IntersectionObserver-based)
 *  - Header scroll shadow
 *  - Scroll-reveal animations (IntersectionObserver)
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

});
