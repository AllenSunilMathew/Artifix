import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

// Configure axios base
axios.defaults.baseURL = 'http://localhost:5000';

const setAxiosToken = (token) => {
  if (token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  else delete axios.defaults.headers.common['Authorization'];
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('medicare_token');
    if (token) {
      setAxiosToken(token);
      axios
        .get('/api/auth/me')
        .then((res) => setUser(res.data))
        .catch(() => {
          localStorage.removeItem('medicare_token');
          setAxiosToken(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password, registrationToken) => {
    const res = await axios.post('/api/auth/login', { email, password, registrationToken });
    const { token, user: userData } = res.data;
    localStorage.setItem('medicare_token', token);
    setAxiosToken(token);
    setUser(userData);
    return userData;
  }, []);

  const register = useCallback(async (formData) => {
    const res = await axios.post('/api/auth/register', formData);
    const { token, user: userData } = res.data;
    localStorage.setItem('medicare_token', token);
    setAxiosToken(token);
    setUser(userData);
    return userData;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('medicare_token');
    setAxiosToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback((updates) => {
    setUser((prev) => ({ ...prev, ...updates }));
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const res = await axios.get('/api/auth/me');
      setUser(res.data);
    } catch {}
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};
