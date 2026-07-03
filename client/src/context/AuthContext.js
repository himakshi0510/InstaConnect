// client/src/context/AuthContext.js
'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Handle Session validation on initial mount and route shifts safely
  useEffect(() => {
    const syncAuthSession = () => {
      try {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        const isPublicRoute = pathname === '/login' || pathname === '/register';

        if (!token || !storedUser) {
          // Clear records cleanly if partial records exist
          if (!isPublicRoute) {
            localStorage.clear();
            setUser(null);
            router.replace('/login');
          }
        } else {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          
          // Prevent authenticated users from going back to login/register manually
          if (isPublicRoute) {
            router.replace('/');
          }
        }
      } catch (err) {
        console.error("Session synchronization error:", err);
        localStorage.clear();
        setUser(null);
        router.replace('/login');
      } finally {
        setLoading(false);
      }
    };

    syncAuthSession();
  }, [pathname, router]);

  const login = async (credentials) => {
  setLoading(true);
  try {
    const responseData = await authService.login(credentials);

    // After interceptor fix, responseData = { token, user } directly
    const token = responseData?.token;
    const user  = responseData?.user;

    if (!token || !user) {
      throw new Error('Login failed. Please try again.');
    }

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
    router.replace('/');
    return responseData;
  } catch (error) {
    setUser(null);
    localStorage.clear();
    throw error;
  } finally {
    setLoading(false);
  }
};

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
    } catch (err) {
      console.warn('Silent exit cleanup processed:', err.message);
    } finally {
      localStorage.clear();
      setUser(null);
      router.replace('/login');
      setLoading(false);
    }
  };

  // Add this function inside AuthProvider, after the logout function
const updateUser = (updatedData) => {
  setUser(prev => {
    const merged = { ...prev, ...updatedData };
    localStorage.setItem('user', JSON.stringify(merged));
    return merged;
  });
};

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be nested within a valid AuthProvider structural boundary layout.');
  }
  return context;
};