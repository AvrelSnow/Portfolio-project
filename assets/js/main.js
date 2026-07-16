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
})();
