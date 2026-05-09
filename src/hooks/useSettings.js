import { useState, useEffect, useCallback } from 'react';

const DEFAULT_SETTINGS = {
  workDuration: 25,
  breakDuration: 5,
  dailyGoal: 4,
  autoStartWork: false,
  visualNotifications: true,
  audioNotifications: true,
  systemNotifications: true,
  showInstructions: true,
  theme: 'system',
  workDays: [1, 2, 3, 4, 5],
  activityTypes: {
    'Stretching': true,
    'Cardio': true,
    'Strength': true,
    'Eye/Neck Care': true
  }
};

export function useSettings(userId) {
  const storageKey = userId ? `pomotivity_settings_${userId}` : 'pomotivity_settings';

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    if (!saved) return DEFAULT_SETTINGS;
    try {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_SETTINGS, ...parsed };
    } catch (e) {
      return DEFAULT_SETTINGS;
    }
  });

  // Reload settings when userId changes
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (!saved) {
      setSettings(DEFAULT_SETTINGS);
    } else {
      try {
        const parsed = JSON.parse(saved);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      } catch (e) {
        setSettings(DEFAULT_SETTINGS);
      }
    }
  }, [storageKey]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(settings));
  }, [settings, storageKey]);

  const updateSetting = useCallback((key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const updateActivityType = useCallback((type, enabled) => {
    setSettings(prev => ({
      ...prev,
      activityTypes: { ...prev.activityTypes, [type]: enabled }
    }));
  }, []);

  const toggleWorkDay = useCallback((day) => {
    setSettings(prev => {
      const workDays = prev.workDays || [1, 2, 3, 4, 5];
      const next = workDays.includes(day)
        ? workDays.filter(d => d !== day)
        : [...workDays, day].sort();
      return { ...prev, workDays: next };
    });
  }, []);

  return { settings, updateSetting, updateActivityType, toggleWorkDay };
}
