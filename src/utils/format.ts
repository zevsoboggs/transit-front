import dayjs from "dayjs";

export const DAILY_LIMIT = Number(
  import.meta.env.VITE_DAILY_WALLET_LIMIT ?? 3000,
);

export function shortAddress(address: string, head = 8, tail = 6): string {
  if (!address) return "—";
  if (address.length <= head + tail + 1) return address;
  return `${address.slice(0, head)}…${address.slice(-tail)}`;
}

export function formatAmount(amount: number): string {
  if (amount === 0) return "0";
  const abs = Math.abs(amount);
  const digits = abs < 1 ? 6 : abs < 1000 ? 4 : 2;
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  });
}

export function formatDateTime(iso: string): string {
  return dayjs(iso).format("DD.MM.YYYY HH:mm");
}

export function isToday(iso: string): boolean {
  return dayjs(iso).isSame(dayjs(), "day");
}

export function countIssuedToday<T extends { createdAt: string }>(
  items: T[],
): number {
  return items.reduce((acc, w) => acc + (isToday(w.createdAt) ? 1 : 0), 0);
}

const NETWORK_COLORS: Record<string, string> = {
  tron: "red",
  bsc: "gold",
  eth: "geekblue",
  btc: "orange",
};

export function networkColor(network: string): string {
  return NETWORK_COLORS[network] ?? "default";
}

export async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const el = document.createElement("textarea");
    el.value = text;
    el.style.position = "fixed";
    el.style.opacity = "0";
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
  }
}
