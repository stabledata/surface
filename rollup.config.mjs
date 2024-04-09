// used by nodejs build only
import ignoreImport from "rollup-plugin-ignore-import";
import { glob } from "glob";
import { extname, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { builtinModules } from "node:module";
import typescript from "@rollup/plugin-typescript";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import image from "@rollup/plugin-image";

export default {
  input: Object.fromEntries(
    glob
      .sync(["surface.server.node.ts"], {
        ignore: ["**/*.d.ts", "**/*.test.ts"],
      })
      .map((file) => [
        file.slice(0, file.length - extname(file).length),
        fileURLToPath(new URL(file, import.meta.url)),
      ])
  ),
  output: {
    dir: "dist",
    format: "esm",
    sourcemap: true,
    preserveModules: true,
    preserveModulesRoot: ".",
  },
  external(id) {
    return id.includes(sep + "node_modules" + sep);
  },
  plugins: [
    typescript({ moduleResolution: "bundler" }),
    resolve({ preferBuiltins: true }),
    commonjs({ ignoreDynamicRequires: true, ignore: builtinModules }),
    image(),
    ignoreImport({
      // Ignore all .scss and .css file imports while building the bundle
      extensions: [".css"],
      // Optional: replace body for ignored files. Default value is "export default undefined;"
      body: "export default undefined;",
    }),
  ],
};
