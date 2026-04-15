/**
 * Guide Progress — localStorage API
 * Pure data layer, no DOM interaction.
 */
window.Guide = window.Guide || {};

window.Guide.Progress = (function () {
  'use strict';

  var STORAGE_PREFIX = 'guide__';

  var DEFAULT_STATE = {
    checkedSteps: [],
    checkedTrophies: [],
    lastStepId: null,
    viewMode: 'all',
    spoilersHidden: false,
    achievementShown: false
  };

  function _getKey(guideId) {
    return STORAGE_PREFIX + guideId;
  }

  function _load(guideId) {
    try {
      var raw = localStorage.getItem(_getKey(guideId));
      if (!raw) return _copy(DEFAULT_STATE);
      var parsed = JSON.parse(raw);
      // Merge with defaults to handle missing fields after updates
      return {
        checkedSteps: Array.isArray(parsed.checkedSteps) ? parsed.checkedSteps : [],
        checkedTrophies: Array.isArray(parsed.checkedTrophies) ? parsed.checkedTrophies : [],
        lastStepId: parsed.lastStepId || null,
        viewMode: parsed.viewMode === 'story' ? 'story' : 'all',
        spoilersHidden: !!parsed.spoilersHidden,
        achievementShown: !!parsed.achievementShown
      };
    } catch (e) {
      return _copy(DEFAULT_STATE);
    }
  }

  function _save(guideId, data) {
    try {
      localStorage.setItem(_getKey(guideId), JSON.stringify(data));
    } catch (e) {
      // Graceful degradation: silent no-op
    }
  }

  function _copy(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  return {
    getState: function (guideId) {
      return _load(guideId);
    },

    setChecked: function (guideId, stepId, checked) {
      var state = _load(guideId);
      var idx = state.checkedSteps.indexOf(stepId);
      if (checked && idx === -1) {
        state.checkedSteps.push(stepId);
      } else if (!checked && idx !== -1) {
        state.checkedSteps.splice(idx, 1);
      }
      _save(guideId, state);
    },

    setTrophyChecked: function (guideId, trophyId, checked) {
      var state = _load(guideId);
      var idx = state.checkedTrophies.indexOf(trophyId);
      if (checked && idx === -1) {
        state.checkedTrophies.push(trophyId);
      } else if (!checked && idx !== -1) {
        state.checkedTrophies.splice(idx, 1);
      }
      _save(guideId, state);
    },

    setLastStep: function (guideId, stepId) {
      var state = _load(guideId);
      state.lastStepId = stepId;
      _save(guideId, state);
    },

    setViewMode: function (guideId, mode) {
      var state = _load(guideId);
      state.viewMode = mode === 'story' ? 'story' : 'all';
      _save(guideId, state);
    },

    setSpoilersHidden: function (guideId, hidden) {
      var state = _load(guideId);
      state.spoilersHidden = !!hidden;
      _save(guideId, state);
    },

    getCompletionCount: function (guideId) {
      var state = _load(guideId);
      return state.checkedSteps.length;
    },

    getTrophyCount: function (guideId) {
      var state = _load(guideId);
      return state.checkedTrophies.length;
    },

    setAchievementShown: function (guideId, shown) {
      var state = _load(guideId);
      state.achievementShown = !!shown;
      _save(guideId, state);
    },

    clearProgress: function (guideId) {
      try {
        localStorage.removeItem(_getKey(guideId));
      } catch (e) {
        // Graceful degradation: silent no-op
      }
    }
  };
})();
