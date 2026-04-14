/**
 * Guide UI — interaction handlers
 * Spoiler toggle, story mode, lightbox, TOC overlay, highlight, clipboard, scroll.
 */
window.Guide = window.Guide || {};

window.Guide.UI = (function () {
  'use strict';

  return {
    /**
     * Spoiler toggle: adds/removes body.spoilers-hidden,
     * closes all open <details class="spoiler">.
     */
    initSpoilerToggle: function (btn, bodyEl) {
      if (!btn) return;
      btn.addEventListener('click', function () {
        var isHidden = bodyEl.classList.toggle('spoilers-hidden');
        btn.textContent = isHidden ? 'Показать спойлеры' : 'Скрыть спойлеры';
        if (isHidden) {
          var openSpoilers = document.querySelectorAll('details.spoiler[open]');
          for (var i = 0; i < openSpoilers.length; i++) {
            openSpoilers[i].removeAttribute('open');
          }
        }
        btn.classList.toggle('active', isHidden);
      });
    },

    /**
     * Story-only mode: toggles body.story-only,
     * hides optional and collectible steps.
     */
    initStoryMode: function (btn, bodyEl) {
      if (!btn) return;
      btn.addEventListener('click', function () {
        var isStory = bodyEl.classList.toggle('story-only');
        btn.textContent = isStory ? 'Все шаги' : 'Только сюжет';
        btn.classList.toggle('active', isStory);
      });
    },

    /**
     * Lightbox: click on .step__media img opens fullscreen.
     * Close on click outside, Escape, or close button.
     */
    initLightbox: function (lightboxEl) {
      if (!lightboxEl) return;

      var img = lightboxEl.querySelector('.lightbox__img');
      var closeBtn = lightboxEl.querySelector('.lightbox__close');

      function open(src, alt) {
        img.src = src;
        img.alt = alt || '';
        lightboxEl.removeAttribute('hidden');
        document.body.style.overflow = 'hidden';
      }

      function close() {
        lightboxEl.setAttribute('hidden', '');
        document.body.style.overflow = '';
        img.src = '';
      }

      // Delegate clicks on step images
      document.addEventListener('click', function (e) {
        var target = e.target;
        if (target.tagName === 'IMG' && target.closest('.step__media')) {
          e.preventDefault();
          open(target.src, target.alt);
        }
      });

      closeBtn.addEventListener('click', close);

      lightboxEl.addEventListener('click', function (e) {
        if (e.target === lightboxEl) close();
      });

      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && !lightboxEl.hasAttribute('hidden')) {
          close();
        }
      });
    },

    /**
     * TOC overlay (mobile): open/close fullscreen TOC.
     */
    initTocOverlay: function (tocEl, openBtnEls) {
      if (!tocEl) return;

      var closeBtn = tocEl.querySelector('.toc__close');

      function openToc() {
        tocEl.classList.add('toc--open');
        document.body.style.overflow = 'hidden';
      }

      function closeToc() {
        tocEl.classList.remove('toc--open');
        document.body.style.overflow = '';
      }

      // Multiple open buttons (desktop quick-actions + mobile action bar)
      if (openBtnEls) {
        for (var i = 0; i < openBtnEls.length; i++) {
          openBtnEls[i].addEventListener('click', openToc);
        }
      }

      if (closeBtn) {
        closeBtn.addEventListener('click', closeToc);
      }

      // Close on link click
      tocEl.addEventListener('click', function (e) {
        if (e.target.closest('.toc__link')) {
          closeToc();
        }
      });
    },

    /**
     * Briefly highlight a step card with animation.
     */
    highlightStep: function (stepEl) {
      if (!stepEl) return;
      stepEl.classList.remove('step--highlight');
      // Force reflow
      void stepEl.offsetWidth;
      stepEl.classList.add('step--highlight');
      stepEl.addEventListener('animationend', function handler() {
        stepEl.classList.remove('step--highlight');
        stepEl.removeEventListener('animationend', handler);
      });
    },

    /**
     * Copy deep link to a step.
     * Returns true if successful.
     */
    copyDeepLink: function (stepId) {
      var url = window.location.origin + window.location.pathname + '#' + stepId;

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).catch(function () {
          _fallbackCopy(url);
        });
        return true;
      }

      return _fallbackCopy(url);
    },

    /**
     * Smooth scroll to a step and highlight it.
     */
    scrollToStep: function (stepId) {
      var el = document.getElementById(stepId);
      if (!el) return;
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Delay highlight slightly for scroll to settle
      setTimeout(function () {
        Guide.UI.highlightStep(el);
      }, 400);
    }
  };

  function _fallbackCopy(text) {
    var textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.cssText = 'position:fixed;left:-9999px;top:-9999px;opacity:0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      return true;
    } catch (e) {
      return false;
    } finally {
      document.body.removeChild(textarea);
    }
  }
})();
