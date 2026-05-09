import React from 'react';
import { Play, Pause, SkipForward, RotateCcw, Target } from 'lucide-react';

export default function Timer({ timer, settings, stats }) {
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const progress = timer?.progress || 0;
  const strokeDashoffset = circumference - progress * circumference;

  const isWork = timer?.timerState === 'WORK' || timer?.timerState === 'PAUSED_WORK' || timer?.timerState === 'IDLE';
  const colorVar = isWork ? 'var(--accent-work)' : 'var(--accent-break)';

  const sessionProgress = (stats?.breaksToday || 0);
  const sessionGoal = (settings?.dailyGoal || 4);

  return (
    <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem', minWidth: '320px', width: '100%', maxWidth: '400px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0, color: colorVar }}>
          {timer?.timerState === 'IDLE' ? 'Ready to Focus?' : 
           timer?.timerState?.includes('WORK') ? 'Focus Time' : 'Active Break'}
        </h2>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
          <Target size={14} />
          Session {sessionProgress} of {sessionGoal}
        </div>
      </div>

      <div style={{ position: 'relative', width: '280px', height: '280px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <svg width="280" height="280" style={{ position: 'absolute', transform: 'rotate(-90deg)' }}>
          <circle
            cx="140"
            cy="140"
            r={radius}
            fill="transparent"
            stroke="var(--ui-border)"
            strokeWidth="12"
          />
          <circle
            cx="140"
            cy="140"
            r={radius}
            fill="transparent"
            stroke={colorVar}
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s ease' }}
          />
        </svg>

        <div style={{ zIndex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: '4.5rem', fontWeight: 700, letterSpacing: '-2px', lineHeight: 1 }}>
            {timer?.formattedTime || '00:00'}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        {(timer?.timerState === 'IDLE' || timer?.timerState?.includes('PAUSED')) ? (
          <button className="btn btn-icon" onClick={timer?.startTimer} style={{ width: '60px', height: '60px' }}>
            <Play size={28} fill="currentColor" />
          </button>
        ) : (
          <button className="btn btn-icon" onClick={timer?.pauseTimer} style={{ width: '60px', height: '60px' }}>
            <Pause size={28} fill="currentColor" />
          </button>
        )}
        
        <button className="btn btn-icon" onClick={timer?.resetTimer} style={{ width: '60px', height: '60px' }}>
          <RotateCcw size={24} />
        </button>

        <button className="btn btn-icon" onClick={timer?.skipPhase} style={{ width: '60px', height: '60px' }}>
          <SkipForward size={24} />
        </button>
      </div>
    </div>
  );
}
