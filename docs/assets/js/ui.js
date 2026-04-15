/**
 * Guide UI — interaction handlers
 * Top controls: scrollToToc, saveCurrentReadingPosition, restoreCurrentReadingPosition,
 * toggleStoryOnly, toggleSpoilers.
 * Plus: lightbox, highlight, clipboard, scrollToStep.
 */
window.Guide = window.Guide || {};

window.Guide.UI = (function () {
  'use strict';

  /* ---- private state ---- */

  // Saved scroll position for "Вернуться к моему месту"
  var _savedPositionStepId = null;
  // Mobile breakpoint must match CSS @media
  var MOBILE_BP = 768;

  function _isMobile() {
    return window.innerWidth <= MOBILE_BP;
  }

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

  /* ---- TOC overlay (mobile-only state) ---- */

  var _tocEl = null;

  function _openTocOverlay() {
    if (!_tocEl) return;
    _tocEl.classList.add('toc--open');
    document.body.style.overflow = 'hidden';
  }

  function _closeTocOverlay() {
    if (!_tocEl) return;
    _tocEl.classList.remove('toc--open');
    document.body.style.overflow = '';
  }

  /* ---- public API ---- */

  return {
    /**
     * scrollToToc — desktop: smooth scroll to #toc; mobile: open overlay.
     * The desktop button must NOT set overflow:hidden.
     */
    scrollToToc: function () {
      var tocEl = document.getElementById('toc');
      if (!tocEl) return;

      if (_isMobile()) {
        _openTocOverlay();
      } else {
        tocEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    },

    /**
     * Save the user's current reading position (step id) so they can
     * navigate away (e.g. to TOC) and return.
     * Source of truth: the topmost visible step tracked by IntersectionObserver
     * and stored via Guide.Progress.setLastStep().
     * This function snapshots that value into a session variable.
     */
    saveCurrentReadingPosition: function (guideId) {
      if (!guideId) return;
      var state = Guide.Progress.getState(guideId);
      _savedPositionStepId = state.lastStepId || null;
    },

    /**
     * Restore the saved reading position — scroll to the step that was
     * active when saveCurrentReadingPosition was last called.
     * Falls back to the lastStepId in localStorage if no explicit save
     * was made this session.
     */
    restoreCurrentReadingPosition: function (guideId) {
      var targetId = _savedPositionStepId;
      if (!targetId && guideId) {
        targetId = Guide.Progress.getState(guideId).lastStepId;
      }
      if (targetId) {
        Guide.UI.scrollToStep(targetId);
      }
    },

    /**
     * Get whether we have a saved reading position.
     */
    hasSavedPosition: function (guideId) {
      if (_savedPositionStepId) return true;
      if (guideId) {
        var state = Guide.Progress.getState(guideId);
        return !!state.lastStepId;
      }
      return false;
    },

    /**
     * toggleSpoilers — toggle body.spoilers-hidden,
     * close all open <details class="spoiler">, update button state.
     * Returns the new isHidden state.
     */
    toggleSpoilers: function (btn) {
      var isHidden = document.body.classList.toggle('spoilers-hidden');
      if (btn) {
        btn.textContent = isHidden ? 'Показать спойлеры' : 'Скрыть спойлеры';
        btn.classList.toggle('active', isHidden);
      }
      if (isHidden) {
        var openSpoilers = document.querySelectorAll('details.spoiler[open]');
        for (var i = 0; i < openSpoilers.length; i++) {
          openSpoilers[i].removeAttribute('open');
        }
      }
      return isHidden;
    },

    /**
     * toggleStoryOnly — toggle body.story-only, update button state.
     * Returns the new isStory state.
     */
    toggleStoryOnly: function (btn) {
      var isStory = document.body.classList.toggle('story-only');
      if (btn) {
        btn.textContent = isStory ? 'Все шаги' : 'Только сюжет';
        btn.classList.toggle('active', isStory);
      }
      return isStory;
    },

    /**
     * Init spoiler button (convenience — wires click + persistence callback).
     */
    initSpoilerToggle: function (btn, onToggle) {
      if (!btn) return;
      btn.addEventListener('click', function () {
        var isHidden = Guide.UI.toggleSpoilers(btn);
        if (typeof onToggle === 'function') onToggle(isHidden);
      });
    },

    /**
     * Init story mode button (convenience — wires click + persistence callback).
     */
    initStoryMode: function (btn, onToggle) {
      if (!btn) return;
      btn.addEventListener('click', function () {
        var isStory = Guide.UI.toggleStoryOnly(btn);
        if (typeof onToggle === 'function') onToggle(isStory);
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
     * TOC overlay setup (mobile): close on link click or close button.
     * Open buttons are handled by scrollToToc() which decides mode.
     */
    initTocOverlay: function (tocEl) {
      if (!tocEl) return;
      _tocEl = tocEl;

      var closeBtn = tocEl.querySelector('.toc__close');

      if (closeBtn) {
        closeBtn.addEventListener('click', _closeTocOverlay);
      }

      // Close on link click inside overlay
      tocEl.addEventListener('click', function (e) {
        if (e.target.closest('.toc__link')) {
          _closeTocOverlay();
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
     * Smooth scroll to a step/element and highlight it.
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
})();
