import React, { useEffect, useState, useCallback } from 'react';
import { activities } from '../data/activities';
import { CheckCircle2, Dumbbell, Activity, Eye, Zap, AlertTriangle, SkipForward } from 'lucide-react';

const TYPE_MAP = { stretching: 'Stretching', cardio: 'Cardio', strength: 'Strength', eye_neck: 'Eye/Neck Care' };

export default function MovementPrompt({ isActive, settings, onCompleteActivity, onSkipBreak }) {
  const [currentActivity, setCurrentActivity] = useState(null);
  const [showSkipWarning, setShowSkipWarning] = useState(false);

  const pickActivity = useCallback(() => {
    const allowed = new Set((settings.allowedActivities || []).map(k => TYPE_MAP[k]).filter(Boolean));
    const available = allowed.size > 0 ? activities.filter(a => allowed.has(a.type)) : activities;

    if (available.length > 0) {
      const filtered = currentActivity ? available.filter(a => a.id !== currentActivity.id) : available;
      const pool = filtered.length > 0 ? filtered : available;
      setCurrentActivity(pool[Math.floor(Math.random() * pool.length)]);
    } else {
      setCurrentActivity(activities[0]);
    }
  }, [settings.allowedActivities, currentActivity]);

  useEffect(() => {
    if (isActive && !currentActivity) {
      pickActivity();
    } else if (!isActive) {
      setCurrentActivity(null);
      setShowSkipWarning(false);
    }
  }, [isActive, pickActivity, currentActivity]);

  if (!isActive || !currentActivity) return null;

  const handleCompleteActivity = () => {
    onCompleteActivity(currentActivity.type, currentActivity.title);
    pickActivity();
  };

  const handleSkipClick = () => {
    if (showSkipWarning) {
      onSkipBreak();
    } else {
      setShowSkipWarning(true);
    }
  };

  const getIcon = (type) => {
    switch(type) {
      case 'Strength': return <Dumbbell className="activity-icon" />;
      case 'Cardio': return <Zap className="activity-icon" />;
      case 'Eye/Neck Care': return <Eye className="activity-icon" />;
      default: return <Activity className="activity-icon" />;
    }
  };

  return (
    <div className="glass-panel animate-slide-up" style={{ 
      padding: '2rem', 
      maxWidth: '500px', 
      width: '100%',
      border: '2px solid var(--accent-break)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem', color: 'var(--accent-break)' }}>
        {getIcon(currentActivity.type)}
        <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600 }}>{currentActivity.type} Break</h3>
      </div>
      
      <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem' }}>{currentActivity.title}</h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '1rem', fontWeight: 500 }}>
        Duration: {currentActivity.duration}
      </p>

      {settings.showInstructions && (
        <div style={{ 
          background: 'var(--bg-secondary)', 
          padding: '1rem', 
          borderRadius: '12px',
          marginBottom: '1.5rem',
          border: '1px solid var(--ui-border)'
        }}>
          <p style={{ margin: '0 0 0.5rem 0', fontWeight: 600 }}>Instructions:</p>
          <p style={{ margin: 0, lineHeight: 1.6 }}>{currentActivity.instructions}</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <button 
          className="btn btn-primary" 
          onClick={handleCompleteActivity}
          style={{ width: '100%', padding: '14px', fontSize: '1.1rem', backgroundColor: 'var(--accent-work)', boxShadow: '0 4px 14px var(--accent-work-light)' }}
        >
          <CheckCircle2 size={20} />
          Done! Next Activity?
        </button>

        <button 
          className="btn" 
          onClick={handleSkipClick}
          style={{ 
            width: '100%', 
            padding: '10px', 
            fontSize: '0.9rem', 
            color: showSkipWarning ? '#ef4444' : 'var(--text-secondary)',
            border: showSkipWarning ? '1px solid #ef4444' : '1px solid var(--ui-border)',
            background: showSkipWarning ? 'rgba(239, 68, 68, 0.1)' : 'transparent'
          }}
        >
          {showSkipWarning ? (
            <><AlertTriangle size={16} /> Movement is vital. Skip anyway?</>
          ) : (
            <><SkipForward size={16} /> Skip entire break phase</>
          )}
        </button>
      </div>
    </div>
  );
}
