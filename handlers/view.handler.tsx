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
      return viteServer.ssrLoadModule("/views/server.ts");
    })();

    const res = await entry.render({
      head: "",
      req: c.req,
      c: c,
      //res: c.res,
    });

    html = await res.text();
  } else {
    const entry = await import("../views/server.js");
    const res = await entry.render({
      head: "",
      req: c.req,
      c: c,
      url: c.req.url,
      // res: c.res,
    });

    html = await res.text();
    const manifest = await import("../build/.vite/manifest.json");
    console.log("got manifest!", manifest);
    console.log("ideally, we inject it into here:", html);
    // TODO: for prod, we have to manually inject the manifest assets into the html.
  }

  // We used to be able to do this which was nice cause there are zero instructions how to
  // make this work in production in the docs now.
  // const indexFilePath =
  //   process.env["NODE_ENV"] === "production"
  //     ? "build/index.html"
  //     : "./index.dev.html";
  // const indexContents = await readFile(indexFilePath, "utf-8");

  return c.html(html);
});
