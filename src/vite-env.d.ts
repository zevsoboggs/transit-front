/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE?: string;
  readonly VITE_DAILY_WALLET_LIMIT?: string;
  readonly VITE_TRANSIT_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
