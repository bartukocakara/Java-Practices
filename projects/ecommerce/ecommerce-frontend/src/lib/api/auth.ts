import api from './axios';
import { AuthResponse } from '@/types';

export const authApi = {
  login: (username: string, password: string) =>
    api.post<AuthResponse>('/api/auth/login', { username, password }).then(r => r.data),

  register: (username: string, email: string, password: string) =>
    api.post<AuthResponse>('/api/auth/register', { username, email, password }).then(r => r.data),
};