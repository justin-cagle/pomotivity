import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCw, X } from 'lucide-react';

export default function ReloadPrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needUpdate: [needUpdate, setNeedUpdate],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered: ' + r);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  const close = () => {
    setOfflineReady(false);
    setNeedUpdate(false);
  };

  if (!offlineReady && !needUpdate) return null;

  return (
    <div style={{
      position: 'fixed',
      right: '1.5rem',
      bottom: '1.5rem',
      zIndex: 1000,
    }}>
      <div className="glass-panel animate-slide-up" style={{
        padding: '1rem 1.5rem',
        background: 'var(--bg-secondary)',
        border: '2px solid var(--accent-work)',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        maxWidth: '300px'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <div style={{ 
            background: 'var(--accent-work-light)', 
            color: 'var(--accent-work)', 
            padding: '8px', 
            borderRadius: '10px' 
          }}>
            <RefreshCw size={20} className={needUpdate ? 'animate-spin' : ''} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
              {needUpdate ? 'New version available!' : 'App ready to work offline.'}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              {needUpdate 
                ? 'Click update to get the latest features and bug fixes.' 
                : 'Pomotivity is now cached for offline use.'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
          {needUpdate && (
            <button 
              className="btn btn-primary" 
              style={{ flex: 1, padding: '8px', fontSize: '0.85rem' }}
              onClick={() => updateServiceWorker(true)}
            >
              Update Now
            </button>
          )}
          <button 
            className="btn" 
            style={{ 
              flex: needUpdate ? 0 : 1, 
              padding: '8px', 
              fontSize: '0.85rem', 
              background: 'var(--bg-primary)',
              border: '1px solid var(--ui-border)' 
            }}
            onClick={close}
          >
            {needUpdate ? <X size={16} /> : 'Got it'}
          </button>
        </div>
      </div>
    </div>
  );
}
