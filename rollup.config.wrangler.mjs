import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import image from "@rollup/plugin-image";
import json from "@rollup/plugin-json";

// Use the already-built ESM as input
export default {
  input: "dist/surface.server.node.js",
  output: {
    file: "dist/surface.worker.bundle.js",
    format: "es",
    sourcemap: true,
  },
  plugins: [
    resolve({
      browser: true,
      preferBuiltins: false,
    }),
    json(),
    commonjs(),
    image(),
  ],
};
