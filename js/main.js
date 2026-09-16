/**
 * Main JavaScript for Personal Website / Portfolio
 * Handles:
 *  - Dark / Light Theme switching with localStorage persistence
 *  - Mobile Navigation Drawer Toggle
 *  - Active Navigation Link on Scroll
 *  - Dynamic Copyright Year
 *  - Contact Form submission preview & feedback
 */

document.addEventListener('DOMContentLoaded', () => {
  /* ==========================================================================
     1. THEME SWITCHER (Dark / Light Mode)
     ========================================================================== */
  const themeToggleBtn = document.getElementById('theme-toggle');
  const rootElement = document.documentElement;

  // Retrieve saved theme preference or default to system preference
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');

  rootElement.setAttribute('data-theme', initialTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = rootElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

      rootElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
    });
  }

  /* ==========================================================================
     2. MOBILE NAVIGATION MENU
     ========================================================================== */
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav__link');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });

    // Close menu when clicking on any nav link
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!navMenu.contains(e.target) && !navToggle.contains(e.target) && navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
      }
    });
  }

  /* ==========================================================================
     3. ACTIVE NAV LINK HIGHLIGHT ON SCROLL
     ========================================================================== */
  const sections = document.querySelectorAll('section[id]');

  const highlightActiveSection = () => {
    const scrollY = window.pageYOffset;

    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 120;
      const sectionId = current.getAttribute('id');
      const activeLink = document.querySelector(`.nav__link[href*="${sectionId}"]`);

      if (activeLink) {
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
          activeLink.classList.add('active-link');
        } else {
          activeLink.classList.remove('active-link');
        }
      }
    });
  };

  window.addEventListener('scroll', highlightActiveSection);
  highlightActiveSection();

  /* ==========================================================================
     4. DYNAMIC YEAR IN FOOTER
     ========================================================================== */
  const yearElement = document.getElementById('year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  /* ==========================================================================
     5. CONTACT FORM HANDLER (Web3Forms)
     ========================================================================== */
  const contactForm = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status');
  const submitBtn = document.getElementById('submit-btn');

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const message = document.getElementById('message').value.trim();

      if (!name || !email || !message) {
        formStatus.textContent = 'Please fill out all fields.';
        formStatus.className = 'form-status error';
        return;
      }

      const formData = new FormData(contactForm);
      const object = Object.fromEntries(formData);

      if (object.access_key === 'YOUR_ACCESS_KEY_HERE') {
        formStatus.textContent = 'Please add your Web3Forms Access Key in index.html to receive messages.';
        formStatus.className = 'form-status error';
        return;
      }

      // Feedback animation for user
      const originalBtnText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>Sending...</span>';
      formStatus.textContent = '';
      formStatus.className = 'form-status';

      try {
        const response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(object)
        });

        const result = await response.json();

        if (response.status === 200 && result.success) {
          formStatus.textContent = 'Thank you! Your message has been sent successfully.';
          formStatus.className = 'form-status success';
          contactForm.reset();
        } else {
          formStatus.textContent = result.message || 'Something went wrong. Please try again.';
          formStatus.className = 'form-status error';
        }
      } catch (error) {
        formStatus.textContent = 'Oops! There was a network error sending your message.';
        formStatus.className = 'form-status error';
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;

        // Clear status message after 6 seconds
        setTimeout(() => {
          formStatus.textContent = '';
          formStatus.className = 'form-status';
        }, 6000);
      }
    });
  }
});
