import { Hono } from "hono";
import { SurfaceEnv } from "../surface.app.ctx";
import { isDev } from "../env";
import { readFile } from "node:fs/promises";

export const ssr = new Hono<SurfaceEnv>().get("", async (c) => {
  let html = "";
  if (isDev()) {
    const vite = await import("vite");
    const viteServer = await vite.createServer({
      root: process.cwd(),
      server: {
        middlewareMode: true,
        hmr: {
          port: 4100,
        },
      },
    });

    const entry = await (async () => {
      return viteServer.ssrLoadModule("/views/ssr.ts");
    })();

    const res = await entry.render({
      head: "",
      req: c.req,
      c: c,
      // res: c.res,
    });

    html = await res.text();

    const devHeaders = `
      <script src="https://cdn.tailwindcss.com"></script>
      <script type="module">
        import RefreshRuntime from "/@react-refresh"
        RefreshRuntime.injectIntoGlobalHook(window)
        window.$RefreshReg$ = () => {}
        window.$RefreshSig$ = () => (type) => type
        window.__vite_plugin_react_preamble_installed__ = true
      </script>
      <script type="module" src="/@vite/client"></script>
      <script type="module" src="/views/client.tsx"></script>
    `;

    html = html.replace("</head>", `${devHeaders}</head>`);
  } else {
    const entry = await import("../views/ssr.js");
    const res = await entry.render({
      head: "",
      req: c.req,
      c: c,
      url: c.req.url,
      // res: c.res,
    });

    html = await res.text();
    const manifest = JSON.parse(
      (await readFile("./build/.vite/manifest.json")).toString()
    );
    const headTags = [];
    const indexManifest = manifest["index.html"];

    headTags.push(
      `<script type="module" crossorigin src="/${indexManifest.file}"></script>`
    );

    for (const css of indexManifest.css) {
      headTags.push(`<link rel="stylesheet" crossorigin href="/${css}">`);
    }

    html = html.replace("</head>", `${headTags.join("")}</head>`);
  }

  // We used to be able to do this which was a touch cleaner
  // but results now in client hydration errors.
  // const indexFilePath =
  //   process.env["NODE_ENV"] === "production"
  //     ? "build/index.html"
  //     : "./index.dev.html";
  // const indexContents = await readFile(indexFilePath, "utf-8");

  return c.html(html);
});
