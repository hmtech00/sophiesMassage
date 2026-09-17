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
    const fields = {
      name: bookingForm.querySelector('#booking-name'),
      email: bookingForm.querySelector('#booking-email'),
      phone: bookingForm.querySelector('#booking-phone'),
      treatment: bookingForm.querySelector('#booking-treatment'),
    };

    /* Pre-select a treatment when arriving from a "View Treatment" page,
       e.g. index.html?treatment=Deep%20Tissue%20Release#booking */
    const params = new URLSearchParams(window.location.search);
    const requestedTreatment = params.get('treatment');
    if (requestedTreatment && fields.treatment) {
      const match = Array.from(fields.treatment.options).find(
        (opt) => opt.value === requestedTreatment
      );
      if (match) fields.treatment.value = requestedTreatment;
    }

    /* "Enquire" links on the Treatments cards pre-select their treatment
       and scroll to the form, without a page reload. */
    document.querySelectorAll('.treatment-select-link').forEach((link) => {
      link.addEventListener('click', () => {
        const name = link.getAttribute('data-treatment');
        if (name && fields.treatment) fields.treatment.value = name;
      });
    });

    const clearFieldError = (field) => {
      field.classList.remove('field-invalid');
      const err = bookingForm.querySelector(`[data-error-for="${field.id}"]`);
      if (err) err.textContent = '';
    };

    const setFieldError = (field, message) => {
      field.classList.add('field-invalid');
      const err = bookingForm.querySelector(`[data-error-for="${field.id}"]`);
      if (err) err.textContent = message;
    };

    Object.values(fields).forEach((field) => {
      if (!field) return;
      field.addEventListener('input', () => clearFieldError(field));
      field.addEventListener('change', () => clearFieldError(field));
    });

    const validateForm = () => {
      let isValid = true;

      if (!fields.name.value.trim()) {
        setFieldError(fields.name, 'Please enter your name.');
        isValid = false;
      }

      const emailValue = fields.email.value.trim();
      if (!emailValue || !fields.email.checkValidity()) {
        setFieldError(fields.email, 'Please enter a valid email address.');
        isValid = false;
      }

      if (!fields.phone.value.trim()) {
        setFieldError(fields.phone, 'Please enter a phone number.');
        isValid = false;
      }

      if (!fields.treatment.value) {
        setFieldError(fields.treatment, 'Please choose a treatment.');
        isValid = false;
      }

      return isValid;
    };

    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();

      if (!validateForm()) {
        if (bookingNote) {
          bookingNote.textContent = 'Please check the highlighted fields above.';
        }
        return;
      }

      const name = fields.name.value.trim();
      const email = fields.email.value.trim();
      const phone = fields.phone.value.trim();
      const treatment = fields.treatment.value;

      const subject = `Booking Enquiry — ${treatment}`;
      const body =
        `Name: ${name}\n` +
        `Email: ${email}\n` +
        `Phone: ${phone}\n` +
        `Desired massage: ${treatment}\n`;

      /* This site is static and has no booking backend: submitting opens a
         pre-filled email to the studio instead of confirming an appointment.
         To wire up real bookings, replace this block with a request to a
         booking API or platform, e.g.:
           await fetch('https://your-booking-endpoint.example.com/enquiries', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ name, email, phone, treatment }),
           });
         and update the confirmation copy below to match what that endpoint
         guarantees (queued, confirmed, etc). */
      const mailtoUrl =
        `mailto:${BOOKING_EMAIL}` +
        `?subject=${encodeURIComponent(subject)}` +
        `&body=${encodeURIComponent(body)}`;

      if (bookingNote) {
        bookingNote.textContent =
          'Opening your email app with this request pre-filled — nothing is sent until you press send there. We reply personally to confirm your appointment.';
      }

      window.location.href = mailtoUrl;
    });
  }
});
