import { Hono } from "hono";
import { SurfaceEnv } from "../surface.app.ctx";
import { isDev } from "../env";

export const ssr = new Hono<SurfaceEnv>().get("", async (c) => {
  // For vite, you have to expose a server entry now
  // const url = c.req.url;
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
      return viteServer.ssrLoadModule("/views/server.tsx");
    })();

    const res = await entry.render({
      head: "",
      req: c.req,
      c: c,
      //res: c.res,
    });

    html = await res.text();
  }

  return c.html(html);
});
