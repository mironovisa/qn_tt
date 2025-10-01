import { useState, useEffect, createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { User } from './api';
import { authApi } from './api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
        try {
          const response = await authApi.getProfile();
          setUser(response.data);
        } catch (error) {
          localStorage.removeItem('token');
          sessionStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string, rememberMe = false) => {
    const response = await authApi.login(email, password);
    const { access_token, user } = response.data;
    
    if (rememberMe) {
      localStorage.setItem('token', access_token);
      sessionStorage.removeItem('token');
    } else {
      sessionStorage.setItem('token', access_token);
      localStorage.removeItem('token');
    }
    
    setToken(access_token);
    setUser(user);
  };

  const register = async (email: string, password: string) => {
    const response = await authApi.register(email, password);
    const { access_token, user } = response.data;
    
    localStorage.setItem('token', access_token);
    setToken(access_token);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};