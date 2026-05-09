import React, { useState, useEffect, useRef, useCallback } from 'react';
import Timer from './components/Timer';
import MovementPrompt from './components/MovementPrompt';
import Dashboard from './components/Dashboard';
import SettingsModal from './components/SettingsModal';
import AuthView from './components/AuthView';
import AdminDashboard from './components/AdminDashboard';
import ReloadPrompt from './components/ReloadPrompt';
import { useSettings } from './hooks/useSettings';
import { useTimer } from './hooks/useTimer';
import { useGamification } from './hooks/useGamification';
import { useAuth } from './hooks/useAuth';
import { Settings, Clock, Trophy, LogOut, ShieldAlert, User } from 'lucide-react';
import './App.css';

function App() {
  const { currentUser, users, config, login, register, logout, changePassword, deleteUser, setSignupsEnabled } = useAuth();
  
  if (!currentUser) {
    return (
      <>
        <AuthView login={login} register={register} config={config} />
        <ReloadPrompt />
      </>
    );
  }

  return (
    <>
      <MainContent 
        key={currentUser.id} 
        currentUser={currentUser} 
        config={config}
        logout={logout} 
        changePassword={changePassword}
        deleteUser={deleteUser}
        setSignupsEnabled={setSignupsEnabled}
      />
      <ReloadPrompt />
    </>
  );
}

function MainContent({ currentUser, config, logout, changePassword, deleteUser, setSignupsEnabled }) {
  const settingsHook = useSettings(currentUser.id);
  const settings = settingsHook.settings;
  
  const timer = useTimer(settings);
  const gamification = useGamification(settings, currentUser.id);
  
  const { stats, logActivity, logSession, newAchievement, clearAchievementNotification, resetDaily, resetAll } = gamification;
  
  const [activeTab, setActiveTab] = useState('timer');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [flash, setFlash] = useState(false);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  
  const activityDoneInSession = useRef(false);
  const audioContextRef = useRef(null);

  useEffect(() => {
    const theme = settings.theme || 'system';
    let targetTheme = theme;
    if (theme === 'system') {
      targetTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    document.documentElement.setAttribute('data-theme', targetTheme);
  }, [settings.theme]);

  const initAudio = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
  }, []);

  useEffect(() => {
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

  useEffect(() => {
    if (timer.timerState === 'WORK' || timer.timerState === 'BREAK') {
      if (settings.visualNotifications) {
        setFlash(true);
        setTimeout(() => setFlash(false), 500);
      }
      if (settings.audioNotifications && audioContextRef.current) {
        try {
          const ctx = audioContextRef.current;
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
        } catch (e) {}
      }
      if (settings.systemNotifications && Notification.permission === 'granted') {
        new Notification('Pomotivity', {
          body: timer.timerState === 'WORK' ? 'Focus time starts now!' : 'Time for an active break!',
          icon: '/pwa-192x192.png'
        });
      }
    }
    if (timer.timerState === 'BREAK') {
      activityDoneInSession.current = false;
    }
  }, [timer.timerState, settings.visualNotifications, settings.audioNotifications, settings.systemNotifications]);

  const prevTimerState = useRef(timer.timerState);
  useEffect(() => {
    if (prevTimerState.current === 'BREAK' && (timer.timerState === 'IDLE' || timer.timerState === 'WORK')) {
      if (activityDoneInSession.current) logSession();
    }
    prevTimerState.current = timer.timerState;
  }, [timer.timerState, logSession]);

  const handleCompleteActivity = useCallback((type) => {
    logActivity(type);
    activityDoneInSession.current = true;
  }, [logActivity]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: flash ? (timer.timerState === 'WORK' ? 'var(--accent-work-light)' : 'var(--accent-break-light)') : 'var(--bg-primary)',
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-1px' }}>Pomotivity</h1>
          <div style={{ padding: '4px 8px', borderRadius: '6px', background: 'var(--bg-secondary)', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
            {currentUser.name}
          </div>
        </div>
        
        <nav style={{ display: 'flex', gap: '4px', background: 'var(--bg-secondary)', padding: '4px', borderRadius: '10px' }}>
          <button className={`btn ${activeTab === 'timer' ? 'btn-primary' : ''}`} onClick={() => setActiveTab('timer')} style={{ padding: '6px 12px', borderRadius: '8px' }}>
            <Clock size={18} /> {!isMobile && <span style={{marginLeft: '6px'}}>Timer</span>}
          </button>
          <button className={`btn ${activeTab === 'dashboard' ? 'btn-primary' : ''}`} onClick={() => setActiveTab('dashboard')} style={{ padding: '6px 12px', borderRadius: '8px' }}>
            <Trophy size={18} /> {!isMobile && <span style={{marginLeft: '6px'}}>Progress</span>}
          </button>
          {currentUser.role === 'admin' && (
            <button className={`btn ${activeTab === 'admin' ? 'btn-primary' : ''}`} onClick={() => setActiveTab('admin')} style={{ padding: '6px 12px', borderRadius: '8px' }}>
              <ShieldAlert size={18} /> {!isMobile && <span style={{marginLeft: '6px'}}>Admin</span>}
            </button>
          )}
        </nav>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-icon" onClick={() => setIsSettingsOpen(true)}><Settings size={20} /></button>
          <button className="btn btn-icon" onClick={logout} style={{ color: '#ef4444' }}><LogOut size={20} /></button>
        </div>
      </header>

      <main style={{ padding: isMobile ? '1.5rem' : '2.5rem', flex: 1, maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <div className="animate-slide-up">
          {activeTab === 'timer' && (
            <div style={{ display: isMobile ? 'flex' : 'grid', gridTemplateColumns: isMobile ? 'none' : '1fr 380px', flexDirection: 'column', gap: '2.5rem', alignItems: isMobile ? 'center' : 'start' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', alignItems: 'center' }}>
                <Timer timer={timer} settings={settings} stats={stats} />
                <MovementPrompt isActive={timer.timerState === 'BREAK'} settings={settings} onCompleteActivity={handleCompleteActivity} onSkipBreak={timer.skipBreak} />
              </div>
              {!isMobile && <div style={{ position: 'sticky', top: '6rem' }}><Dashboard stats={stats} settings={settings} /></div>}
            </div>
          )}
          {activeTab === 'dashboard' && <Dashboard stats={stats} settings={settings} />}
          {activeTab === 'admin' && currentUser.role === 'admin' && (
            <AdminDashboard 
              users={users} 
              config={config} 
              setSignupsEnabled={setSignupsEnabled} 
              deleteUser={deleteUser}
              changePassword={changePassword}
              currentUserId={currentUser.id}
            />
          )}
        </div>
      </main>

      {newAchievement && (
        <div className="glass-panel animate-slide-up" style={{ position: 'fixed', bottom: '2rem', right: '2rem', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '12px', border: '2px solid #eab308', zIndex: 60, cursor: 'pointer' }} onClick={clearAchievementNotification}>
          <div style={{ fontSize: '2rem' }}>{newAchievement.icon}</div>
          <div>
            <div style={{ fontWeight: 700, color: '#eab308', fontSize: '0.8rem' }}>NEW ACHIEVEMENT!</div>
            <div style={{ fontWeight: 700 }}>{newAchievement.title}</div>
          </div>
        </div>
      )}

      <SettingsModal 
        isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} settings={settings}
        updateSetting={settingsHook.updateSetting} updateActivityType={settingsHook.updateActivityType} toggleWorkDay={settingsHook.toggleWorkDay}
        resetDaily={resetDaily} resetAll={resetAll}
        currentUser={currentUser} changePassword={changePassword}
      />
    </div>
  );
}

export default App;
