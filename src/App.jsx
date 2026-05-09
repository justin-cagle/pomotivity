import React, { useState, useEffect, useRef, useCallback } from 'react';
import Timer from './components/Timer';
import MovementPrompt from './components/MovementPrompt';
import Dashboard from './components/Dashboard';
import SettingsModal from './components/SettingsModal';
import { useSettings } from './hooks/useSettings';
import { useTimer } from './hooks/useTimer';
import { useGamification } from './hooks/useGamification';
import { Settings, Clock, Trophy } from 'lucide-react';
import './App.css';

function App() {
  const settingsHook = useSettings();
  const settings = settingsHook?.settings || {};
  
  const timer = useTimer(settings);
  const gamification = useGamification(settings);
  
  const { stats, logActivity, logSession, newAchievement, clearAchievementNotification, resetDaily, resetAll } = gamification || {};
  
  const [activeTab, setActiveTab] = useState('timer');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [flash, setFlash] = useState(false);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  
  const activityDoneInSession = useRef(false);
  const audioContextRef = useRef(null);

  // Initialize AudioContext on first user interaction
  const initAudio = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    window.addEventListener('click', initAudio, { once: true });
    window.addEventListener('touchstart', initAudio, { once: true });
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('click', initAudio);
      window.removeEventListener('touchstart', initAudio);
    };
  }, [initAudio]);

  // Notifications Effect
  useEffect(() => {
    if (timer?.timerState === 'WORK' || timer?.timerState === 'BREAK') {
      // Visual Flash
      if (settings?.visualNotifications) {
        setFlash(true);
        setTimeout(() => setFlash(false), 500);
      }

      // Audio Beep
      if (settings?.audioNotifications && audioContextRef.current) {
        try {
          const ctx = audioContextRef.current;
          if (ctx.state === 'suspended') ctx.resume();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(timer.timerState === 'WORK' ? 440 : 523.25, ctx.currentTime);
          gain.gain.setValueAtTime(0.1, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.2);
        } catch (e) {
          console.warn('Audio play failed', e);
        }
      }

      // System Notification
      if (settings?.systemNotifications && Notification.permission === 'granted') {
        new Notification('Pomotivity', {
          body: timer.timerState === 'WORK' ? 'Focus time starts now!' : 'Time for an active break!',
          icon: '/pwa-192x192.png'
        });
      }
    }

    if (timer?.timerState === 'BREAK') {
      activityDoneInSession.current = false;
    }
  }, [timer?.timerState, settings?.visualNotifications, settings?.audioNotifications, settings?.systemNotifications]);

  // Request system notification permission
  useEffect(() => {
    if (settings?.systemNotifications && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  }, [settings?.systemNotifications]);

  const prevTimerState = useRef(timer?.timerState);
  useEffect(() => {
    if (prevTimerState.current === 'BREAK' && (timer?.timerState === 'IDLE' || timer?.timerState === 'WORK')) {
      if (activityDoneInSession.current && logSession) {
        logSession();
      }
    }
    prevTimerState.current = timer?.timerState;
  }, [timer?.timerState, logSession]);

  const handleCompleteActivity = useCallback((type) => {
    if (logActivity) logActivity(type);
    activityDoneInSession.current = true;
  }, [logActivity]);

  const handleSkipBreak = useCallback(() => {
    if (timer?.skipBreak) timer.skipBreak();
  }, [timer]);

  const safeStats = stats || {};
  const safeTimer = timer || { timerState: 'IDLE', formattedTime: '00:00', progress: 0 };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: flash ? (safeTimer.timerState === 'WORK' ? 'var(--accent-work-light)' : 'var(--accent-break-light)') : 'var(--bg-primary)',
      transition: 'background-color 0.5s ease',
      color: 'var(--text-primary)'
    }}>
      
      <header style={{ 
        padding: '1rem 2rem', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: '1px solid var(--ui-border)',
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(10px)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-1px' }}>
          Pomotivity
        </h1>
        
        {isMobile && (
          <nav style={{ display: 'flex', gap: '4px', background: 'var(--bg-secondary)', padding: '4px', borderRadius: '10px' }}>
            <button className={`btn ${activeTab === 'timer' ? 'btn-primary' : ''}`} onClick={() => setActiveTab('timer')} style={{ padding: '6px 12px', borderRadius: '8px' }}>
              <Clock size={18} />
            </button>
            <button className={`btn ${activeTab === 'dashboard' ? 'btn-primary' : ''}`} onClick={() => setActiveTab('dashboard')} style={{ padding: '6px 12px', borderRadius: '8px' }}>
              <Trophy size={18} />
            </button>
          </nav>
        )}

        <button className="btn btn-icon" onClick={() => setIsSettingsOpen(true)}>
          <Settings size={20} />
        </button>
      </header>

      <main style={{ 
        padding: isMobile ? '1.5rem' : '2.5rem', 
        flex: 1,
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%'
      }}>
        {isMobile ? (
          <div className="animate-slide-up">
            {activeTab === 'timer' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', alignItems: 'center' }}>
                <Timer timer={safeTimer} settings={settings} stats={safeStats} />
                <MovementPrompt isActive={safeTimer.timerState === 'BREAK'} settings={settings} onCompleteActivity={handleCompleteActivity} onSkipBreak={handleSkipBreak} />
              </div>
            ) : (
              <Dashboard stats={safeStats} settings={settings} />
            )}
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 380px', 
            gap: '2.5rem',
            alignItems: 'start'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', alignItems: 'center' }}>
              <Timer timer={safeTimer} settings={settings} stats={safeStats} />
              <MovementPrompt isActive={safeTimer.timerState === 'BREAK'} settings={settings} onCompleteActivity={handleCompleteActivity} onSkipBreak={handleSkipBreak} />
            </div>
            <div style={{ position: 'sticky', top: '6rem' }}>
              <Dashboard stats={safeStats} settings={settings} />
            </div>
          </div>
        )}
      </main>

      {newAchievement && (
        <div className="glass-panel animate-slide-up" style={{
          position: 'fixed', bottom: '2rem', right: '2rem', padding: '1rem 1.5rem',
          display: 'flex', alignItems: 'center', gap: '12px', border: '2px solid #eab308', zIndex: 60, cursor: 'pointer'
        }} onClick={clearAchievementNotification}>
          <div style={{ fontSize: '2rem' }}>{newAchievement?.icon || '🏆'}</div>
          <div>
            <div style={{ fontWeight: 700, color: '#eab308', fontSize: '0.8rem' }}>NEW ACHIEVEMENT!</div>
            <div style={{ fontWeight: 700 }}>{newAchievement?.title || 'Achievement'}</div>
          </div>
        </div>
      )}

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        settings={settings}
        updateSetting={settingsHook?.updateSetting} 
        updateActivityType={settingsHook?.updateActivityType} 
        toggleWorkDay={settingsHook?.toggleWorkDay}
        resetDaily={resetDaily} 
        resetAll={resetAll}
      />
    </div>
  );
}

export default App;
