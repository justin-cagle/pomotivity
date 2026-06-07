import React, { useState, useEffect, useRef } from 'react';
import { Target, Trophy, Flame, Activity, Award, BarChart3, Calendar, ChevronDown, ChevronUp, History, CheckCircle2, Dumbbell, Zap, Eye } from 'lucide-react';
import { achievements } from '../data/achievements';

function HistoryItem({ session, getIcon }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasActivities = session.activities && session.activities.length > 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {/* Session Header */}
      <div 
        onClick={() => hasActivities && setIsExpanded(!isExpanded)}
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: '8px 12px',
          background: 'var(--bg-secondary)',
          borderRadius: '8px',
          fontSize: '0.85rem',
          border: '1px solid var(--accent-work-light)',
          cursor: hasActivities ? 'pointer' : 'default'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {getIcon('session')}
          <span style={{ fontWeight: 700 }}>{session.name}</span>
          {hasActivities && (
            <span style={{ fontSize: '0.7rem', opacity: 0.6, fontWeight: 500 }}>
              ({session.activities.length} movements)
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{session.time}</span>
          {hasActivities && (isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
        </div>
      </div>
      
      {/* Activities (Collapsible Children) */}
      {hasActivities && isExpanded && (
        <div className="animate-slide-up" style={{ 
          marginLeft: '20px', 
          paddingLeft: '12px', 
          borderLeft: '2px solid var(--ui-border)',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          marginTop: '2px',
          marginBottom: '8px'
        }}>
          {session.activities.map((activity, aIdx) => (
            <div key={activity.id || aIdx} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '4px 8px',
              fontSize: '0.8rem',
              color: 'var(--text-secondary)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {getIcon(activity.type)}
                <span>{activity.name || activity.type}</span>
              </div>
              <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>{activity.time}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Dashboard({ stats, settings }) {
  const [isTrophiesExpanded, setIsTrophiesExpanded] = useState(false);
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);
  const [flashLog, setFlashLog] = useState(false);
  
  const prevHistoryCount = useRef(stats?.todayHistory?.length || 0);
  
  useEffect(() => {
    const currentCount = stats?.todayHistory?.length || 0;
    if (currentCount > prevHistoryCount.current) {
      setFlashLog(true);
      const timer = setTimeout(() => setFlashLog(false), 1000);
      return () => clearTimeout(timer);
    }
    prevHistoryCount.current = currentCount;
  }, [stats?.todayHistory]);

  const goalProgress = Math.min((stats.breaksToday / (settings?.dailyGoal || 4)) * 100, 100);
  const workDays = settings?.workDays || [1, 2, 3, 4, 5];

  const getIcon = (type) => {
    switch(type) {
      case 'Strength': return <Dumbbell size={12} />;
      case 'Cardio': return <Zap size={12} />;
      case 'Eye/Neck Care': return <Eye size={12} />;
      case 'session': return <CheckCircle2 size={14} color="var(--accent-work)" />;
      default: return <Activity size={12} />;
    }
  };

  const calendarDays = [];
  const today = new Date();
  for (let i = 27; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    calendarDays.push({
      date: key,
      dayNum: d.getDate(),
      count: stats.usageCalendar?.[key] || 0,
      isToday: key === today.toISOString().split('T')[0],
      isWorkDay: workDays.includes(d.getDay())
    });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        <div className="glass-panel" style={{ padding: '1rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <Flame size={24} color="var(--accent-break)" style={{ marginBottom: '8px' }} />
          <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{stats.currentStreak || 0}</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Streak</div>
        </div>
        
        <div className="glass-panel" style={{ padding: '1rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <Activity size={24} color="var(--accent-work)" style={{ marginBottom: '8px' }} />
          <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{stats.totalActivities || 0}</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Activities</div>
        </div>

        <div className="glass-panel" style={{ padding: '1rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <Award size={24} color="#eab308" style={{ marginBottom: '8px' }} />
          <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{stats.achievements?.length || 0}</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Badges</div>
        </div>
      </div>

      {/* Goal Progress */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Daily Session Goal</span>
          <span style={{ fontWeight: 700, color: 'var(--accent-work)', fontSize: '0.9rem' }}>{stats.breaksToday || 0} / {settings?.dailyGoal || 4}</span>
        </div>
        <div style={{ height: '6px', background: 'var(--bg-secondary)', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{ 
            height: '100%', 
            width: `${goalProgress}%`, 
            background: 'var(--accent-work)',
            transition: 'width 0.8s ease'
          }} />
        </div>
      </div>

      {/* Today's History Log */}
      <div className="glass-panel" style={{ 
        padding: '1rem',
        backgroundColor: flashLog ? 'var(--accent-work-light)' : 'var(--glass-bg)',
        transition: 'background-color 0.3s ease',
        border: flashLog ? '1px solid var(--accent-work)' : '1px solid var(--glass-border)'
      }}>
        <button 
          onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
          style={{
            width: '100%',
            background: 'transparent',
            border: 'none',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer',
            padding: '0.25rem 0.5rem',
            color: 'var(--text-primary)'
          }}
        >
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem' }}>
            <History size={18} /> Today's Log
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {(!isHistoryExpanded && stats.todayHistory?.length > 0) && (
              <span style={{ fontSize: '0.75rem', background: 'var(--accent-work)', color: 'white', padding: '2px 6px', borderRadius: '4px' }}>
                {stats.todayHistory.length}
              </span>
            )}
            {isHistoryExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
        </button>

        {isHistoryExpanded && (
          <div className="animate-slide-up" style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '12px', 
            maxHeight: '300px', 
            overflowY: 'auto', 
            marginTop: '1rem', 
            padding: '0 0.5rem 0.5rem' 
          }}>
            {stats.todayHistory && stats.todayHistory.length > 0 ? (
              stats.todayHistory.map((session, sIdx) => (
                <HistoryItem key={session.id || sIdx} session={session} getIcon={getIcon} />
              ))
            ) : (
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center', padding: '1rem' }}>
                No cycles completed yet today.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Calendar View */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <h3 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem' }}>
          <Calendar size={18} /> Activity Heatmap
        </h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(7, 1fr)', 
          gap: '6px',
          maxWidth: '300px'
        }}>
          {calendarDays.map(day => (
            <div 
              key={day.date}
              style={{
                aspectRatio: '1',
                borderRadius: '4px',
                background: day.count > 0 ? 'var(--accent-work)' : 'var(--bg-secondary)',
                opacity: day.count > 0 ? Math.min(0.3 + (day.count * 0.2), 1) : (day.isWorkDay ? 0.5 : 0.2),
                border: day.isToday ? '1px solid var(--text-primary)' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.6rem',
                fontWeight: 700,
                color: day.count > 0 ? 'white' : 'var(--text-secondary)'
              }}
              title={`${day.date}: ${day.count} activities`}
            >
              {day.dayNum}
            </div>
          ))}
        </div>
      </div>

      {/* Collapsible Trophy Room */}
      <div className="glass-panel" style={{ padding: '1rem' }}>
        <button 
          onClick={() => setIsTrophiesExpanded(!isTrophiesExpanded)}
          style={{
            width: '100%',
            background: 'transparent',
            border: 'none',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer',
            padding: '0.25rem 0.5rem',
            color: 'var(--text-primary)'
          }}
        >
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem' }}>
            <Trophy size={18} /> Trophy Room
          </h3>
          {isTrophiesExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>

        {isTrophiesExpanded && (
          <div className="animate-slide-up" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(50px, 1fr))', 
            gap: '8px',
            marginTop: '1.5rem',
            padding: '0 0.5rem 0.5rem'
          }}>
            {achievements.map(ach => {
              const isUnlocked = stats.achievements?.includes(ach.id);
              return (
                <div key={ach.id} style={{
                  aspectRatio: '1',
                  borderRadius: '10px',
                  background: isUnlocked ? 'var(--bg-secondary)' : 'transparent',
                  border: isUnlocked ? '1px solid var(--accent-work-light)' : '1px solid var(--ui-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  filter: isUnlocked ? 'none' : 'grayscale(1)',
                  opacity: isUnlocked ? 1 : 0.2,
                  transition: 'all 0.3s ease',
                  cursor: 'help'
                }} title={`${ach.title}: ${ach.description} ${isUnlocked ? '(Unlocked!)' : '(Locked)'}`}>
                  {ach.icon}
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
