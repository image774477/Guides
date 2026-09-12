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
  var achievementReturnFocus;
  var achievementBodyOverflow;

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
    setupBackToTop();

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
    if (stats.completed !== stats.total) pct = Math.min(pct, 99);

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
    renderRewardsGallery();
    if (!modal.hasAttribute('hidden')) return;
    achievementReturnFocus = document.activeElement;
    achievementBodyOverflow = document.body.style.overflow;
    modal.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
    var closeBtn = document.getElementById('achievement-close');
    if (closeBtn) closeBtn.focus({ preventScroll: true });
  }

  function closeAchievementModal() {
    var modal = document.getElementById('achievement-modal');
    if (!modal || modal.hasAttribute('hidden')) return;
    modal.setAttribute('hidden', '');
    document.body.style.overflow = achievementBodyOverflow || '';
    if (achievementReturnFocus && achievementReturnFocus.isConnected) {
      achievementReturnFocus.focus({ preventScroll: true });
    }
  }

  function hasRewardsGallery() {
    var modal = document.getElementById('achievement-modal');
    return !!modal && modal.hasAttribute('data-rewards-gallery');
  }

  function renderRewardsGallery() {
    if (!hasRewardsGallery()) return;
    var modal = document.getElementById('achievement-modal');
    var checked = Guide.Progress.getState(guideId).checkedRewards;
    var cards = modal.querySelectorAll('[data-custom-reward]');
    var count = 0;
    for (var i = 0; i < cards.length; i++) {
      var earned = checked.indexOf(cards[i].dataset.customReward) !== -1;
      cards[i].classList.toggle('is-earned', earned);
      var button = cards[i].querySelector('[data-reward-toggle]');
      var status = cards[i].querySelector('.reward-card__status');
      if (button) {
        button.textContent = earned ? 'Отменить' : 'Выполнено';
        button.setAttribute('aria-pressed', String(earned));
      }
      if (status) status.textContent = earned ? 'Получена' : 'Не получена';
      if (earned) count++;
    }
    var counter = modal.querySelector('[data-rewards-count]');
    if (counter) counter.textContent = 'Выполнено ' + count + ' из ' + cards.length;
    var completionCard = modal.querySelector('[data-completion-reward]');
    if (completionCard) {
      var completed = isGuideCompleted();
      completionCard.classList.toggle('is-earned', completed);
      var completionStatus = completionCard.querySelector('.reward-card__status');
      if (completionStatus) completionStatus.textContent = completed ? 'Получена' : 'Не получена';
      var completionProgress = completionCard.querySelector('[data-completion-progress]');
      var stats = getChecklistStats();
      if (completionProgress) {
        completionProgress.textContent = completed
          ? 'Все шаги и трофеи отмечены'
          : 'Шаги и трофеи: ' + stats.completed + ' из ' + stats.total;
      }
    }
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

    renderRewardsGallery();
    modal.addEventListener('click', function (e) {
      var button = e.target.closest('[data-reward-toggle]');
      if (!button || !modal.contains(button) || !hasRewardsGallery()) return;
      var card = button.closest('[data-custom-reward]');
      if (!card) return;
      var checked = Guide.Progress.getState(guideId).checkedRewards;
      Guide.Progress.setRewardChecked(guideId, card.dataset.customReward,
        checked.indexOf(card.dataset.customReward) === -1);
      renderRewardsGallery();
    });

    document.addEventListener('keydown', function (e) {
      if (modal.hasAttribute('hidden')) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        closeAchievementModal();
      } else if (e.key === 'Tab') {
        var focusable = modal.querySelectorAll('button:not([disabled]), a[href], [tabindex="0"]');
        if (!focusable.length) return;
        var first = focusable[0];
        var last = focusable[focusable.length - 1];
        var outside = !modal.contains(document.activeElement);
        if (e.shiftKey && (document.activeElement === first || outside)) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && (document.activeElement === last || outside)) {
          e.preventDefault();
          first.focus();
        }
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

    // Reward galleries are available throughout the guide; legacy awards unlock at 100%.
    var btnAchievement = document.getElementById('btn-achievement');
    if (btnAchievement) {
      updateAchievementButton(btnAchievement);
      btnAchievement.addEventListener('click', function () {
        if (hasRewardsGallery() || isGuideCompleted()) {
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
    if (hasRewardsGallery()) {
      btn.disabled = false;
      btn.textContent = 'Награды';
      btn.title = 'Открыть награды';
      return;
    }
    var completed = isGuideCompleted();
    btn.disabled = !completed;
    btn.title = completed
      ? 'Открыть награду за 100% прохождение гайда'
      : 'Откроется после 100% прохождения гайда';
  }

  function setupBackToTop() {
    var button = document.getElementById('btn-back-to-top');
    if (!button) return;

    function updateVisibility() {
      button.hidden = window.scrollY < Math.max(400, window.innerHeight * 0.75);
    }

    button.addEventListener('click', function () {
      Guide.UI.saveCurrentReadingPosition(guideId);
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      var heading = document.querySelector('.guide-header__title');
      if (heading) {
        heading.setAttribute('tabindex', '-1');
        heading.focus({ preventScroll: true });
      }
      updateVisibility();
      updateResumeButton(document.getElementById('btn-resume'));
    });

    window.addEventListener('scroll', updateVisibility, { passive: true });
    window.addEventListener('resize', updateVisibility);
    window.addEventListener('pageshow', updateVisibility);
    updateVisibility();
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
    renderRewardsGallery();
    maybeShowCompletionAchievement();
    updateAchievementButton(document.getElementById('btn-achievement'));
  }

  function handleTrophyCheckbox(e) {
    var input = e.target;
    if (input.type !== 'checkbox' || !input.dataset.trophy) return;
    Guide.Progress.setTrophyChecked(guideId, input.dataset.trophy, input.checked);
    updateProgressBar();
    renderGuideStatus();
    renderRewardsGallery();
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
    Guide.UI.applySpoilerState(
      document.getElementById('btn-spoilers'),
      state.spoilersHidden,
      state.spoilersRevealed
    );
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
