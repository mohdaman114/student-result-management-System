import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api'; // Import the API utility
import { toast } from 'sonner'; // For notifications

interface User {
  _id: string; // Changed from 'id' to '_id' to match backend
  name: string;
  email: string;
  role: 'admin' | 'student';
  rollNumber?: string;
  class?: string;
  token: string; // Added token
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<User | null>; // Changed to return User
  signup: (name: string, email: string, password: string, role: 'admin' | 'student', rollNumber?: string) => Promise<User | null>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('srms-user');
    const savedToken = localStorage.getItem('token');
    if (savedUser && savedToken) {
      const parsedUser = JSON.parse(savedUser);
      return { ...parsedUser, token: savedToken }; // Reconstruct user with token
    }
    return null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('srms-user', JSON.stringify({ 
        _id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role, 
        rollNumber: user.rollNumber,
        class: user.class
      }));
      localStorage.setItem('token', user.token);
    } else {
      localStorage.removeItem('srms-user');
      localStorage.removeItem('token');
    }
  }, [user]);

  const login = async (email: string, password: string): Promise<User | null> => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, ...userData } = response.data;
      const newUser: User = { ...userData, token };
      setUser(newUser);
      toast.success('Login successful!');
      return newUser;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      toast.error(errorMessage);
      return null;
    }
  };

  const signup = async (name: string, email: string, password: string, role: 'admin' | 'student', rollNumber?: string): Promise<User | null> => {
    try {
      const response = await api.post('/auth/register', { name, email, password, role, rollNumber });
      const { token, ...userData } = response.data;
      const newUser: User = { ...userData, token };
      setUser(newUser);
      toast.success('Signup successful!');
      return newUser;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Signup failed';
      toast.error(errorMessage);
      return null;
    }
  };

  const logout = () => {
    setUser(null);
    toast.info('Logged out successfully!');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}