import { useState, useEffect, useCallback } from 'react';

const USERS_KEY = 'pomotivity_users';
const SESSION_KEY = 'pomotivity_current_user';
const CONFIG_KEY = 'pomotivity_config';

// Load runtime config from window (injected by Docker entrypoint)
const RUNTIME_CONFIG = window.POMOTIVITY_CONFIG || {};

const INITIAL_USERS = [
  { 
    id: 'admin', 
    username: RUNTIME_CONFIG.ADMIN_USER || 'admin', 
    password: RUNTIME_CONFIG.ADMIN_PASSWORD || 'password', 
    role: 'admin', 
    name: 'System Admin' 
  }
];

const DEFAULT_CONFIG = {
  signupsEnabled: RUNTIME_CONFIG.SIGNUPS_ENABLED !== undefined ? RUNTIME_CONFIG.SIGNUPS_ENABLED : true
};

export function useAuth() {
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem(USERS_KEY);
    const initialList = saved ? JSON.parse(saved) : INITIAL_USERS;
    
    // Ensure admin password/username from env vars overrides local if provided
    return initialList.map(u => {
      if (u.id === 'admin') {
        return {
          ...u,
          username: RUNTIME_CONFIG.ADMIN_USER || u.username,
          password: RUNTIME_CONFIG.ADMIN_PASSWORD || u.password
        };
      }
      return u;
    });
  });

  const [config, setConfig] = useState(() => {
    const saved = localStorage.getItem(CONFIG_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem(SESSION_KEY);
    if (!saved) return null;
    const parsed = JSON.parse(saved);
    const freshUser = users.find(u => u.id === parsed.id);
    return freshUser || null;
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
      return { success: false, message: 'New user registrations are currently disabled by an administrator.' };
    }
    if (users.find(u => u.username === username)) {
      return { success: false, message: 'Username already exists' };
    }
    const newUser = {
      id: Date.now().toString(),
      username,
      password,
      name,
      role: 'user'
    };
    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    return { success: true };
  }, [users, config.signupsEnabled]);

  const logout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  const changePassword = useCallback((userId, newPassword) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, password: newPassword } : u));
    if (currentUser?.id === userId) {
      setCurrentUser(prev => ({ ...prev, password: newPassword }));
    }
    return { success: true };
  }, [currentUser?.id]);

  const deleteUser = useCallback((userId) => {
    if (userId === 'admin') return { success: false, message: 'Cannot delete the system administrator.' };
    setUsers(prev => prev.filter(u => u.id !== userId));
    localStorage.removeItem(`pomotivity_stats_${userId}`);
    localStorage.removeItem(`pomotivity_settings_${userId}`);
    return { success: true };
  }, []);

  const setSignupsEnabled = useCallback((enabled) => {
    setConfig(prev => ({ ...prev, signupsEnabled: enabled }));
  }, []);

  return { 
    currentUser, 
    users, 
    config,
    login, 
    register, 
    logout, 
    changePassword, 
    deleteUser, 
    setSignupsEnabled 
  };
}
