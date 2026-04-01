import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import API_URLS from '../config/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user from local storage on mount
    const token = localStorage.getItem('clarieye_token') || localStorage.getItem('ocuscan_token');
    const storedUser = localStorage.getItem('clarieye_user') || localStorage.getItem('ocuscan_user');
    
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error("Failed to parse stored user", err);
        localStorage.removeItem('clarieye_token');
        localStorage.removeItem('clarieye_user');
      }
    }
    setLoading(loading => false);
  }, []);

  const login = async (email, password) => {
    try {
      const res = await axios.post(`${API_URLS.AUTH}/login`, { email, password });
      const { token, user: userData } = res.data;
      
      localStorage.setItem('clarieye_token', token);
      localStorage.setItem('clarieye_user', JSON.stringify(userData));
      
      setUser(userData);
      return userData;
    } catch (err) {
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('clarieye_token');
    localStorage.removeItem('clarieye_user');
    localStorage.removeItem('ocuscan_token');
    localStorage.removeItem('ocuscan_user');
    setUser(null);
  };

  const isAdmin = user?.role === 'Admin';
  const isDoctor = user?.role === 'Doctor' || user?.role === 'Admin';
  const isTechnician = user?.role === 'Technician' || user?.role === 'Admin';

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAdmin, isDoctor, isTechnician }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
