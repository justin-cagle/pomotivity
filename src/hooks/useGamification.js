import { useState, useEffect, useRef, useCallback } from 'react';
import { achievements } from '../data/achievements';

const INITIAL_STATS = {
  totalActivities: 0,
  totalBreaks: 0,
  currentStreak: 0,
  allTimeActivities: 0,
  achievements: [],
  history: [],
  lastUpdate: null,
  breaksToday: 0,
  todayHistory: [],
  typeCounts: {},
  usageCalendar: {},
  hasEarlyActivity: false,
  hasLateActivity: false,
  lastGoalDate: null,
};

function getPrevWorkDay(workDays) {
  const today = new Date();
  for (let i = 1; i <= 14; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    if (workDays.includes(d.getDay())) {
      return d.toISOString().split('T')[0];
    }
  }
  return null;
}

export function useGamification(settings, userId, authFetch) {
  const [stats, setStats] = useState(INITIAL_STATS);
  const [newAchievement, setNewAchievement] = useState(null);
  const settingsRef = useRef(settings);
  useEffect(() => { settingsRef.current = settings; }, [settings]);

  useEffect(() => {
    if (!userId) return;
    const loadStats = async () => {
      try {
        const res = await authFetch(`/api/data/${userId}`);
        const data = await res.json();
        if (data.stats) {
          setStats({ ...INITIAL_STATS, ...data.stats });
        } else {
          const local = localStorage.getItem(`pomotivity_stats_${userId}`);
          if (local) {
            const parsed = JSON.parse(local);
            setStats({ ...INITIAL_STATS, ...parsed });
            authFetch(`/api/data/${userId}/stats`, { method: 'POST', body: local });
          }
        }
      } catch (e) {}
    };
    loadStats();
  }, [userId, authFetch]);

  const saveStats = useCallback((updatedStats) => {
    authFetch(`/api/data/${userId}/stats`, {
      method: 'POST',
      body: JSON.stringify(updatedStats)
    });
    localStorage.setItem(`pomotivity_stats_${userId}`, JSON.stringify(updatedStats));
  }, [userId, authFetch]);

  const checkAchievements = useCallback((newStats) => {
    const earned = [...(newStats.achievements || [])];
    for (const achievement of achievements) {
      if (!earned.includes(achievement.id) && achievement.condition(newStats)) {
        earned.push(achievement.id);
        setNewAchievement(achievement);
      }
    }
    return earned;
  }, []);

  const logActivity = useCallback((type, name) => {
    setStats(prev => {
      const now = new Date();
      const todayLocale = now.toLocaleDateString();
      const todayISO = now.toISOString().split('T')[0];
      const hour = now.getHours();

      const newStats = {
        ...prev,
        typeCounts: { ...prev.typeCounts },
        usageCalendar: { ...prev.usageCalendar },
      };

      // Reset daily fields on new day
      const lastUpdateDate = prev.lastUpdate ? new Date(prev.lastUpdate).toLocaleDateString() : null;
      if (lastUpdateDate !== todayLocale) {
        newStats.breaksToday = 0;
        newStats.todayHistory = [];
      }

      // Deep-copy today's history entry before mutating
      const existingDayIdx = prev.history.findIndex(h => h.date === todayLocale);
      let dayLog;
      if (existingDayIdx >= 0) {
        dayLog = {
          ...prev.history[existingDayIdx],
          sessions: prev.history[existingDayIdx].sessions.map(s => ({ ...s, activities: [...s.activities] }))
        };
        newStats.history = prev.history.map((h, i) => i === existingDayIdx ? dayLog : h);
      } else {
        dayLog = { date: todayLocale, sessions: [] };
        newStats.history = [dayLog, ...prev.history];
      }

      if (dayLog.sessions.length === 0) {
        dayLog.sessions.unshift({ id: Date.now(), name: 'Break Activities', time: now.toLocaleTimeString(), activities: [] });
      }
      dayLog.sessions[0].activities.push({ type, name, time: now.toLocaleTimeString(), id: Date.now() });

      newStats.totalActivities += 1;
      newStats.allTimeActivities += 1;
      newStats.typeCounts[type] = (newStats.typeCounts[type] || 0) + 1;
      newStats.usageCalendar[todayISO] = (newStats.usageCalendar[todayISO] || 0) + 1;
      if (hour < 9) newStats.hasEarlyActivity = true;
      if (hour >= 21) newStats.hasLateActivity = true;
      newStats.lastUpdate = now.toISOString();
      newStats.todayHistory = dayLog.sessions;
      newStats.achievements = checkAchievements(newStats);

      saveStats(newStats);
      return newStats;
    });
  }, [saveStats, checkAchievements]);

  const logSession = useCallback(() => {
    setStats(prev => {
      const now = new Date();
      const todayLocale = now.toLocaleDateString();
      const todayISO = now.toISOString().split('T')[0];

      const newStats = {
        ...prev,
        usageCalendar: { ...prev.usageCalendar },
      };

      // Reset daily fields on new day
      const lastUpdateDate = prev.lastUpdate ? new Date(prev.lastUpdate).toLocaleDateString() : null;
      if (lastUpdateDate !== todayLocale) {
        newStats.breaksToday = 0;
        newStats.todayHistory = [];
      }

      newStats.totalBreaks += 1;
      newStats.breaksToday += 1;
      newStats.usageCalendar[todayISO] = (newStats.usageCalendar[todayISO] || 0) + 1;
      newStats.lastUpdate = now.toISOString();

      // Deep-copy today's history entry before mutating
      const existingDayIdx = prev.history.findIndex(h => h.date === todayLocale);
      let dayLog;
      if (existingDayIdx >= 0) {
        dayLog = { ...prev.history[existingDayIdx], sessions: [...prev.history[existingDayIdx].sessions] };
        newStats.history = prev.history.map((h, i) => i === existingDayIdx ? dayLog : h);
      } else {
        dayLog = { date: todayLocale, sessions: [] };
        newStats.history = [dayLog, ...prev.history];
      }

      dayLog.sessions.unshift({
        id: Date.now(),
        name: `Pomodoro #${newStats.breaksToday}`,
        time: now.toLocaleTimeString(),
        activities: []
      });
      newStats.todayHistory = dayLog.sessions;

      // Streak: update when daily goal is first reached today
      const { dailyGoal = 4, workDays = [1, 2, 3, 4, 5] } = settingsRef.current;
      if (newStats.breaksToday === dailyGoal) {
        const prevWorkDay = getPrevWorkDay(workDays);
        const oldLastGoalDate = newStats.lastGoalDate;
        newStats.lastGoalDate = todayISO;
        if (oldLastGoalDate === prevWorkDay) {
          newStats.currentStreak += 1;
        } else if (oldLastGoalDate !== todayISO) {
          newStats.currentStreak = 1;
        }
      }

      newStats.achievements = checkAchievements(newStats);

      saveStats(newStats);
      return newStats;
    });
  }, [saveStats, checkAchievements]);

  const resetDaily = useCallback(() => {
    setStats(prev => {
      const updated = { ...prev, totalActivities: 0, totalBreaks: 0, breaksToday: 0, todayHistory: [] };
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
