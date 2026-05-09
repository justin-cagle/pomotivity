import { useState, useEffect, useCallback } from 'react';

const SESSION_KEY = 'pomotivity_current_user';

export function useAuth() {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem(SESSION_KEY);
    return saved ? JSON.parse(saved) : null;
  });

  const [config, setConfig] = useState({ signupsEnabled: true });
  const [users, setUsers] = useState([]); // Used for admin view mainly

  // Fetch config and users (if admin)
  const refreshData = useCallback(async () => {
    try {
      const configRes = await fetch('/api/config');
      if (configRes.ok) setConfig(await configRes.json());

      if (currentUser?.role === 'admin') {
        // In a real app we'd have a specific endpoint for users list
        // For simplicity, we'll fetch them if needed
      }
    } catch (e) {}
  }, [currentUser?.role]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const login = useCallback(async (username, password) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (data.success) {
        setCurrentUser(data.user);
        localStorage.setItem(SESSION_KEY, JSON.stringify(data.user));
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (e) {
      return { success: false, message: 'Server error' };
    }
  }, []);

  const register = useCallback(async (username, password, name) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, name })
      });
      const data = await res.json();
      if (data.success) {
        setCurrentUser(data.user);
        localStorage.setItem(SESSION_KEY, JSON.stringify(data.user));
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (e) {
      return { success: false, message: 'Server error' };
    }
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem(SESSION_KEY);
  }, []);

  const changePassword = useCallback(async (userId, newPassword) => {
    try {
      const res = await fetch(`/api/users/${userId}/password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword })
      });
      const data = await res.json();
      if (data.success && currentUser?.id === userId) {
        const updated = { ...currentUser, password: newPassword };
        setCurrentUser(updated);
        localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
      }
      return data;
    } catch (e) {
      return { success: false };
    }
  }, [currentUser]);

  const deleteUser = useCallback(async (userId) => {
    try {
      const res = await fetch(`/api/users/${userId}`, { method: 'DELETE' });
      return await res.json();
    } catch (e) {
      return { success: false };
    }
  }, []);

  const setSignupsEnabled = useCallback(async (enabled) => {
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signupsEnabled: enabled })
      });
      if (res.ok) setConfig(await res.json());
    } catch (e) {}
  }, []);

  return { 
    currentUser, 
    config,
    login, 
    register, 
    logout, 
    changePassword, 
    deleteUser, 
    setSignupsEnabled 
  };
}
