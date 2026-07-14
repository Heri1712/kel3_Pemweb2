import React, { createContext, useContext, useState, useCallback } from 'react';
import { getToken, getUser, saveSession, clearSession, isAuthenticated } from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(getToken);
  const [user, setUser] = useState(getUser);

  const login = useCallback((newToken, userData) => {
    saveSession(newToken, userData);
    setToken(newToken);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, isAuth: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
