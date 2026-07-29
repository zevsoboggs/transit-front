const API_BASE = (import.meta.env.VITE_API_BASE as string) || "/api";
const TOKEN_KEY = "lk_token";
const CLIENT_KEY = "lk_client";

export interface LkClient {
  id: number;
  name: string;
  email: string | null;
}

export interface LkProfile {
  id: number;
  name: string;
  email: string | null;
  apiKey: string;
  balance: number;
  currency: string;
  depositAddress: string;
  network: string;
  minDeposit: number;
  status: string;
}

export interface LkOrder {
  id: string | number;
  ts: string;
  duration: string;
  amount: number;
  receiveAddress: string;
  status: string;
  txHash: string | null;
  price: number | null;
}

export interface LkTransaction {
  id: string | number;
  ts: string;
  type: string;
  amount: number;
  balance: number;
  ref: string | null;
  detail: string | null;
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredClient(): LkClient | null {
  const raw = localStorage.getItem(CLIENT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as LkClient;
  } catch {
    return null;
  }
}

export function lkLogout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(CLIENT_KEY);
}

export class LkError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function req<T>(path: string, opts: { method?: string; body?: unknown } = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (opts.body !== undefined) headers["Content-Type"] = "application/json";
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method: opts.method || "GET",
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });
  const text = await res.text();
  let data: unknown;
  try {
    data = text ? JSON.parse(text) : undefined;
  } catch {
    data = text;
  }
  if (!res.ok) {
    if (res.status === 401) lkLogout();
    const msg =
      (data && typeof data === "object" && "error" in data
        ? String((data as Record<string, unknown>).error)
        : undefined) || `Ошибка ${res.status}`;
    throw new LkError(msg, res.status);
  }
  return data as T;
}

export const clientApi = {
  async login(email: string, password: string) {
    const r = await req<{ token: string; client: LkClient }>("/client/login", {
      method: "POST",
      body: { email, password },
    });
    localStorage.setItem(TOKEN_KEY, r.token);
    localStorage.setItem(CLIENT_KEY, JSON.stringify(r.client));
    return r;
  },
  me: () => req<LkProfile>("/v1/me"),
  order: (body: { duration: string; amount: number; receiveAddress: string }) =>
    req<{ id: string; status: string; amount: number; receiveAddress: string; txHash: string | null; price: number | null; balance: number }>(
      "/v1/energy/order",
      { method: "POST", body },
    ),
  orders: () => req<{ orders: LkOrder[]; count: number }>("/v1/energy/orders"),
  transactions: () => req<{ transactions: LkTransaction[]; count: number }>("/v1/transactions"),
  changePassword: (currentPassword: string, newPassword: string) =>
    req<{ ok: boolean }>("/v1/change-password", {
      method: "POST",
      body: { currentPassword, newPassword },
    }),
};
