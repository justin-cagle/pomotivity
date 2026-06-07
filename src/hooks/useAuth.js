import { useState, useEffect, useCallback } from 'react';

const TOKEN_KEY = 'pomotivity_token';
const USER_KEY = 'pomotivity_current_user';

export function useAuth() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem(USER_KEY);
    return saved ? JSON.parse(saved) : null;
  });
  const [config, setConfig] = useState({ signupsEnabled: true });

  const authFetch = useCallback((url, options = {}) => {
    return fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers
      }
    });
  }, [token]);

  useEffect(() => {
    fetch('/api/config')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setConfig(data); })
      .catch(() => {});
  }, []);

  const login = useCallback(async (username, password) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (data.success) {
        setToken(data.token);
        setCurrentUser(data.user);
        localStorage.setItem(TOKEN_KEY, data.token);
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
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
        setToken(data.token);
        setCurrentUser(data.user);
        localStorage.setItem(TOKEN_KEY, data.token);
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (e) {
      return { success: false, message: 'Server error' };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (e) {}
    setToken(null);
    setCurrentUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }, [token]);

  const changePassword = useCallback(async (userId, newPassword) => {
    try {
      const res = await authFetch(`/api/users/${userId}/password`, {
        method: 'POST',
        body: JSON.stringify({ newPassword })
      });
      return await res.json();
    } catch (e) {
      return { success: false };
    }
  }, [authFetch]);

  const deleteUser = useCallback(async (userId) => {
    try {
      const res = await authFetch(`/api/users/${userId}`, { method: 'DELETE' });
      return await res.json();
    } catch (e) {
      return { success: false };
    }
  }, [authFetch]);

  const setSignupsEnabled = useCallback(async (enabled) => {
    try {
      const res = await authFetch('/api/config', {
        method: 'POST',
        body: JSON.stringify({ signupsEnabled: enabled })
      });
      if (res.ok) setConfig(await res.json());
    } catch (e) {}
  }, [authFetch]);

  return {
    currentUser,
    token,
    authFetch,
    config,
    login,
    register,
    logout,
    changePassword,
    deleteUser,
    setSignupsEnabled
  };
}
