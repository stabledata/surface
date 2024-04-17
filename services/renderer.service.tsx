import { readFile } from "node:fs/promises";
import ReactDOMServer from "react-dom/server";
import { createMemoryHistory } from "@tanstack/react-router";
import { StartServer } from "@tanstack/react-router-server/server";
import { ServiceContext } from "../surface.app.ctx";
import { loadState } from "../state/registry";
import { hc } from "hono/client";
import { AppType } from "../surface.app";
import { createRouter } from "../surface.router";

export async function render(c: ServiceContext) {
  // get index.html
  console.log("damn", process.env.NODE_ENV);
  const isProd = process.env["NODE_ENV"] === "production";
  const index = isProd ? "build/index.html" : "./index.dev.html";
  const indexContents = await readFile(index, "utf-8");

  // the server needs its own instance of rpc client because it's
  // basically going to call itself over HTTP. further, it needs to pass
  // credentials because there is no cookie in that request.
  const rpcClient = hc<AppType>(process.env.SELF_RPC_HOST ?? "", {
    headers: {
      "Content-Type": "application/json",
      // have to pass a bearer token here, because the server is calling itself
      // thus far, no framework seems to get around this either?
      // an isomorphic loader is a possibility of course but
      // the simplicity of a single workload feels better for now.
      Authorization: `Bearer ${c.cookies?.get("user_id")}`,
    },
  });

  // load state modules that define a load method and inject them into
  // the router
  const data = await loadState(c);
  const context = { ...data, rpc: rpcClient, serviceContext: c };
  const router = createRouter(context);
  const memoryHistory = createMemoryHistory({ initialEntries: [c.req.path] });
  router.update({ history: memoryHistory, context });
  await router.load();

  // just return the index with a 404 header
  if (router.hasNotFoundMatch()) {
    return c.html(indexContents, 404);
  }

  const dehydratedSSRContent = ReactDOMServer.renderToString(
    <StartServer router={router} />
  );

  const html = indexContents.replace(
    "<!--ssr-injection-->",
    dehydratedSSRContent
  );
  console.log("ABSOLUTELY BRUTAL WHEN THINGS JUST DONT WORK.", html);

  return c.html(html);
}
