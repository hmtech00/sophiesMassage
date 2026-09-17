/* ==========================================================================
   Sophie's Spa Massage — interactions
   Header scroll state, mobile nav, scroll reveal, smooth anchor scrolling
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Header scroll state ---------- */
  const header = document.getElementById('site-header');
  const heroImg = document.getElementById('hero-img');
  const SCROLL_THRESHOLD = 40;

  const updateHeaderState = () => {
    if (window.scrollY > SCROLL_THRESHOLD) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };
  updateHeaderState();
  window.addEventListener('scroll', updateHeaderState, { passive: true });

  /* ---------- Subtle hero image settle-in ---------- */
  if (heroImg && !prefersReducedMotion) {
    requestAnimationFrame(() => {
      heroImg.style.transform = 'scale(1)';
    });
  } else if (heroImg) {
    heroImg.style.transition = 'none';
    heroImg.style.transform = 'scale(1)';
  }

  /* ---------- Mobile navigation ---------- */
  const menuToggle = document.getElementById('menu-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  const mobileOverlay = document.getElementById('mobile-nav-overlay');
  const mobileLinks = mobileNav ? mobileNav.querySelectorAll('a') : [];

  const openMenu = () => {
    mobileNav.classList.add('is-open');
    mobileOverlay.classList.add('is-open');
    mobileNav.setAttribute('aria-hidden', 'false');
    menuToggle.setAttribute('aria-expanded', 'true');
    menuToggle.setAttribute('aria-label', 'Close menu');
    document.body.style.overflow = 'hidden';
  };

  const closeMenu = () => {
    mobileNav.classList.remove('is-open');
    mobileOverlay.classList.remove('is-open');
    mobileNav.setAttribute('aria-hidden', 'true');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open menu');
    document.body.style.overflow = '';
  };

  if (menuToggle && mobileNav && mobileOverlay) {
    menuToggle.addEventListener('click', () => {
      const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
      isOpen ? closeMenu() : openMenu();
    });

    mobileOverlay.addEventListener('click', closeMenu);

    mobileLinks.forEach((link) => {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
        closeMenu();
        menuToggle.focus();
      }
    });
  }

  /* ---------- Smooth anchor scrolling with header offset ---------- */
  const headerHeight = () => header ? header.offsetHeight : 0;

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - headerHeight() + 1;

      window.scrollTo({
        top,
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
      });

      history.pushState(null, '', targetId);
    });
  });

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll('.reveal, .reveal-up');

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );

    revealEls.forEach((el) => observer.observe(el));

    /* Hero text reveals immediately on load, not on scroll */
    document.querySelectorAll('.hero .reveal').forEach((el) => {
      el.classList.add('is-visible');
      observer.unobserve(el);
    });
  }

  /* ---------- Booking form ---------- */
  const bookingForm = document.getElementById('booking-form');
  const bookingNote = document.getElementById('booking-form-note');
  const BOOKING_EMAIL = 'sophiespamassagedublin@gmail.com';

  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();

      if (!bookingForm.checkValidity()) {
        bookingForm.reportValidity();
        return;
      }

      const name = bookingForm.name.value.trim();
      const email = bookingForm.email.value.trim();
      const phone = bookingForm.phone.value.trim();
      const treatment = bookingForm.treatment.value;

      const subject = `Booking Request — ${treatment}`;
      const body =
        `Name: ${name}\n` +
        `Email: ${email}\n` +
        `Phone: ${phone}\n` +
        `Desired massage: ${treatment}\n`;

      const mailtoUrl =
        `mailto:${BOOKING_EMAIL}` +
        `?subject=${encodeURIComponent(subject)}` +
        `&body=${encodeURIComponent(body)}`;

      if (bookingNote) {
        bookingNote.textContent = 'Opening your email app to send the request…';
      }

      window.location.href = mailtoUrl;
    });
  }
});
