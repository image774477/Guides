/**
 * Guide — main orchestrator
 * Wires progress, UI, and event handling on DOMContentLoaded.
 */
window.Guide = window.Guide || {};

(function () {
  'use strict';

  var guideId;
  var contentEl;
  var trophyEl;
  var state;

  function init() {
    contentEl = document.getElementById('guide-content');
    if (!contentEl) return;

    guideId = contentEl.dataset.guideId;
    if (!guideId) return;

    trophyEl = document.querySelector('.trophy-checklist');
    state = Guide.Progress.getState(guideId);

    restoreCheckboxes();
    restoreTrophyCheckboxes();
    restoreViewMode();
    restoreSpoilers();
    showResumeBanner();

    // Event delegation: route step checkboxes
    contentEl.addEventListener('change', handleStepCheckbox);

    // Event delegation: copy link buttons
    contentEl.addEventListener('click', handleCopyLink);

    // Event delegation: trophy checkboxes
    if (trophyEl) {
      trophyEl.addEventListener('change', handleTrophyCheckbox);
    }

    // UI modules
    Guide.UI.initSpoilerToggle(
      document.getElementById('btn-spoilers'),
      document.body
    );
    Guide.UI.initStoryMode(
      document.getElementById('btn-story-only'),
      document.body
    );
    Guide.UI.initLightbox(document.getElementById('lightbox'));
    Guide.UI.initTocOverlay(
      document.getElementById('toc'),
      document.querySelectorAll('[data-action="open-toc"]')
    );

    // Mobile action bar
    setupMobileActionBar();

    // Scroll tracking (route steps only)
    setupScrollTracker();

    // Handle initial hash (deep link)
    handleInitialHash();
  }

  // --- Checkboxes ---

  function restoreCheckboxes() {
    var checked = state.checkedSteps;
    for (var i = 0; i < checked.length; i++) {
      var input = contentEl.querySelector('input[data-step="' + checked[i] + '"]');
      if (input) input.checked = true;
    }
  }

  function restoreTrophyCheckboxes() {
    if (!trophyEl) return;
    var checked = state.checkedTrophies;
    for (var i = 0; i < checked.length; i++) {
      var input = trophyEl.querySelector('input[data-trophy="' + checked[i] + '"]');
      if (input) input.checked = true;
    }
  }

  function handleStepCheckbox(e) {
    var input = e.target;
    if (input.type !== 'checkbox' || !input.dataset.step) return;
    Guide.Progress.setChecked(guideId, input.dataset.step, input.checked);
  }

  function handleTrophyCheckbox(e) {
    var input = e.target;
    if (input.type !== 'checkbox' || !input.dataset.trophy) return;
    Guide.Progress.setTrophyChecked(guideId, input.dataset.trophy, input.checked);
  }

  // --- Copy Link ---

  function handleCopyLink(e) {
    var btn = e.target.closest('.step__link-btn');
    if (!btn) return;
    var stepId = btn.dataset.link;
    if (!stepId) return;
    Guide.UI.copyDeepLink(stepId);

    // Visual feedback
    var original = btn.getAttribute('aria-label') || '';
    btn.setAttribute('aria-label', 'Скопировано!');
    btn.style.color = 'var(--color-success)';
    setTimeout(function () {
      btn.setAttribute('aria-label', original);
      btn.style.color = '';
    }, 1500);
  }

  // --- View Mode & Spoilers ---

  function restoreViewMode() {
    if (state.viewMode === 'story') {
      document.body.classList.add('story-only');
      var btn = document.getElementById('btn-story-only');
      if (btn) {
        btn.textContent = 'Все шаги';
        btn.classList.add('active');
      }
    }
  }

  function restoreSpoilers() {
    if (state.spoilersHidden) {
      document.body.classList.add('spoilers-hidden');
      // Close all open spoilers
      var openSpoilers = document.querySelectorAll('details.spoiler[open]');
      for (var i = 0; i < openSpoilers.length; i++) {
        openSpoilers[i].removeAttribute('open');
      }
      var btn = document.getElementById('btn-spoilers');
      if (btn) {
        btn.textContent = 'Показать спойлеры';
        btn.classList.add('active');
      }
    }
  }

  // --- Resume Banner ---

  function showResumeBanner() {
    var banner = document.getElementById('resume-banner');
    if (!banner || !state.lastStepId) return;

    var targetStep = document.getElementById(state.lastStepId);
    if (!targetStep) return;

    var stepTitle = targetStep.querySelector('.step__title');
    var nameSpan = document.getElementById('resume-step-name');
    if (nameSpan && stepTitle) {
      nameSpan.textContent = stepTitle.textContent;
    }

    banner.removeAttribute('hidden');

    var resumeBtn = document.getElementById('resume-btn');
    if (resumeBtn) {
      resumeBtn.addEventListener('click', function () {
        Guide.UI.scrollToStep(state.lastStepId);
        banner.setAttribute('hidden', '');
      });
    }

    var closeBtn = document.getElementById('resume-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        banner.setAttribute('hidden', '');
      });
    }
  }

  // --- Scroll Tracking ---

  function setupScrollTracker() {
    var steps = contentEl.querySelectorAll('.step');
    if (!steps.length || !('IntersectionObserver' in window)) return;

    var lastSaveTime = 0;
    var pendingStepId = null;

    var observer = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].isIntersecting) {
          pendingStepId = entries[i].target.id;
        }
      }

      var now = Date.now();
      if (pendingStepId && now - lastSaveTime > 500) {
        Guide.Progress.setLastStep(guideId, pendingStepId);
        lastSaveTime = now;
      }
    }, {
      rootMargin: '-' + getComputedStyle(document.documentElement).getPropertyValue('--header-height').trim() + ' 0px -80% 0px',
      threshold: 0
    });

    for (var i = 0; i < steps.length; i++) {
      observer.observe(steps[i]);
    }
  }

  // --- Mobile Action Bar ---

  function setupMobileActionBar() {
    var tocBtn = document.getElementById('mob-toc');
    var resumeBtn = document.getElementById('mob-resume');
    var nextBtn = document.getElementById('mob-next');

    if (tocBtn) {
      tocBtn.setAttribute('data-action', 'open-toc');
    }

    if (resumeBtn) {
      resumeBtn.addEventListener('click', function () {
        var lastStep = Guide.Progress.getState(guideId).lastStepId;
        if (lastStep) {
          Guide.UI.scrollToStep(lastStep);
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        var currentState = Guide.Progress.getState(guideId);
        var steps = contentEl.querySelectorAll('.step');
        for (var i = 0; i < steps.length; i++) {
          var stepId = steps[i].id;
          if (currentState.checkedSteps.indexOf(stepId) === -1) {
            // Skip hidden steps in story-only mode
            if (document.body.classList.contains('story-only')) {
              var type = steps[i].dataset.stepType;
              if (type === 'optional' || type === 'collectible') continue;
            }
            Guide.UI.scrollToStep(stepId);
            return;
          }
        }
      });
    }
  }

  // --- Initial Hash ---

  function handleInitialHash() {
    if (!window.location.hash) return;
    var targetId = window.location.hash.slice(1);
    var targetEl = document.getElementById(targetId);
    if (!targetEl) return;

    setTimeout(function () {
      Guide.UI.scrollToStep(targetId);
    }, 150);
  }

  // --- Spoiler/Story mode persistence ---

  // Watch for class changes to persist
  var spoilerBtn = document.getElementById('btn-spoilers');
  var storyBtn = document.getElementById('btn-story-only');

  document.addEventListener('DOMContentLoaded', function () {
    init();

    // Add persistence after init
    if (spoilerBtn) {
      spoilerBtn.addEventListener('click', function () {
        var isHidden = document.body.classList.contains('spoilers-hidden');
        Guide.Progress.setSpoilersHidden(guideId, isHidden);
      });
    }

    if (storyBtn) {
      storyBtn.addEventListener('click', function () {
        var isStory = document.body.classList.contains('story-only');
        Guide.Progress.setViewMode(guideId, isStory ? 'story' : 'all');
      });
    }
  });
})();
