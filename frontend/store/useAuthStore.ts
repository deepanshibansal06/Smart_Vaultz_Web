import { create } from "zustand";
import { User } from "@/types";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, token: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: (user, token) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("smart_vault_token", token);
      localStorage.setItem("smart_vault_user", JSON.stringify(user));
    }
    set({ user, token, isAuthenticated: true, isLoading: false });
  },

  setUser: (user) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("smart_vault_user", JSON.stringify(user));
    }
    set({ user });
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("smart_vault_token");
      localStorage.removeItem("smart_vault_user");
    }
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
  },

  setLoading: (isLoading) => set({ isLoading }),

  initialize: () => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("smart_vault_token");
      const storedUser = localStorage.getItem("smart_vault_user");

      if (token && storedUser) {
        try {
          const user = JSON.parse(storedUser);
          set({ user, token, isAuthenticated: true, isLoading: false });
        } catch {
          localStorage.removeItem("smart_vault_token");
          localStorage.removeItem("smart_vault_user");
          set({ user: null, token: null, isAuthenticated: false, isLoading: false });
        }
      } else {
        set({ isLoading: false });
      }
    } else {
      set({ isLoading: false });
    }
  },
}));
