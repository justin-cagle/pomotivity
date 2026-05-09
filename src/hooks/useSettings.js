import { useState, useEffect } from 'react';

const DEFAULT_SETTINGS = {
  workDuration: 25,
  breakDuration: 5,
  theme: 'system',
  audioNotifications: true,
  visualNotifications: true,
  systemNotifications: false,
  showInstructions: true,
  autoStartWork: false,
  activityTypes: {
    Stretching: true,
    Cardio: true,
    Strength: true,
    'Eye/Neck Care': true
  },
  dailyGoal: 4,
  workDays: [1, 2, 3, 4, 5]
};

export function useSettings() {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('pomotivity_settings');
    if (!saved) return DEFAULT_SETTINGS;
    try {
      const parsed = JSON.parse(saved);
      // Merge with DEFAULT_SETTINGS to handle migrations
      return { ...DEFAULT_SETTINGS, ...parsed };
    } catch (e) {
      return DEFAULT_SETTINGS;
    }
  });

  useEffect(() => {
    localStorage.setItem('pomotivity_settings', JSON.stringify(settings));
    
    if (settings.theme === 'dark' || 
       (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [settings]);

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const updateActivityType = (type, isEnabled) => {
    setSettings(prev => ({
      ...prev,
      activityTypes: {
        ...prev.activityTypes,
        [type]: isEnabled
      }
    }));
  };

  const toggleWorkDay = (day) => {
    setSettings(prev => {
      const currentDays = prev.workDays || [1, 2, 3, 4, 5];
      const newWorkDays = currentDays.includes(day)
        ? currentDays.filter(d => d !== day)
        : [...currentDays, day].sort();
      return { ...prev, workDays: newWorkDays };
    });
  };

  return { settings, updateSetting, updateActivityType, toggleWorkDay };
}
