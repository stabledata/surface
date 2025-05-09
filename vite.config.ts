// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import devServer from "@hono/vite-dev-server";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import path from "path";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 4000,
    host: "0.0.0.0",
  },
  build: {
    manifest: true,
    outDir: "build",
    minify: true,
    // sourcemap: "inline",
  },
  plugins: [
    react(),
    tailwindcss(),
    TanStackRouterVite({
      target: "react",
      routesDirectory: "./views/routes",
      generatedRouteTree: ".routes.tree.ts",
    }),
    devServer({
      entry: "surface.app.ts",
      exclude: [
        // We need to override this option since the default setting doesn't fit
        /.*\.tsx?($|\?)/,
        /.*\.(s?css|less)($|\?)/,
        /^\/@.+$/,
        /^\/favicon\.ico$/,
        /^\/(public|static)\/.+/,
        /^\/node_modules\/.*/,
      ],
      // This option is buggy, disable it and inject the code manually
      injectClientScript: false,
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./views"),
    },
  },
});
