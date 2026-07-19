import type { DataProvider } from "@refinedev/core";
import { request, transit } from "./transitApi";
import type { Wallet } from "../types";

const API_BASE = (import.meta.env.VITE_API_BASE as string) || "/api/transit-api";

/**
 * Refine data provider bridging Refine resources to the transit-api.
 *
 *  - resource "wallets":  GET/POST /wallets, GET /wallets/:id, rename via update()
 *  - resource "networks": GET /networks (id = network slug)
 *
 * Balances, top-up and transfer are one-off operations handled through the
 * generic `custom` method (see useCustomMutation in the pages).
 */
export const dataProvider: DataProvider = {
  getApiUrl: () => API_BASE,

  getList: async ({ resource, filters, meta }) => {
    if (resource === "networks") {
      const networks = await transit.networks();
      return {
        data: networks.map((n) => ({ ...n, id: n.network })) as never,
        total: networks.length,
      };
    }

    if (resource === "energy-orders") {
      const res = await request<{ orders: unknown[]; count: number }>("/energy/orders");
      return { data: res.orders as never, total: res.count };
    }

    if (resource === "ledger") {
      const params: Record<string, string> = {};
      filters?.forEach((f) => {
        if ("field" in f && f.value != null && f.value !== "") {
          params[f.field] = String(f.value);
        }
      });
      const res = await request<{ entries: unknown[]; count: number }>("/ledger", {
        query: { ...params, limit: 500 },
      });
      return { data: res.entries as never, total: res.count };
    }

    if (resource === "wallets") {
      const projectFilter = filters?.find(
        (f) => "field" in f && f.field === "project",
      );
      const project =
        projectFilter && "value" in projectFilter && projectFilter.value
          ? String(projectFilter.value)
          : undefined;
      const withBalances = Boolean(meta?.balances);

      const { wallets, count } = await transit.listWallets({
        project,
        balances: withBalances,
      });
      return { data: wallets as never, total: count };
    }

    return { data: [], total: 0 };
  },

  getOne: async ({ resource, id }) => {
    if (resource === "wallets") {
      const wallet = await transit.getWallet(String(id));
      return { data: wallet as never };
    }
    if (resource === "networks") {
      const networks = await transit.networks();
      const found = networks.find((n) => n.network === String(id));
      return { data: (found ? { ...found, id: found.network } : {}) as never };
    }
    return { data: {} as never };
  },

  getMany: async ({ resource, ids }) => {
    if (resource === "wallets") {
      const results = await Promise.all(
        ids.map((id) => transit.getWallet(String(id))),
      );
      return { data: results as never };
    }
    return { data: [] as never };
  },

  create: async ({ resource, variables }) => {
    if (resource === "wallets") {
      const res = await transit.createWallet(variables as never);
      const wallet = (res as { wallet?: Wallet }).wallet ?? (res as Wallet);
      return { data: wallet as never };
    }
    throw new Error(`create not supported for resource "${resource}"`);
  },

  update: async ({ resource, id, variables }) => {
    if (resource === "wallets") {
      const v = variables as { label?: string };
      if (typeof v.label === "string") {
        await transit.rename(String(id), v.label);
      }
      const wallet = await transit.getWallet(String(id));
      return { data: wallet as never };
    }
    throw new Error(`update not supported for resource "${resource}"`);
  },

  deleteOne: async () => {
    throw new Error("Удаление кошельков не поддерживается API.");
  },

  custom: async ({ url, method, payload, query }) => {
    const data = await request(url, {
      method: (method || "get").toUpperCase(),
      body: payload,
      query: query as Record<string, string | number | boolean | undefined>,
    });
    return { data: data as never };
  },
};
