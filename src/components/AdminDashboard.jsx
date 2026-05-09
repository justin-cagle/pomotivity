import React from 'react';
import { Users, ShieldCheck, Activity, Award, UserCheck, Trash2, UserPlus, UserMinus, Key } from 'lucide-react';

export default function AdminDashboard({ users, config, setSignupsEnabled, deleteUser, changePassword, currentUserId }) {
  const getStatsForUser = (userId) => {
    try {
      const saved = localStorage.getItem(`pomotivity_stats_${userId}`);
      return saved ? JSON.parse(saved) : { totalActivities: 0, totalBreaks: 0, currentStreak: 0 };
    } catch (e) {
      return { totalActivities: 0, totalBreaks: 0, currentStreak: 0 };
    }
  };

  const handleDelete = (userId, username) => {
    if (window.confirm(`Are you sure you want to delete user "${username}"? All their stats and settings will be permanently erased.`)) {
      const res = deleteUser(userId);
      if (!res.success) alert(res.message);
    }
  };

  const handleResetPassword = (userId, username) => {
    const newPass = window.prompt(`Enter a new password for "${username}":`);
    if (newPass && newPass.length >= 4) {
      changePassword(userId, newPass);
      alert(`Password for "${username}" has been reset.`);
    } else if (newPass) {
      alert("Password must be at least 4 characters.");
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="glass-panel" style={{ 
        padding: '2rem', 
        background: 'linear-gradient(135deg, var(--accent-work-light), transparent)',
        border: '1px solid var(--accent-work)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ShieldCheck size={32} color="var(--accent-work)" />
          <div>
            <h2 style={{ margin: 0 }}>Admin Control Panel</h2>
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Managing {users.length} registered users</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Registrations:</span>
          <button 
            className={`btn ${config.signupsEnabled ? 'btn-primary' : ''}`}
            style={{ 
              padding: '8px 16px', 
              fontSize: '0.8rem',
              background: config.signupsEnabled ? 'var(--accent-work)' : 'var(--bg-secondary)',
              color: config.signupsEnabled ? 'white' : 'var(--text-secondary)'
            }}
            onClick={() => setSignupsEnabled(!config.signupsEnabled)}
          >
            {config.signupsEnabled ? <><UserPlus size={14} /> Open</> : <><UserMinus size={14} /> Closed</>}
          </button>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users size={20} /> User Management
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {users.map(user => {
            const userStats = getStatsForUser(user.id);
            const isSelf = user.id === currentUserId;
            const isAdmin = user.role === 'admin';

            return (
              <div key={user.id} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '1rem',
                background: 'var(--bg-secondary)',
                borderRadius: '12px',
                border: '1px solid var(--ui-border)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ 
                    width: '40px', 
                    height: '40px', 
                    borderRadius: '10px', 
                    background: isAdmin ? 'var(--accent-work)' : 'var(--bg-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <UserCheck size={20} color={isAdmin ? 'white' : 'var(--text-primary)'} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700 }}>{user.name || user.username} {isSelf && '(You)'}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>@{user.username} • {user.role}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                  <div style={{ display: 'flex', gap: '1.5rem' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1rem', fontWeight: 700 }}>{userStats.totalActivities}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Activities</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1rem', fontWeight: 700 }}>{userStats.currentStreak}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Streak</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      className="btn" 
                      style={{ padding: '8px', color: 'var(--accent-work)', background: 'var(--bg-primary)' }}
                      onClick={() => handleResetPassword(user.id, user.username)}
                      title="Reset Password"
                    >
                      <Key size={18} />
                    </button>
                    
                    {!isSelf && user.id !== 'admin' && (
                      <button 
                        className="btn" 
                        style={{ padding: '8px', color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)' }}
                        onClick={() => handleDelete(user.id, user.username)}
                        title="Delete User"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
