import { useState, useEffect, useCallback, useMemo } from 'react';
import { achievements } from '../data/achievements';

const INITIAL_STATS = {
  totalActivities: 0,
  totalBreaks: 0,
  currentStreak: 0,
  allTimeActivities: 0,
  achievements: [],
  history: [], // [{ date: '2023-10-01', activities: [{ type, time, subActivities: [] }] }]
  lastUpdate: null
};

export function useGamification(settings, userId) {
  const [stats, setStats] = useState(INITIAL_STATS);
  const [newAchievement, setNewAchievement] = useState(null);

  // Load from API
  useEffect(() => {
    if (!userId) return;
    
    const loadStats = async () => {
      try {
        const res = await fetch(`/api/data/${userId}`);
        const data = await res.json();
        if (data.stats) {
          setStats(data.stats);
        } else {
          // Migration from local storage
          const local = localStorage.getItem(`pomotivity_stats_${userId}`);
          if (local) {
            const parsed = JSON.parse(local);
            setStats(parsed);
            fetch(`/api/data/${userId}/stats`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: local
            });
          }
        }
      } catch (e) {}
    };

    loadStats();
  }, [userId]);

  const saveStats = useCallback((updatedStats) => {
    fetch(`/api/data/${userId}/stats`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedStats)
    });
    localStorage.setItem(`pomotivity_stats_${userId}`, JSON.stringify(updatedStats));
  }, [userId]);

  const logActivity = useCallback((type) => {
    setStats(prev => {
      const today = new Date().toLocaleDateString();
      const newStats = { ...prev };
      
      let dayLog = newStats.history.find(h => h.date === today);
      if (!dayLog) {
        dayLog = { date: today, sessions: [] };
        newStats.history.unshift(dayLog);
      }

      if (dayLog.sessions.length > 0) {
        const currentSession = dayLog.sessions[0];
        currentSession.activities.push({
          type,
          time: new Date().toLocaleTimeString(),
          id: Date.now()
        });
      }

      newStats.totalActivities += 1;
      newStats.allTimeActivities += 1;
      
      saveStats(newStats);
      return newStats;
    });
  }, [saveStats]);

  const logSession = useCallback(() => {
    setStats(prev => {
      const today = new Date().toLocaleDateString();
      const newStats = { ...prev };
      
      let dayLog = newStats.history.find(h => h.date === today);
      if (!dayLog) {
        dayLog = { date: today, sessions: [] };
        newStats.history.unshift(dayLog);
      }

      dayLog.sessions.unshift({
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        activities: []
      });

      newStats.totalBreaks += 1;
      
      saveStats(newStats);
      return newStats;
    });
  }, [saveStats]);

  const resetDaily = useCallback(() => {
    setStats(prev => {
      const updated = { ...prev, totalActivities: 0, totalBreaks: 0 };
      saveStats(updated);
      return updated;
    });
  }, [saveStats]);

  const resetAll = useCallback(() => {
    saveStats(INITIAL_STATS);
    setStats(INITIAL_STATS);
  }, [saveStats]);

  const clearAchievementNotification = () => setNewAchievement(null);

  return {
    stats,
    logActivity,
    logSession,
    newAchievement,
    clearAchievementNotification,
    resetDaily,
    resetAll
  };
}
