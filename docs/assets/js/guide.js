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
    updateProgressBar();
    renderGuideStatus();
    setupAchievementModal();

    // Event delegation: route step checkboxes
    contentEl.addEventListener('change', handleStepCheckbox);

    // Event delegation: copy link buttons
    contentEl.addEventListener('click', handleCopyLink);

    // Event delegation: trophy checkboxes
    if (trophyEl) {
      trophyEl.addEventListener('change', handleTrophyCheckbox);
    }

    // --- Top controls ---
    setupTopControls();

    // --- UI modules ---
    Guide.UI.initLightbox(document.getElementById('lightbox'));
    Guide.UI.initTocOverlay(document.getElementById('toc'));

    // Mobile action bar
    setupMobileActionBar();

    // Scroll tracking (route steps only)
    setupScrollTracker();

    // Handle initial hash (deep link)
    handleInitialHash();
  }

  // --- Progress Bar & Achievement ---

  function getChecklistStats() {
    var stepInputs = contentEl.querySelectorAll('input[data-step]');
    var trophyInputs = trophyEl ? trophyEl.querySelectorAll('input[data-trophy]') : [];
    var total = stepInputs.length + trophyInputs.length;
    var completed = 0;

    for (var i = 0; i < stepInputs.length; i++) {
      if (stepInputs[i].checked) completed++;
    }
    for (var i = 0; i < trophyInputs.length; i++) {
      if (trophyInputs[i].checked) completed++;
    }

    return { total: total, completed: completed };
  }

  function updateProgressBar() {
    var stats = getChecklistStats();
    var pct = stats.total > 0 ? Math.round(stats.completed / stats.total * 100) : 0;

    var fill = document.getElementById('progress-fill');
    var text = document.getElementById('progress-text');

    if (fill) {
      fill.style.width = pct + '%';
      if (pct === 100) {
        fill.classList.add('progress-bar__fill--complete');
      } else {
        fill.classList.remove('progress-bar__fill--complete');
      }
    }

    if (text) {
      text.textContent = stats.completed + '/' + stats.total + ' \u00b7 ' + pct + '%';
    }
  }

  function getGuideStatus(stats) {
    if (!stats) stats = getChecklistStats();
    if (stats.completed === 0) return 'not-started';
    if (stats.total > 0 && stats.completed === stats.total) return 'completed';
    return 'in-progress';
  }

  function renderGuideStatus() {
    var badge = document.getElementById('guide-status');
    if (!badge) return;

    var stats = getChecklistStats();
    var status = getGuideStatus(stats);

    var labels = {
      'not-started': 'Не начато',
      'in-progress': 'В процессе',
      'completed': 'Закрыто'
    };

    badge.dataset.status = status;
    badge.textContent = labels[status];
  }

  function isGuideCompleted() {
    var stats = getChecklistStats();
    return stats.total > 0 && stats.completed === stats.total;
  }

  function maybeShowCompletionAchievement() {
    if (!isGuideCompleted()) return;

    var currentState = Guide.Progress.getState(guideId);
    if (currentState.achievementShown) return;

    Guide.Progress.setAchievementShown(guideId, true);
    openAchievementModal();
  }

  function openAchievementModal() {
    var modal = document.getElementById('achievement-modal');
    if (!modal) return;
    modal.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeAchievementModal() {
    var modal = document.getElementById('achievement-modal');
    if (!modal) return;
    modal.setAttribute('hidden', '');
    document.body.style.overflow = '';
  }

  function downloadAchievementCard() {
    var img = document.getElementById('achievement-img');
    if (!img || !img.src) return;

    var link = document.createElement('a');
    link.href = img.src;
    link.download = '@achievement_hub.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function setupAchievementModal() {
    var modal = document.getElementById('achievement-modal');
    if (!modal) return;

    var closeBtn = document.getElementById('achievement-close');
    var closeBtnAlt = document.getElementById('btn-close-achievement');
    var downloadBtn = document.getElementById('btn-download-achievement');
    var overlay = modal.querySelector('.achievement-modal__overlay');

    if (closeBtn) closeBtn.addEventListener('click', closeAchievementModal);
    if (closeBtnAlt) closeBtnAlt.addEventListener('click', closeAchievementModal);
    if (downloadBtn) downloadBtn.addEventListener('click', downloadAchievementCard);
    if (overlay) overlay.addEventListener('click', closeAchievementModal);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !modal.hasAttribute('hidden')) {
        closeAchievementModal();
      }
    });
  }

  // --- Top Controls (all 4 quick-action buttons) ---

  function setupTopControls() {
    var btnToc = document.getElementById('btn-toc');
    var btnResume = document.getElementById('btn-resume');
    var btnStoryOnly = document.getElementById('btn-story-only');
    var btnSpoilers = document.getElementById('btn-spoilers');

    // 1. "Содержание" — desktop: scroll to #toc; mobile: open overlay
    if (btnToc) {
      btnToc.addEventListener('click', function () {
        // Save current position before navigating to TOC
        Guide.UI.saveCurrentReadingPosition(guideId);
        Guide.UI.scrollToToc();
        updateResumeButton(btnResume);
      });
    }

    // 2. "Вернуться к моему месту" — scroll to last active step
    if (btnResume) {
      updateResumeButton(btnResume);
      btnResume.addEventListener('click', function () {
        Guide.UI.restoreCurrentReadingPosition(guideId);
      });
    }

    // 3. "Только сюжет" — toggle with persistence
    Guide.UI.initStoryMode(btnStoryOnly, function (isStory) {
      Guide.Progress.setViewMode(guideId, isStory ? 'story' : 'all');
    });

    // 4. "Скрыть спойлеры" — toggle with persistence
    Guide.UI.initSpoilerToggle(btnSpoilers, function (isHidden) {
      Guide.Progress.setSpoilersHidden(guideId, isHidden);
    });

    // 5. "Награда 100%" — open achievement modal if guide is complete
    var btnAchievement = document.getElementById('btn-achievement');
    if (btnAchievement) {
      updateAchievementButton(btnAchievement);
      btnAchievement.addEventListener('click', function () {
        if (isGuideCompleted()) {
          openAchievementModal();
        }
      });
    }
  }

  function updateResumeButton(btn) {
    if (!btn) return;
    var hasPosition = Guide.UI.hasSavedPosition(guideId);
    btn.disabled = !hasPosition;
    btn.style.opacity = hasPosition ? '' : '0.4';
    btn.style.cursor = hasPosition ? '' : 'default';
  }

  function updateAchievementButton(btn) {
    if (!btn) return;
    var completed = isGuideCompleted();
    btn.disabled = !completed;
    btn.title = completed
      ? 'Открыть награду за 100% прохождение гайда'
      : 'Откроется после 100% прохождения гайда';
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
    updateProgressBar();
    renderGuideStatus();
    maybeShowCompletionAchievement();
    updateAchievementButton(document.getElementById('btn-achievement'));
  }

  function handleTrophyCheckbox(e) {
    var input = e.target;
    if (input.type !== 'checkbox' || !input.dataset.trophy) return;
    Guide.Progress.setTrophyChecked(guideId, input.dataset.trophy, input.checked);
    updateProgressBar();
    renderGuideStatus();
    maybeShowCompletionAchievement();
    updateAchievementButton(document.getElementById('btn-achievement'));
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

  // --- View Mode & Spoilers (restore from saved state) ---

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

    var headerHeight = getComputedStyle(document.documentElement)
      .getPropertyValue('--header-height').trim() || '56px';

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

        // Update resume button availability
        var btnResume = document.getElementById('btn-resume');
        if (btnResume) updateResumeButton(btnResume);
      }
    }, {
      rootMargin: '-' + headerHeight + ' 0px -80% 0px',
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
      tocBtn.addEventListener('click', function () {
        Guide.UI.saveCurrentReadingPosition(guideId);
        Guide.UI.scrollToToc();
      });
    }

    if (resumeBtn) {
      resumeBtn.addEventListener('click', function () {
        Guide.UI.restoreCurrentReadingPosition(guideId);
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

  // --- Init on DOMContentLoaded ---

  document.addEventListener('DOMContentLoaded', init);
})();
