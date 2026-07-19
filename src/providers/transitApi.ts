import type {
  CreateWalletInput,
  MasterWallet,
  Network,
  TopupInput,
  TransferInput,
  Wallet,
} from "../types";

const API_BASE = (import.meta.env.VITE_API_BASE as string) || "/api";

export const TOKEN_KEY = "transit_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export class TransitApiError extends Error {
  status: number;
  body: unknown;
  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = "TransitApiError";
    this.status = status;
    this.body = body;
  }
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
  signal?: AbortSignal;
};

function buildUrl(path: string, query?: RequestOptions["query"]): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  const url = `${API_BASE}${clean}`;
  if (!query) return url;
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v !== undefined && v !== null && v !== "") qs.append(k, String(v));
  }
  const s = qs.toString();
  return s ? `${url}?${s}` : url;
}

export async function request<T = unknown>(
  path: string,
  { method = "GET", body, query, signal }: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(buildUrl(path, query), {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
  });

  const text = await res.text();
  let data: unknown = undefined;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    const msg =
      (data && typeof data === "object" && "error" in data
        ? String((data as Record<string, unknown>).error)
        : undefined) ||
      (data && typeof data === "object" && "message" in data
        ? String((data as Record<string, unknown>).message)
        : undefined) ||
      `Ошибка ${res.status}`;
    throw new TransitApiError(msg, res.status, data);
  }

  return data as T;
}

export const transit = {
  networks: () =>
    request<{ networks: Network[] }>("/networks").then((r) => r.networks),

  master: (signal?: AbortSignal) =>
    request<MasterWallet>("/master", { signal }),

  listWallets: (params: { project?: string; balances?: boolean } = {}) =>
    request<{ wallets: Wallet[]; count: number }>("/wallets", {
      query: { project: params.project, balances: params.balances ? 1 : undefined },
    }),

  getWallet: (id: string) =>
    request<{ wallet: Wallet }>(`/wallets/${id}`).then((r) => r.wallet),

  getBalance: (id: string) =>
    request<{ walletId: number; address: string; balances: Wallet["balances"] }>(
      `/wallets/${id}/balance`,
    ),

  createWallet: (input: CreateWalletInput) =>
    request<{ wallet: Wallet } | Wallet>("/wallets", { method: "POST", body: input }),

  topup: (id: string, input: TopupInput) =>
    request(`/wallets/${id}/topup`, { method: "POST", body: input }),

  transfer: (id: string, input: TransferInput) =>
    request(`/wallets/${id}/transfer`, { method: "POST", body: input }),

  rename: (id: string, label: string) =>
    request(`/wallets/${id}/rename`, { method: "POST", body: { label } }),
};
