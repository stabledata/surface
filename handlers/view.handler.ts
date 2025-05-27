import { Hono } from "hono";
import { SurfaceEnv } from "../surface.app.ctx";
import { isDev } from "../env";

export const ssr = new Hono<SurfaceEnv>().get("", async (c) => {
  let html = "";
  if (isDev()) {
    // ... development uses vite server
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
  } else {
    // ... production uses direct import which requires the router to read from the manifest.json.js in build
    // See the ssr.ts for implementation
    const entry = await import("../views/ssr.js");
    const res = await entry.render({
      head: ``,
      req: c.req,
      c: c,
      url: c.req.url,
      // res: c.res,
    });

    html = await res.text();

    // but... unfortunately in production we still need to bash the head a bit more in our
    // implementation, tanstack start has some good references but have yet to reconcile them
    // directly with vite + rollup on top for server side.
    // const manifest = await entry.getRouterManifest();

    // console.log("we have a manifest HERE!", JSON.stringify(manifest, null, 2));

    // TODO: This is the old way of doing it, we need to update it to use the new manifest
    // and also add the icon to the head
    // const manifest = JSON.parse(
    //   (await readFile("./build/.vite/manifest.json")).toString()
    // );
    // const headTags = [];
    // const indexManifest = manifest["index.html"];

    // headTags.push(
    //   `<script type="module" crossorigin src="/${indexManifest.file}"></script>`
    // );

    // for (const css of indexManifest.css) {
    //   headTags.push(`<link rel="stylesheet" crossorigin href="/${css}">`);
    // }

    // // TODO: icon generator could be more robust here, maybe via manifest or something nicer...
    // headTags.push(
    //   `<link rel="icon" type="image/svg+xml" href="/assets/favicon.svg" />`
    // );

    // html = html.replace("</head>", `${headTags.join("")}</head>`);
  }
  return c.html(html);
});
