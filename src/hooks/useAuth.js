import { useState, useEffect, useCallback } from 'react';

const USERS_KEY = 'pomotivity_users';
const SESSION_KEY = 'pomotivity_current_user';
const CONFIG_KEY = 'pomotivity_config';

const INITIAL_USERS = [
  { id: 'admin', username: 'admin', password: 'password', role: 'admin', name: 'System Admin' }
];

const DEFAULT_CONFIG = {
  signupsEnabled: true
};

export function useAuth() {
  // Safe helper to get runtime config
  const getRuntimeConfig = () => {
    try {
      return window.POMOTIVITY_CONFIG || {};
    } catch (e) {
      return {};
    }
  };

  const [users, setUsers] = useState(() => {
    const runtime = getRuntimeConfig();
    const saved = localStorage.getItem(USERS_KEY);
    let list = INITIAL_USERS;

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) list = parsed;
      } catch (e) {}
    }

    // Apply runtime overrides to admin
    return list.map(u => {
      if (u.id === 'admin') {
        return {
          ...u,
          username: runtime.ADMIN_USER || u.username,
          password: runtime.ADMIN_PASSWORD || u.password
        };
      }
      return u;
    });
  });

  const [config, setConfig] = useState(() => {
    const runtime = getRuntimeConfig();
    const saved = localStorage.getItem(CONFIG_KEY);
    let base = { 
      ...DEFAULT_CONFIG, 
      signupsEnabled: runtime.SIGNUPS_ENABLED !== undefined ? runtime.SIGNUPS_ENABLED : true 
    };

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...base, ...parsed };
      } catch (e) {}
    }
    return base;
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem(SESSION_KEY);
    if (!saved) return null;
    try {
      const parsed = JSON.parse(saved);
      return users.find(u => u.id === parsed.id) || null;
    } catch (e) {
      return null;
    }
  });

  useEffect(() => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  }, [currentUser]);

  const login = useCallback((username, password) => {
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      setCurrentUser(user);
      return { success: true };
    }
    return { success: false, message: 'Invalid credentials' };
  }, [users]);

  const register = useCallback((username, password, name) => {
    if (!config.signupsEnabled) {
      return { success: false, message: 'New user registrations are currently disabled.' };
    }
    if (users.find(u => u.username === username)) {
      return { success: false, message: 'Username already exists' };
    }
    const newUser = { id: Date.now().toString(), username, password, name, role: 'user' };
    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    return { success: true };
  }, [users, config.signupsEnabled]);

  const logout = useCallback(() => setCurrentUser(null), []);

  const changePassword = useCallback((userId, newPassword) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, password: newPassword } : u));
    if (currentUser?.id === userId) setCurrentUser(prev => ({ ...prev, password: newPassword }));
    return { success: true };
  }, [currentUser?.id]);

  const deleteUser = useCallback((userId) => {
    if (userId === 'admin') return { success: false, message: 'Cannot delete admin.' };
    setUsers(prev => prev.filter(u => u.id !== userId));
    localStorage.removeItem(`pomotivity_stats_${userId}`);
    localStorage.removeItem(`pomotivity_settings_${userId}`);
    return { success: true };
  }, []);

  const setSignupsEnabled = useCallback((enabled) => {
    setConfig(prev => ({ ...prev, signupsEnabled: enabled }));
  }, []);

  return { currentUser, users, config, login, register, logout, changePassword, deleteUser, setSignupsEnabled };
}
