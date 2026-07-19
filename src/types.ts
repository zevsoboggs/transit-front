export interface Coin {
  id: number;
  symbol: string;
}

export interface Network {
  network: string; // "tron" | "bsc" | "eth" | "btc"
  blockchain: string;
  label: string;
  usdtNet: string | null;
  native: string;
  coins: Coin[];
}

export interface Balance {
  key: string;
  shortName: string;
  amount: number;
  isUsdt: boolean;
  coin: number;
}

export interface MasterWallet {
  walletId: number;
  address: string;
  blockchain: string;
  balances: Balance[];
}

export interface Wallet {
  id: string;
  project: string | null;
  label: string | null;
  network: string;
  networkLabel: string;
  usdtNet: string | null;
  native: string;
  walletId: number;
  address: string;
  balances: Balance[];
  createdAt: string;
}

export interface CreateWalletInput {
  network: string;
  label?: string;
  project?: string;
}

export interface TopupInput {
  amount: number;
  coin?: number;
}

export interface TransferInput {
  coin: number;
  toAddress: string;
  amount: number;
}

export type LedgerType = "issue" | "topup" | "transfer" | "rename";
export type LedgerStatus = "success" | "error";

export interface LedgerEntry {
  id: number;
  ts: string;
  type: LedgerType;
  status: LedgerStatus;
  walletId: string | null;
  address: string | null;
  network: string | null;
  direction: "in" | "out" | null;
  coin: number | null;
  coinSymbol: string | null;
  amount: number | null;
  toAddress: string | null;
  detail: string | null;
  userEmail: string | null;
}
