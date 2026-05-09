import { useState, useEffect, useCallback } from 'react';

const USERS_KEY = 'pomotivity_users';
const SESSION_KEY = 'pomotivity_current_user';

const INITIAL_USERS = [
  { id: 'admin', username: 'admin', password: 'password', role: 'admin', name: 'System Admin' }
];

export function useAuth() {
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem(USERS_KEY);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem(SESSION_KEY);
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }, [users]);

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
  }, [users]);

  const logout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  return { currentUser, users, login, register, logout };
}
