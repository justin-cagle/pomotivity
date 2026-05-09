import React from 'react';
import { Users, ShieldCheck, Activity, Award, UserCheck } from 'lucide-react';

export default function AdminDashboard({ users }) {
  // Mock data for users since stats are in localstorage per user
  // In a real app, this would come from a server API
  const getStatsForUser = (userId) => {
    try {
      const saved = localStorage.getItem(`pomotivity_stats_${userId}`);
      return saved ? JSON.parse(saved) : { totalActivities: 0, totalBreaks: 0, currentStreak: 0 };
    } catch (e) {
      return { totalActivities: 0, totalBreaks: 0, currentStreak: 0 };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="glass-panel" style={{ 
        padding: '2rem', 
        background: 'linear-gradient(135deg, var(--accent-work-light), transparent)',
        border: '1px solid var(--accent-work)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
          <ShieldCheck size={32} color="var(--accent-work)" />
          <div>
            <h2 style={{ margin: 0 }}>Admin Control Panel</h2>
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Managing {users.length} registered users</p>
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users size={20} /> User Management
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {users.map(user => {
            const userStats = getStatsForUser(user.id);
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
                    background: user.role === 'admin' ? 'var(--accent-work)' : 'var(--bg-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <UserCheck size={20} color={user.role === 'admin' ? 'white' : 'var(--text-primary)'} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700 }}>{user.name || user.username}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>@{user.username} • {user.role}</div>
                  </div>
                </div>

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
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
