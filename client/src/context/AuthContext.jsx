import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

import API_URLS from '../config/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
// ...
  const login = async (email, password) => {
    const res = await axios.post(`${API_URLS.AUTH}/login`, { email, password });
    const { token, user: userData } = res.data;
    localStorage.setItem('clarieye_token', token);
    localStorage.setItem('clarieye_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('clarieye_token');
    localStorage.removeItem('clarieye_user');
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
