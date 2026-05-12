/* ============================================
   BHUMI SOCIALS — Portfolio Interactivity
   ============================================ */

(() => {
  'use strict';

  // ----- Year in footer
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ----- Custom cursor (desktop only)
  const supportsHover = window.matchMedia('(hover: hover)').matches;
  if (supportsHover && window.innerWidth > 900) {
    const dot  = document.querySelector('.cursor-dot');
    const ring = document.querySelector('.cursor-ring');

    let mx = 0, my = 0, rx = 0, ry = 0;
    document.addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
      if (dot) { dot.style.left = mx + 'px'; dot.style.top = my + 'px'; }
    });

    const animate = () => {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      if (ring) { ring.style.left = rx + 'px'; ring.style.top = ry + 'px'; }
      requestAnimationFrame(animate);
    };
    animate();

    const hoverables = 'a, button, .service-card, .folder, .chip, .tool, .stat, .snap-card, .review, .project-shot';
    document.querySelectorAll(hoverables).forEach((el) => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });
  } else {
    document.querySelector('.cursor-dot')?.remove();
    document.querySelector('.cursor-ring')?.remove();
  }

  // ----- Scroll progress bar + nav scroll state + back-to-top
  const progress  = document.querySelector('.progress-bar');
  const navWrap   = document.querySelector('.nav-wrap');
  const backToTop = document.querySelector('.back-to-top');

  const updateScroll = () => {
    const scrollTop  = window.scrollY;
    const docHeight  = document.documentElement.scrollHeight - window.innerHeight;
    const pct        = (scrollTop / Math.max(docHeight, 1)) * 100;
    if (progress) progress.style.width = pct + '%';

    if (navWrap) navWrap.classList.toggle('scrolled', scrollTop > 60);
    if (backToTop) backToTop.classList.toggle('visible', scrollTop > 600);
  };
  window.addEventListener('scroll', updateScroll, { passive: true });
  updateScroll();

  // ----- Mobile nav toggle
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks  = document.querySelector('.nav-links');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      navToggle.classList.toggle('open', open);
      navToggle.setAttribute('aria-expanded', String(open));
    });
    navLinks.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => {
        navLinks.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ----- Smooth scroll for anchor links (with offset for fixed nav)
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const offset = 70;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  // ----- IntersectionObserver: reveal on scroll
  const reveals = document.querySelectorAll('.reveal');
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
  reveals.forEach((el) => revealObs.observe(el));

  // ----- Stat counter animation
  const stats = document.querySelectorAll('.stat-num');
  const animateCount = (el) => {
    const target  = parseFloat(el.dataset.target || '0');
    const suffix  = el.dataset.suffix || '';
    const duration = 1800;
    const start = performance.now();

    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      const val = target * eased;
      const display = (target % 1 === 0 && !suffix.includes('M'))
        ? Math.round(val).toString()
        : val.toFixed(1).replace(/\.0$/, '');
      el.textContent = display + (t === 1 ? suffix : (suffix ? '' : ''));
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = (target % 1 === 0 ? target.toString() : target.toFixed(1)) + suffix;
    };
    requestAnimationFrame(tick);
  };

  const statObs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        statObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  stats.forEach((s) => statObs.observe(s));

  // ----- Snap-card counter for big numbers (light parallax look)
  const snapNums = document.querySelectorAll('.snap-num');
  const snapObs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.animate(
          [{ transform: 'scale(0.7)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }],
          { duration: 700, easing: 'cubic-bezier(.34,1.56,.64,1)', fill: 'forwards' }
        );
        snapObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.6 });
  snapNums.forEach((n) => snapObs.observe(n));

  // ----- Tilt effect on review & snapshot cards (skip .project-shot — it has its own hover lift)
  const tiltCards = document.querySelectorAll('.review:not(.review-featured), .snap-card');
  tiltCards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      if (window.innerWidth < 900) return;
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const rotY = (x - 0.5) * 6;
      const rotX = (0.5 - y) * 6;
      card.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-6px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  // ----- Magnetic effect on primary CTAs
  const magnets = document.querySelectorAll('.btn-primary, .nav-cta, .back-to-top');
  magnets.forEach((m) => {
    m.addEventListener('mousemove', (e) => {
      if (window.innerWidth < 900) return;
      const r = m.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      m.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
    });
    m.addEventListener('mouseleave', () => { m.style.transform = ''; });
  });

  // ----- Active nav link based on scroll position
  const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');
  const sections   = Array.from(navAnchors)
    .map((a) => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);

  const sectionObs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = '#' + entry.target.id;
        navAnchors.forEach((a) => {
          a.classList.toggle('active', a.getAttribute('href') === id);
        });
      }
    });
  }, { threshold: 0.4, rootMargin: '-80px 0px -40% 0px' });
  sections.forEach((s) => sectionObs.observe(s));

  // ----- Easter egg: confetti burst on logo click
  const logo = document.querySelector('.logo');
  if (logo) {
    logo.addEventListener('click', (e) => {
      e.preventDefault();
      burstConfetti(e.clientX, e.clientY);
    });
  }

  function burstConfetti(x, y) {
    const emojis = ['💗', '✨', '🦋', '🌸', '⭐', '💖'];
    for (let i = 0; i < 20; i++) {
      const el = document.createElement('span');
      el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      el.style.cssText = `
        position: fixed; left: ${x}px; top: ${y}px;
        font-size: ${Math.random() * 18 + 14}px;
        pointer-events: none; z-index: 9998;
        transition: transform 1.2s cubic-bezier(.2,.8,.2,1), opacity 1.2s ease;
      `;
      document.body.appendChild(el);
      requestAnimationFrame(() => {
        const angle = (Math.PI * 2 * i) / 20 + (Math.random() - 0.5);
        const dist = 80 + Math.random() * 120;
        el.style.transform = `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist + 80}px) rotate(${Math.random() * 720 - 360}deg)`;
        el.style.opacity = '0';
      });
      setTimeout(() => el.remove(), 1300);
    }
  }

  // ----- Service card click: tiny ripple
  document.querySelectorAll('.service-card, .folder').forEach((card) => {
    card.addEventListener('click', (e) => {
      const ripple = document.createElement('span');
      const rect = card.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      ripple.style.cssText = `
        position: absolute; left: ${e.clientX - rect.left - size / 2}px;
        top: ${e.clientY - rect.top - size / 2}px;
        width: ${size}px; height: ${size}px; border-radius: 50%;
        background: rgba(255,255,255,.35); pointer-events: none;
        transform: scale(0); transition: transform .6s ease, opacity .6s ease;
        opacity: 1; mix-blend-mode: screen;
      `;
      card.style.position = 'relative';
      card.appendChild(ripple);
      requestAnimationFrame(() => {
        ripple.style.transform = 'scale(2.5)';
        ripple.style.opacity = '0';
      });
      setTimeout(() => ripple.remove(), 650);
    });
  });

  // ----- Add subtle parallax to hero blobs
  const hero = document.querySelector('.hero');
  if (hero && window.innerWidth > 900) {
    hero.addEventListener('mousemove', (e) => {
      const cx = (e.clientX / window.innerWidth - 0.5) * 30;
      const cy = (e.clientY / window.innerHeight - 0.5) * 30;
      hero.style.setProperty('--hx', cx + 'px');
      hero.style.setProperty('--hy', cy + 'px');
    });
  }

  // ----- Keyboard shortcut: press "L" to jump to "Let's Work" / contact
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.key === 'l' || e.key === 'L') {
      document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });
    }
  });

  console.log('%c💗 Hi! Made with love for Bhumi Socials 💗', 'color: #FF1493; font-size: 14px; font-weight: bold;');
})();
