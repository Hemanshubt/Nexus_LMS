import { create } from 'zustand';
import { api } from '@/services/api';

interface User {
    id: string;
    email: string;
    name: string;
    role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
    avatar?: string;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (user: User) => void;
    setUser: (user: User) => void;
    logout: () => void;
    checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    login: (user) => set({ user, isAuthenticated: true, isLoading: false }),
    setUser: (user) => set({ user }),
    logout: async () => {
        try {
            await api.get('/auth/logout');
            set({ user: null, isAuthenticated: false, isLoading: false });
        } catch (error) {
            console.error("Logout failed", error);
            // Even if API fails, clear local state
            set({ user: null, isAuthenticated: false, isLoading: false });
        }
    },
    checkAuth: async () => {
        set({ isLoading: true });
        try {
            const res = await api.get('/users/me');
            if (res.data.data.user) {
                set({ user: res.data.data.user, isAuthenticated: true, isLoading: false });
            } else {
                set({ user: null, isAuthenticated: false, isLoading: false });
            }
        } catch (error) {
            set({ user: null, isAuthenticated: false, isLoading: false });
        }
    },
}));
