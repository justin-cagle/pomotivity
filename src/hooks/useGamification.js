import { useState, useEffect, useCallback, useRef } from 'react';
import { achievements } from '../data/achievements';

const DEFAULT_STATS = {
  totalBreaks: 0,
  breaksToday: 0,
  totalActivities: 0,
  lastBreakDate: null,
  lastResetDate: null,
  currentStreak: 0,
  typeCounts: {},
  unlockedAchievements: [],
  usageCalendar: {},
  hasEarlyActivity: false,
  hasLateActivity: false,
  todayHistory: []
};

export function useGamification(settings) {
  const [stats, setStats] = useState(() => {
    try {
      const saved = localStorage.getItem('pomotivity_stats');
      if (!saved) return DEFAULT_STATS;
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_STATS, ...parsed };
    } catch (e) {
      return DEFAULT_STATS;
    }
  });

  const [newAchievement, setNewAchievement] = useState(null);
  const [currentSessionActivities, setCurrentSessionActivities] = useState([]);
  const isCheckingRef = useRef(false);

  const resetDaily = useCallback(() => {
    const todayStr = new Date().toDateString();
    setStats(prev => ({ 
      ...prev, 
      breaksToday: 0, 
      todayHistory: [], 
      lastResetDate: todayStr 
    }));
    // Also clear the buffer if one is active
    setCurrentSessionActivities([]);
  }, []);

  const resetAll = useCallback(() => {
    if (window.confirm("Are you sure you want to delete ALL progress? This cannot be undone.")) {
      setStats(DEFAULT_STATS);
      localStorage.removeItem('pomotivity_stats');
      setCurrentSessionActivities([]);
    }
  }, []);

  const checkAchievements = useCallback(() => {
    if (isCheckingRef.current) return;
    
    const newlyUnlocked = [];
    achievements.forEach(ach => {
      try {
        if (!stats.unlockedAchievements?.includes(ach.id) && ach.condition(stats)) {
          newlyUnlocked.push(ach.id);
          setNewAchievement(ach);
        }
      } catch (e) {
        console.error("Achievement error", ach.id, e);
      }
    });

    if (newlyUnlocked.length > 0) {
      isCheckingRef.current = true;
      setStats(prev => {
        const next = {
          ...prev,
          unlockedAchievements: [...(prev.unlockedAchievements || []), ...newlyUnlocked]
        };
        isCheckingRef.current = false;
        return next;
      });
    }
  }, [stats]);

  useEffect(() => {
    localStorage.setItem('pomotivity_stats', JSON.stringify(stats));
    checkAchievements();
  }, [stats, checkAchievements]);

  // Daily Reset Logic
  useEffect(() => {
    const todayStr = new Date().toDateString();
    if (stats.lastResetDate !== todayStr) {
      setStats(prev => {
        const lastDateStr = prev.lastBreakDate;
        let newStreak = prev.currentStreak || 0;

        if (lastDateStr && lastDateStr !== todayStr) {
          const lastDate = new Date(lastDateStr);
          const today = new Date();
          today.setHours(0,0,0,0);
          
          let daysPassed = 0;
          let tempDate = new Date(lastDate);
          tempDate.setHours(0,0,0,0);
          tempDate.setDate(tempDate.getDate() + 1);
          
          const workDays = settings?.workDays || [1, 2, 3, 4, 5];
          
          while (tempDate < today && daysPassed < 100) {
            if (workDays.includes(tempDate.getDay())) daysPassed++;
            tempDate.setDate(tempDate.getDate() + 1);
          }

          if (daysPassed >= 1) newStreak = 0;
        }

        return { 
          ...prev, 
          breaksToday: 0, 
          todayHistory: [], 
          lastResetDate: todayStr,
          currentStreak: newStreak 
        };
      });
    }
  }, [stats.lastResetDate, settings.workDays]);

  const logActivity = useCallback((type) => {
    const now = new Date();
    const hour = now.getHours();
    const dateKey = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setStats(prev => ({
      ...prev,
      totalActivities: (prev.totalActivities || 0) + 1,
      typeCounts: {
        ...(prev.typeCounts || {}),
        [type]: ((prev.typeCounts || {})[type] || 0) + 1
      },
      usageCalendar: {
        ...(prev.usageCalendar || {}),
        [dateKey]: ((prev.usageCalendar || {})[dateKey] || 0) + 1
      },
      hasEarlyActivity: prev.hasEarlyActivity || hour < 9,
      hasLateActivity: prev.hasLateActivity || hour >= 21
    }));

    setCurrentSessionActivities(prev => [
      ...prev,
      { type: 'activity', name: type, time: timeStr, id: Date.now() }
    ]);
  }, []);

  const logSession = useCallback(() => {
    const now = new Date();
    const todayStr = now.toDateString();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    setStats(prev => {
      let newStreak = prev.currentStreak || 0;
      if (prev.lastBreakDate !== todayStr) {
        newStreak += 1;
      }

      const sessionObj = {
        type: 'session',
        name: 'Active Break',
        time: timeStr,
        id: Date.now(),
        activities: [...currentSessionActivities]
      };

      return {
        ...prev,
        totalBreaks: (prev.totalBreaks || 0) + 1,
        breaksToday: (prev.breaksToday || 0) + 1,
        lastBreakDate: todayStr,
        lastResetDate: todayStr,
        currentStreak: newStreak,
        todayHistory: [
          sessionObj,
          ...(prev.todayHistory || [])
        ]
      };
    });

    setCurrentSessionActivities([]);
  }, [currentSessionActivities]);

  const clearAchievementNotification = useCallback(() => setNewAchievement(null), []);

  return { stats, logActivity, logSession, newAchievement, clearAchievementNotification, resetDaily, resetAll };
}
