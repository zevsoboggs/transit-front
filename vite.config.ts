import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// The API key is read from the server-side environment (.env) and injected into
// proxied requests here — it never ends up in the client bundle.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  // In dev, the frontend calls /api and Vite proxies to our own backend
  // (which owns the DB, auth, and the upstream transit-api key).
  const backend = env.BACKEND_ORIGIN || "http://localhost:3001";

  return {
    plugins: [react()],
    server: {
      port: 5173,
      host: true,
      proxy: {
        "/api": {
          target: backend,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    build: {
      outDir: "dist",
      sourcemap: false,
    },
  };
});
