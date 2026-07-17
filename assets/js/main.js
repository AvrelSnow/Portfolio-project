/* ============================================================
   SHARED SITE SCRIPT — loaded on every page.
   Current-year stamp, header scroll state, back-to-top, section
   reveals, and the fullscreen image modal. Every block is guarded
   so it no-ops on pages where the relevant markup is absent.
   Page-specific behaviour (contact form, project filters, CV
   toggle, gallery show/hide) stays inline on its own page.
   ============================================================ */
(function () {
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- Current year in the footer --- */
  var yearEl = document.getElementById('current-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  /* --- Scroll state: header elevation + back-to-top visibility.
         One rAF-throttled listener drives both. --- */
  var header = document.querySelector('.header');
  var backToTopBtn = document.getElementById('backToTopBtn');
  var ticking = false;

  function onScrollTick() {
    var y = window.pageYOffset || document.documentElement.scrollTop;
    if (header) {
      header.classList.toggle('scrolled', y > 4);
    }
    if (backToTopBtn) {
      backToTopBtn.classList.toggle('visible', y > 300);
    }
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      window.requestAnimationFrame(onScrollTick);
      ticking = true;
    }
  }, { passive: true });
  onScrollTick();

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
    });
  }

  /* --- Section transitions: sections below the fold rise into place
         once. Progressive enhancement — classes are only applied when
         IntersectionObserver exists and motion is allowed, so content
         is never hidden otherwise. --- */
  if ('IntersectionObserver' in window && !reducedMotion) {
    var sections = Array.prototype.slice.call(
      document.querySelectorAll('main > section')
    ).slice(1); /* the first section has its own hero entrance */

    if (sections.length) {
      /* Reveal once a section is ~12% into view — late enough to feel
         intentional (you've arrived), early enough to never catch the
         motion mid-read. */
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('section-in');
            io.unobserve(entry.target);
          }
        });
      }, { rootMargin: '0px 0px -12% 0px' });

      sections.forEach(function (sec) {
        /* Don't hide sections already in the initial viewport */
        if (sec.getBoundingClientRect().top < window.innerHeight * 0.88) {
          return;
        }
        sec.classList.add('section-reveal');
        io.observe(sec);
      });
    }
  }

  /* --- Fullscreen image modal (gallery pages) --- */
  var modal = document.getElementById('fullscreenModal');
  var modalImg = document.getElementById('modalImg');
  var closeModalBtn = document.getElementById('closeModal');
  if (modal && modalImg && closeModalBtn) {
    var closeModal = function () { modal.classList.remove('active'); };

    document.querySelectorAll('.clickable-img').forEach(function (img) {
      img.addEventListener('click', function () {
        modalImg.src = this.src;
        modalImg.alt = this.alt;
        modal.classList.add('active');
        closeModalBtn.focus();
      });
    });

    closeModalBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', function (e) {
      if (e.target === modal) closeModal();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
    });
  }

  /* ============================================================
     ANIMATED COUNTERS
     ------------------------------------------------------------
     One reusable system for every numeric statistic on the site.

     Opting in
       - any .stat-number             (these ARE stat displays)
       - any element with [data-count] (opt-in for anything else)

     The final value is read from the element's own text, so the markup stays
     the single source of truth — there is no number duplicated in an
     attribute that can drift. Everything around the number is preserved:

       "1,010 km"   -> counts to 1010, keeps the comma grouping and " km"
       "319B FCFA"  -> counts to 319,  keeps "B FCFA"
       "5,500+"     -> counts to 5500, keeps "+"
       "73%"        -> counts to 73,   keeps "%"
       "4.9/5"      -> counts to 4.9,  keeps 1 decimal and "/5"
       "Grade II"   -> no digits, left alone

     Progressive enhancement: the real value is already in the HTML, so with
     no JS (or if this throws) the statistic simply reads normally.
     ============================================================ */
  (function initCounters() {
    var els = document.querySelectorAll('.stat-number, [data-count]');
    if (!els.length) return;

    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    /* Without IntersectionObserver, or with reduced motion, the numbers are
       already correct in the DOM — leave them exactly as they are. */
    if (reduced || !('IntersectionObserver' in window)) return;

    var DURATION = 1400; /* consistent for every counter, small or large */
    /* Mirrors --ease-out (cubic-bezier(.16,1,.3,1)): fast start, long settle. */
    function easeOut(t) { return 1 - Math.pow(1 - t, 4); }

    var targets = [];

    els.forEach(function (el) {
      /* Claim each element once. The authored number is read from textContent,
         which this system also writes — so a second pass over an element that
         is mid-count would parse "505 km" and adopt 505 as the target forever.
         The claim makes initCounters() idempotent. */
      if (el.__counter) return;

      var raw = el.textContent.trim();
      /* prefix | number (digits, commas, decimal point) | suffix */
      var m = raw.match(/^(\D*?)([\d][\d,]*(?:\.\d+)?)(.*)$/s);
      if (!m) return;                       /* e.g. "Grade II" — nothing to count */

      var numStr = m[2];
      var value = parseFloat(numStr.replace(/,/g, ''));
      if (!isFinite(value)) return;

      var dot = numStr.indexOf('.');
      targets.push({
        el: el,
        prefix: m[1],
        suffix: m[3],
        value: value,
        decimals: dot === -1 ? 0 : numStr.length - dot - 1,
        grouped: numStr.indexOf(',') !== -1,
        raw: raw,
        done: false
      });
    });

    if (!targets.length) return;

    function render(t, v) {
      var n = t.decimals ? v.toFixed(t.decimals) : String(Math.round(v));
      if (t.grouped) {
        var parts = n.split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        n = parts.join('.');
      }
      t.el.textContent = t.prefix + n + t.suffix;
    }

    function run(t) {
      if (t.done) return;
      t.done = true;
      /* Zero out here, not at init: the reset and the animation that undoes it
         now share a fate. If this function never runs — background tab, no rAF,
         a throw upstream — the authored number is still sitting in the DOM,
         untouched. Never destroy a value you aren't certain you can restore. */
      render(t, 0);
      /* null, not 0: rAF timestamps are document-timeline relative and a first
         frame at exactly 0 is legal. A falsy check would fail to latch it and
         re-origin the animation on the next frame. */
      var start = null;
      function frame(now) {
        if (start === null) start = now;
        var p = Math.min((now - start) / DURATION, 1);
        render(t, t.value * easeOut(p));
        if (p < 1) {
          requestAnimationFrame(frame);
        } else {
          t.el.textContent = t.raw;   /* land on the authored string, exactly */
        }
      }
      requestAnimationFrame(frame);
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var t = entry.target.__counter;
        io.unobserve(entry.target);   /* one-shot: no leaks, no re-runs */
        if (t) run(t);
      });
    }, { rootMargin: '0px 0px -10% 0px' });

    targets.forEach(function (t) {
      t.el.__counter = t;
      io.observe(t.el);
    });
  })();
})();
