import React from 'react';
import { X, Settings2, Trash2, Calendar } from 'lucide-react';

const DAYS = [
  { label: 'S', value: 0 },
  { label: 'M', value: 1 },
  { label: 'T', value: 2 },
  { label: 'W', value: 3 },
  { label: 'T', value: 4 },
  { label: 'F', value: 5 },
  { label: 'S', value: 6 }
];

export default function SettingsModal({ isOpen, onClose, settings, updateSetting, updateActivityType, toggleWorkDay, resetDaily, resetAll }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
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
        <button onClick={onClose} className="btn btn-icon" style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
          <X size={20} />
        </button>

        <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 2rem 0' }}>
          <Settings2 /> Settings
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <section>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', borderBottom: '1px solid var(--ui-border)', paddingBottom: '0.5rem' }}>Work Week</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '4px' }}>
              {DAYS.map(day => (
                <button
                  key={day.value}
                  onClick={() => toggleWorkDay(day.value)}
                  style={{
                    flex: 1,
                    height: '40px',
                    borderRadius: '8px',
                    border: '1px solid var(--ui-border)',
                    background: settings.workDays.includes(day.value) ? 'var(--accent-work)' : 'transparent',
                    color: settings.workDays.includes(day.value) ? 'white' : 'var(--text-primary)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {day.label}
                </button>
              ))}
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '8px' }}>Selected days are counted towards your activity streak.</p>
          </section>

          <section>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', borderBottom: '1px solid var(--ui-border)', paddingBottom: '0.5rem' }}>Timer Intervals (min)</h3>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Work</label>
                <input type="number" value={settings.workDuration} onChange={(e) => updateSetting('workDuration', Number(e.target.value))} style={{ width: '100%' }} min="1" />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Break</label>
                <input type="number" value={settings.breakDuration} onChange={(e) => updateSetting('breakDuration', Number(e.target.value))} style={{ width: '100%' }} min="1" />
              </div>
            </div>
          </section>

          <section>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', borderBottom: '1px solid var(--ui-border)', paddingBottom: '0.5rem' }}>Behavior</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label>Theme</label>
                <select value={settings.theme} onChange={(e) => updateSetting('theme', e.target.value)}>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System</option>
                </select>
              </div>
              {['audioNotifications', 'visualNotifications', 'systemNotifications', 'showInstructions', 'autoStartWork'].map(key => (
                <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={settings[key]} onChange={(e) => updateSetting(key, e.target.checked)} />
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </label>
              ))}
            </div>
          </section>

          <section>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', borderBottom: '1px solid var(--ui-border)', paddingBottom: '0.5rem' }}>Danger Zone</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button 
                onClick={() => { resetDaily(); alert("Today's progress reset!"); }}
                className="btn" 
                style={{ justifyContent: 'start', color: '#ef4444', border: '1px solid #ef4444' }}
              >
                <RotateCcw size={16} /> Reset Today's Progress
              </button>
              <button 
                onClick={resetAll}
                className="btn" 
                style={{ justifyContent: 'start', color: '#ef4444', border: '1px solid #ef4444' }}
              >
                <Trash2 size={16} /> Delete All-Time Data
              </button>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}

function RotateCcw({ size }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
  );
}
