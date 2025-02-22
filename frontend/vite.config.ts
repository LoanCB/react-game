import react from "@vitejs/plugin-react-swc";
import fs from "fs";
import { defineConfig, loadEnv } from "vite";

// https://vitejs.dev/config/
export default ({ mode }: { mode: string }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

  return defineConfig({
    publicDir: "public",
    plugins: [
      react(),
      {
        name: "copy-locales",
        generateBundle() {
          this.emitFile({
            type: "asset",
            fileName: "locales/fr/common.json",
            source: fs.readFileSync("locales/fr/common.json"),
          });
          this.emitFile({
            type: "asset",
            fileName: "locales/fr/auth.json",
            source: fs.readFileSync("locales/fr/auth.json"),
          });
          this.emitFile({
            type: "asset",
            fileName: "locales/fr/game.json",
            source: fs.readFileSync("locales/fr/game.json"),
          });
        },
      },
    ],
    resolve: {
      alias: {
        "@src": "/src",
      },
    },
    server: {
      host: process.env.NODE_ENV === "prod" ? "0.0.0.0" : "127.0.0.1",
      port: parseInt(process.env.PORT || "5173"),
      strictPort: process.env.NODE_ENV === "prod",
    },
  });
};
