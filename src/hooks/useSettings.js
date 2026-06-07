import { useState, useEffect, useCallback } from 'react';

const DEFAULT_SETTINGS = {
  workDuration: 25,
  breakDuration: 5,
  visualNotifications: true,
  audioNotifications: true,
  systemNotifications: false,
  showInstructions: true,
  theme: 'system',
  allowedActivities: ['stretching', 'cardio', 'strength', 'eye_neck'],
  workDays: [1, 2, 3, 4, 5],
  dailyGoal: 4
};

export function useSettings(userId, authFetch) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    const loadSettings = async () => {
      try {
        const res = await authFetch(`/api/data/${userId}`);
        const data = await res.json();
        if (data.settings) {
          setSettings({ ...DEFAULT_SETTINGS, ...data.settings });
        } else {
          const local = localStorage.getItem(`pomotivity_settings_${userId}`);
          if (local) {
            const parsed = JSON.parse(local);
            setSettings({ ...DEFAULT_SETTINGS, ...parsed });
            authFetch(`/api/data/${userId}/settings`, { method: 'POST', body: local });
          }
        }
      } catch (e) {}
      setIsLoading(false);
    };
    loadSettings();
  }, [userId, authFetch]);

  const updateSetting = useCallback((key, value) => {
    setSettings(prev => {
      const updated = { ...prev, [key]: value };
      authFetch(`/api/data/${userId}/settings`, { method: 'POST', body: JSON.stringify(updated) });
      localStorage.setItem(`pomotivity_settings_${userId}`, JSON.stringify(updated));
      return updated;
    });
  }, [userId, authFetch]);

  const updateActivityType = useCallback((type, enabled) => {
    setSettings(prev => {
      const newList = enabled
        ? [...prev.allowedActivities, type]
        : prev.allowedActivities.filter(a => a !== type);
      const updated = { ...prev, allowedActivities: newList };
      authFetch(`/api/data/${userId}/settings`, { method: 'POST', body: JSON.stringify(updated) });
      localStorage.setItem(`pomotivity_settings_${userId}`, JSON.stringify(updated));
      return updated;
    });
  }, [userId, authFetch]);

  const toggleWorkDay = useCallback((day) => {
    setSettings(prev => {
      const newList = prev.workDays.includes(day)
        ? prev.workDays.filter(d => d !== day)
        : [...prev.workDays, day];
      const updated = { ...prev, workDays: newList };
      authFetch(`/api/data/${userId}/settings`, { method: 'POST', body: JSON.stringify(updated) });
      localStorage.setItem(`pomotivity_settings_${userId}`, JSON.stringify(updated));
      return updated;
    });
  }, [userId, authFetch]);

  return { settings, updateSetting, updateActivityType, toggleWorkDay, isLoading };
}
