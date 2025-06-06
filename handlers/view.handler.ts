import { Hono } from "hono";
import { SurfaceEnv } from "../surface.app.ctx";
import { isDev } from "../env";

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
      <script type="module">
        import RefreshRuntime from "/@react-refresh"
        RefreshRuntime.injectIntoGlobalHook(window)
        window.$RefreshReg$ = () => {}
        window.$RefreshSig$ = () => (type) => type
        window.__vite_plugin_react_preamble_installed__ = true
      </script>
      <script type="module" src="/@vite/client"></script>
      <script type="module" src="/views/client.tsx"></script>
      <link rel="icon" type="image/svg+xml" href="/assets/favicon.svg" />
      
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
    // This will produce an error (not resolved) until you build locally
    const manifest = await import("../build/.vite/manifest.json");
    const headTags = [];
    const indexManifest = manifest.default["index.html"];

    headTags.push(
      `<script type="module" crossorigin src="/${indexManifest.file}"></script>`
    );

    for (const css of indexManifest.css) {
      headTags.push(`<link rel="stylesheet" crossorigin href="/${css}">`);
    }

    // TODO: icon generator could be more robust here, maybe via manifest or something nicer...
    headTags.push(
      `<link rel="icon" type="image/svg+xml" href="/assets/favicon.svg" />`
    );

    html = html.replace("</head>", `${headTags.join("")}</head>`);
  }
  return c.html(html);
});
