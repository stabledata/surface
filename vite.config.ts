// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import devServer from "@hono/vite-dev-server";
import { TanStackRouterVite } from "@tanstack/router-vite-plugin";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 4000,
  },
  build: {
    outDir: "build",
  },
  plugins: [
    react(),
    TanStackRouterVite({
      routesDirectory: "./routes",
      generatedRouteTree: "routes.tree.ts",
    }),
    devServer({
      entry: "server.ts",
      exclude: [
        // We need to override this option since the default setting doesn't fit
        /.*\.tsx?($|\?)/,
        /.*\.(s?css|less)($|\?)/,
        /.*\.(svg|png)($|\?)/,
        /^\/@.+$/,
        /^\/favicon\.ico$/,
        /^\/(public|assets|static)\/.+/,
        /^\/node_modules\/.*/,
      ],
      injectClientScript: false, // This option is buggy, disable it and inject the code manually
    }),
  ],
});
