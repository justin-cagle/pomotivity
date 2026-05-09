import React, { useState } from 'react';
import { X, Moon, Sun, Monitor, Bell, Eye, EyeOff, Play, RotateCcw, Trash2, Calendar, Target, Lock, Check, AlertCircle } from 'lucide-react';
import { VERSION } from '../version';

export default function SettingsModal({ 
  isOpen, 
  onClose, 
  settings, 
  updateSetting, 
  updateActivityType, 
  toggleWorkDay,
  resetDaily, 
  resetAll,
  currentUser,
  changePassword
}) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });

  if (!isOpen) return null;

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'Passwords do not match' });
      return;
    }
    if (newPassword.length < 4) {
      setPasswordMsg({ type: 'error', text: 'Password must be at least 4 characters' });
      return;
    }
    changePassword(currentUser.id, newPassword);
    setPasswordMsg({ type: 'success', text: 'Password updated successfully!' });
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPasswordMsg({ type: '', text: '' }), 3000);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.4)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '1rem'
    }}>
      <div className="glass-panel animate-slide-up" style={{
        width: '100%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '2rem',
        position: 'relative'
      }}>
        <button className="btn btn-icon" onClick={onClose} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem' }}>
          <X size={20} />
        </button>

        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '2rem' }}>Settings</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          
          {/* Timer Configuration */}
          <section>
            <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Target size={18} /> Focus Intervals
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Work (min)</label>
                <input 
                  type="number" 
                  value={settings.workDuration} 
                  onChange={(e) => updateSetting('workDuration', parseInt(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Break (min)</label>
                <input 
                  type="number" 
                  value={settings.breakDuration} 
                  onChange={(e) => updateSetting('breakDuration', parseInt(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
            <div style={{ marginTop: '1.25rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Daily Goal (sessions)</label>
              <input 
                type="number" 
                value={settings.dailyGoal} 
                onChange={(e) => updateSetting('dailyGoal', parseInt(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
          </section>

          {/* Work Week */}
          <section>
            <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={18} /> Work Week
            </h3>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => {
                const isActive = settings.workDays.includes(idx);
                return (
                  <button 
                    key={day}
                    onClick={() => toggleWorkDay(idx)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      border: '1px solid var(--ui-border)',
                      background: isActive ? 'var(--accent-work)' : 'transparent',
                      color: isActive ? 'white' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
              Your streak won't break on unselected days.
            </p>
          </section>

          {/* Theme Selector */}
          <section>
            <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {settings.theme === 'dark' ? <Moon size={18} /> : settings.theme === 'light' ? <Sun size={18} /> : <Monitor size={18} />} Appearance
            </h3>
            <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-secondary)', padding: '4px', borderRadius: '12px' }}>
              {['light', 'dark', 'system'].map(t => (
                <button 
                  key={t}
                  className={`btn ${settings.theme === t ? 'btn-primary' : ''}`}
                  onClick={() => updateSetting('theme', t)}
                  style={{ flex: 1, textTransform: 'capitalize', fontSize: '0.85rem' }}
                >
                  {t}
                </button>
              ))}
            </div>
          </section>

          {/* Notifications */}
          <section>
            <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bell size={18} /> Notifications
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { key: 'visualNotifications', label: 'Screen Flash' },
                { key: 'audioNotifications', label: 'Audio Cues' },
                { key: 'systemNotifications', label: 'Desktop Notifications' },
                { key: 'showInstructions', label: 'Show Exercise Instructions' },
                { key: 'autoStartWork', label: 'Auto-start next work cycle' }
              ].map(({ key, label }) => (
                <label key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                  <span style={{ fontSize: '0.9rem' }}>{label}</span>
                  <input 
                    type="checkbox" 
                    checked={settings[key]} 
                    onChange={(e) => updateSetting(key, e.target.checked)}
                    style={{ width: '20px', height: '20px', accentColor: 'var(--accent-work)' }}
                  />
                </label>
              ))}
            </div>
          </section>

          {/* Security */}
          <section>
            <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lock size={18} /> Security
            </h3>
            <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <input 
                  type="password" 
                  placeholder="New Password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{ width: '100%' }}
                />
                <input 
                  type="password" 
                  placeholder="Confirm New Password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ padding: '8px', fontSize: '0.85rem' }}>
                Update Password
              </button>
              {passwordMsg.text && (
                <div style={{ 
                  fontSize: '0.8rem', 
                  color: passwordMsg.type === 'error' ? '#ef4444' : '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  {passwordMsg.type === 'error' ? <AlertCircle size={14} /> : <Check size={14} />}
                  {passwordMsg.text}
                </div>
              )}
            </form>
          </section>

          {/* Danger Zone */}
          <section style={{ borderTop: '1px solid var(--ui-border)', paddingTop: '2.5rem' }}>
            <h3 style={{ fontSize: '1rem', color: '#ef4444', marginBottom: '1.25rem', fontWeight: 700 }}>Danger Zone</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <button 
                className="btn" 
                onClick={() => { resetDaily(); onClose(); }}
                style={{ width: '100%', justifyContent: 'flex-start', color: '#ef4444', border: '1px solid #ef4444', background: 'rgba(239, 68, 68, 0.05)' }}
              >
                <RotateCcw size={18} /> Reset Today's Progress
              </button>
              <button 
                className="btn" 
                onClick={() => { resetAll(); onClose(); }}
                style={{ width: '100%', justifyContent: 'flex-start', background: '#ef4444', color: 'white' }}
              >
                <Trash2 size={18} /> Wipe All-Time Data
              </button>
            </div>
          </section>

          {/* App Version */}
          <section style={{ textAlign: 'center', marginTop: '1rem', borderTop: '1px solid var(--ui-border)', paddingTop: '1.5rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Pomotivity v{VERSION}
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', opacity: 0.6, marginTop: '4px' }}>
              Built for an Active Workday
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
