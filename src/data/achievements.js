export const achievements = [
  { id: 'first_break', title: 'First Step', icon: '🏆', description: 'Complete your first active break.', condition: (stats) => stats.totalBreaks >= 1 },
  { id: 'five_breaks', title: 'Getting Active', icon: '🏃', description: 'Complete 5 active breaks.', condition: (stats) => stats.totalBreaks >= 5 },
  { id: 'twenty_breaks', title: 'Habit Builder', icon: '🔥', description: 'Complete 20 active breaks.', condition: (stats) => stats.totalBreaks >= 20 },
  { id: 'fifty_breaks', title: 'Consistency King', icon: '👑', description: 'Complete 50 active breaks.', condition: (stats) => stats.totalBreaks >= 50 },
  { id: 'hundred_breaks', title: 'Century Club', icon: '💯', description: 'Complete 100 active breaks.', condition: (stats) => stats.totalBreaks >= 100 },
  { id: 'five_hundred_breaks', title: 'Iron lungs', icon: '🫁', description: 'Complete 500 active breaks.', condition: (stats) => stats.totalBreaks >= 500 },
  
  { id: 'streak_3', title: 'On a Roll', icon: '📅', description: 'Hit your goal for 3 work days.', condition: (stats) => stats.currentStreak >= 3 },
  { id: 'streak_7', title: 'Week Strong', icon: '🌟', description: 'Hit your goal for 7 work days.', condition: (stats) => stats.currentStreak >= 7 },
  { id: 'streak_30', title: 'Month of Power', icon: '🌑', description: 'Hit your goal for 30 work days.', condition: (stats) => stats.currentStreak >= 30 },
  { id: 'streak_100', title: 'Unstoppable Force', icon: '☄️', description: 'Hit your goal for 100 work days.', condition: (stats) => stats.currentStreak >= 100 },

  { id: 'cardio_10', title: 'Heart pumper', icon: '🫀', description: '10 Cardio activities.', condition: (stats) => (stats.typeCounts?.['Cardio'] || 0) >= 10 },
  { id: 'cardio_50', title: 'Cardio Champ', icon: '⚡', description: '50 Cardio activities.', condition: (stats) => (stats.typeCounts?.['Cardio'] || 0) >= 50 },
  { id: 'cardio_200', title: 'Sprint Master', icon: '🐆', description: '200 Cardio activities.', condition: (stats) => (stats.typeCounts?.['Cardio'] || 0) >= 200 },

  { id: 'stretch_10', title: 'Flexi', icon: '🧘', description: '10 Stretching activities.', condition: (stats) => (stats.typeCounts?.['Stretching'] || 0) >= 10 },
  { id: 'stretch_50', title: 'Rubber Band', icon: '➰', description: '50 Stretching activities.', condition: (stats) => (stats.typeCounts?.['Stretching'] || 0) >= 50 },
  { id: 'stretch_200', title: 'Zen Master', icon: '🏮', description: '200 Stretching activities.', condition: (stats) => (stats.typeCounts?.['Stretching'] || 0) >= 200 },

  { id: 'strength_10', title: 'Toning Up', icon: '💪', description: '10 Strength activities.', condition: (stats) => (stats.typeCounts?.['Strength'] || 0) >= 10 },
  { id: 'strength_50', title: 'Desk Warrior', icon: '🛡️', description: '50 Strength activities.', condition: (stats) => (stats.typeCounts?.['Strength'] || 0) >= 50 },
  { id: 'strength_200', title: 'Hercules', icon: '🏛️', description: '200 Strength activities.', condition: (stats) => (stats.typeCounts?.['Strength'] || 0) >= 200 },

  { id: 'eye_10', title: 'Eagle Eye', icon: '🦅', description: '10 Eye care activities.', condition: (stats) => (stats.typeCounts?.['Eye/Neck Care'] || 0) >= 10 },
  { id: 'eye_50', title: 'Focus Finder', icon: '🔭', description: '50 Eye care activities.', condition: (stats) => (stats.typeCounts?.['Eye/Neck Care'] || 0) >= 50 },

  { id: 'early_bird', title: 'Early Bird', icon: '🌅', description: 'Log an activity before 9 AM.', condition: (stats) => stats.hasEarlyActivity },
  { id: 'night_owl', title: 'Night Owl', icon: '🦉', description: 'Log an activity after 9 PM.', condition: (stats) => stats.hasLateActivity },
  
  { id: 'total_1000', title: 'Activity Legend', icon: '💎', description: '1,000 total activities completed.', condition: (stats) => stats.totalActivities >= 1000 },
  { id: 'calendar_10', title: 'Regular', icon: '🎟️', description: 'Used for 10 unique days.', condition: (stats) => Object.keys(stats.usageCalendar || {}).length >= 10 },
  { id: 'calendar_50', title: 'Dedicated', icon: '🗽', description: 'Used for 50 unique days.', condition: (stats) => Object.keys(stats.usageCalendar || {}).length >= 50 }
];
