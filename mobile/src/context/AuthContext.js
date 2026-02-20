import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login as apiLogin, register as apiRegister } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);       // { id, name, email, favorites }
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // hydrating from storage

  // Hydrate on app launch
  useEffect(() => {
    (async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        const storedUser = await AsyncStorage.getItem('user');
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (_) {
        // ignore parse errors
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const persist = async (tkn, usr) => {
    await AsyncStorage.setItem('token', tkn);
    await AsyncStorage.setItem('user', JSON.stringify(usr));
    setToken(tkn);
    setUser(usr);
  };

  const login = async (email, password) => {
    const { data } = await apiLogin(email, password);
    await persist(data.token, data.user);
  };

  const register = async (name, email, password) => {
    const { data } = await apiRegister(name, email, password);
    await persist(data.token, data.user);
  };

  const logout = async () => {
    await AsyncStorage.multiRemove(['token', 'user']);
    setToken(null);
    setUser(null);
  };

  // Keep the in-memory user favorites in sync after toggling
  const syncFavorites = (updatedFavorites) => {
    setUser((prev) => {
      const next = { ...prev, favorites: updatedFavorites };
      AsyncStorage.setItem('user', JSON.stringify(next)).catch(() => {});
      return next;
    });
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, register, logout, syncFavorites }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
