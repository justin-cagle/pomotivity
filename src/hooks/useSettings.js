import { useState, useEffect, useCallback } from 'react';

const DEFAULT_SETTINGS = {
  workDuration: 25,
  breakDuration: 5,
  visualNotifications: true,
  audioNotifications: true,
  systemNotifications: false,
  showMovementDescription: true,
  theme: 'system',
  allowedActivities: ['stretching', 'cardio', 'strength', 'eye_neck'],
  workDays: [1, 2, 3, 4, 5],
  dailyGoal: 4
};

export function useSettings(userId) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // Load from API
  useEffect(() => {
    if (!userId) return;
    
    const loadSettings = async () => {
      try {
        const res = await fetch(`/api/data/${userId}`);
        const data = await res.json();
        if (data.settings) {
          setSettings(data.settings);
        } else {
          // If no server settings, try local storage (migration)
          const local = localStorage.getItem(`pomotivity_settings_${userId}`);
          if (local) {
            const parsed = JSON.parse(local);
            setSettings(parsed);
            // Sync to server immediately
            fetch(`/api/data/${userId}/settings`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: local
            });
          }
        }
      } catch (e) {}
      setIsLoading(false);
    };

    loadSettings();
  }, [userId]);

  const updateSetting = useCallback((key, value) => {
    setSettings(prev => {
      const updated = { ...prev, [key]: value };
      // Async sync to server
      fetch(`/api/data/${userId}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      // Also update local for offline fallback
      localStorage.setItem(`pomotivity_settings_${userId}`, JSON.stringify(updated));
      return updated;
    });
  }, [userId]);

  const updateActivityType = useCallback((type, enabled) => {
    setSettings(prev => {
      const newList = enabled 
        ? [...prev.allowedActivities, type]
        : prev.allowedActivities.filter(a => a !== type);
      const updated = { ...prev, allowedActivities: newList };
      
      fetch(`/api/data/${userId}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      localStorage.setItem(`pomotivity_settings_${userId}`, JSON.stringify(updated));
      return updated;
    });
  }, [userId]);

  const toggleWorkDay = useCallback((day) => {
    setSettings(prev => {
      const newList = prev.workDays.includes(day)
        ? prev.workDays.filter(d => d !== day)
        : [...prev.workDays, day];
      const updated = { ...prev, workDays: newList };
      
      fetch(`/api/data/${userId}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      localStorage.setItem(`pomotivity_settings_${userId}`, JSON.stringify(updated));
      return updated;
    });
  }, [userId]);

  return { settings, updateSetting, updateActivityType, toggleWorkDay, isLoading };
}
