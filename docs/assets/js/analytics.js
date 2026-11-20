(function () {
  'use strict';

  if (location.hostname !== 'image774477.github.io' ||
      !location.pathname.startsWith('/Guides/')) return;

  var counterId = 114388729;
  var tag = document.createElement('script');
  tag.async = true;
  tag.src = 'https://mc.yandex.ru/metrika/tag.js?id=' + counterId;

  window.ym = window.ym || function () {
    (window.ym.a = window.ym.a || []).push(arguments);
  };
  window.ym.l = Date.now();
  document.head.appendChild(tag);
  window.ym(counterId, 'init', { webvisor: false });

  window.Guide = window.Guide || {};
  Guide.Analytics = {
    goal: function (name, guideId, rewardId) {
      window.ym(counterId, 'reachGoal', name, {
        guide_id: guideId,
        reward_id: rewardId
      });
    }
  };

  var content = document.getElementById('guide-content');
  var gallery = document.querySelector('[data-rewards-gallery]');
  if (!content || !gallery) return;

  var guideId = content.dataset.guideId;
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting || entry.intersectionRatio < 0.5 ||
            gallery.hidden || document.visibilityState !== 'visible') return;
        Guide.Analytics.goal('custom_achievement_view', guideId, entry.target.dataset.customReward);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.5 });
    gallery.querySelectorAll('[data-custom-reward]').forEach(function (card) {
      observer.observe(card);
    });
  }

  function trackClaim(event) {
    if (event.type === 'auxclick' && event.button !== 1) return;
    var link = event.target.closest('.reward-card__claim');
    if (!link) return;
    var card = link.closest('[data-custom-reward], [data-completion-reward]');
    if (!card) return;
    Guide.Analytics.goal('achiever_click', guideId, card.dataset.customReward || 'guide-completion');
  }

  gallery.addEventListener('click', trackClaim);
  gallery.addEventListener('auxclick', trackClaim);
})();
