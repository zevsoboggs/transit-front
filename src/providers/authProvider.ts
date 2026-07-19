import type { AuthProvider } from "@refinedev/core";
import { request, TOKEN_KEY, TransitApiError } from "./transitApi";

const USER_KEY = "transit_user";

interface LoginResponse {
  token: string;
  user: { id: number; email: string; name: string | null; role: string };
}

export const authProvider: AuthProvider = {
  login: async ({ email, password }) => {
    try {
      const res = await request<LoginResponse>("/auth/login", {
        method: "POST",
        body: { email, password },
      });
      localStorage.setItem(TOKEN_KEY, res.token);
      localStorage.setItem(USER_KEY, JSON.stringify(res.user));
      return { success: true, redirectTo: "/" };
    } catch (e) {
      return {
        success: false,
        error: {
          name: "Ошибка входа",
          message:
            e instanceof TransitApiError ? e.message : "Не удалось войти. Проверьте данные.",
        },
      };
    }
  },

  logout: async () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    return { success: true, redirectTo: "/login" };
  },

  check: async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return { authenticated: false, redirectTo: "/login" };
    try {
      await request("/auth/me");
      return { authenticated: true };
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      return { authenticated: false, redirectTo: "/login" };
    }
  },

  onError: async (error) => {
    if (error?.status === 401 || error instanceof TransitApiError && error.status === 401) {
      return { logout: true, redirectTo: "/login", error };
    }
    return {};
  },

  getIdentity: async () => {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      const u = JSON.parse(raw) as LoginResponse["user"];
      return { id: u.id, name: u.name || u.email, email: u.email };
    } catch {
      return null;
    }
  },
};
