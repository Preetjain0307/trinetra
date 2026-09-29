import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('trinetra_user');
    return saved ? JSON.parse(saved) : {
      id: 1,
      email: 'operator@trinetra.local',
      full_name: 'Rajesh Verma',
      role: 'Operator',
      department: 'Border Control Room 1',
      badge_number: 'OP-8821'
    };
  });
  const [token, setToken] = useState(() => localStorage.getItem('trinetra_token'));
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await api.login(email, password);
      setToken(data.access_token);
      setUser(data.user);
      api.setToken(data.access_token);
      localStorage.setItem('trinetra_user', JSON.stringify(data.user));
      return data;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    api.clearToken();
    setUser(null);
    setToken(null);
  };

  const setDemoRole = (role) => {
    const roleUsers = {
      'Operator': { id: 1, email: 'operator@trinetra.local', full_name: 'Rajesh Verma', role: 'Operator', department: 'Border Control Room 1', badge_number: 'OP-8821' },
      'Investigator': { id: 2, email: 'investigator@trinetra.local', full_name: 'Captain Ananya Sen', role: 'Investigator', department: 'Sector Intelligence Wing', badge_number: 'INV-4412' },
      'Supervisor': { id: 3, email: 'supervisor@trinetra.local', full_name: 'Maj. Vikram Rathore', role: 'Supervisor', department: 'Tactical Command', badge_number: 'SUP-1002' },
      'System Admin': { id: 4, email: 'admin@trinetra.local', full_name: 'Preet Jain (Admin)', role: 'System Admin', department: 'Directorate of Surveillance Cyber & AI', badge_number: 'ADM-0001' },
    };
    const targetUser = roleUsers[role] || roleUsers['Operator'];
    setUser(targetUser);
    localStorage.setItem('trinetra_user', JSON.stringify(targetUser));
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, setDemoRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
