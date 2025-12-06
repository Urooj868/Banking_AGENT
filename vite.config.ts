import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  return {
    server: {
      port: 3000,
      host: "0.0.0.0",
      proxy: {
        "/api/llama": {
          target: env.LLAMA_CPP_URL || "http://localhost:8000",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/llama/, ""),
        },
      },
    },
    plugins: [react()],
    define: {
      "process.env.LLAMA_CPP_URL": JSON.stringify(
        env.LLAMA_CPP_URL || "http://localhost:8000"
      ),
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
      },
    },
  };
});
