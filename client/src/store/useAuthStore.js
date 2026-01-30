"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAuthStore = void 0;
const zustand_1 = require("zustand");
const api_1 = require("@/services/api");
exports.useAuthStore = (0, zustand_1.create)((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    login: (user) => set({ user, isAuthenticated: true, isLoading: false }),
    setUser: (user) => set({ user }),
    logout: async () => {
        try {
            await api_1.api.get('/auth/logout');
            set({ user: null, isAuthenticated: false, isLoading: false });
        }
        catch (error) {
            console.error("Logout failed", error);
            // Even if API fails, clear local state
            set({ user: null, isAuthenticated: false, isLoading: false });
        }
    },
    checkAuth: async () => {
        set({ isLoading: true });
        try {
            const res = await api_1.api.get('/users/me');
            if (res.data.data.user) {
                set({ user: res.data.data.user, isAuthenticated: true, isLoading: false });
            }
            else {
                set({ user: null, isAuthenticated: false, isLoading: false });
            }
        }
        catch (error) {
            set({ user: null, isAuthenticated: false, isLoading: false });
        }
    },
}));
