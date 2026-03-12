'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Role } from '@/types';
import Cookies from 'js-cookie';

interface AuthState {
  token: string | null;
  username: string | null;
  role: Role | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (token: string, username: string, role: Role) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      username: null,
      role: null,
      isAuthenticated: false,
      isAdmin: false,

      login: (token, username, role) => {
        localStorage.setItem('token', token);
        Cookies.set('token', token, { expires: 1 });
        Cookies.set('role', role, { expires: 1 });
        set({
          token,
          username,
          role,
          isAuthenticated: true,
          isAdmin: role === 'ROLE_ADMIN',
        });
      },

      logout: () => {
        localStorage.removeItem('token');
        Cookies.remove('token');
        Cookies.remove('role');
        set({
          token: null,
          username: null,
          role: null,
          isAuthenticated: false,
          isAdmin: false,
        });
      },
    }),
    { name: 'auth-storage' }
  )
);