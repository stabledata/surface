import { readFile } from "node:fs/promises";
import ReactDOMServer from "react-dom/server";
import { createMemoryHistory } from "@tanstack/react-router";
import { StartServer } from "@tanstack/react-router-server/server";
import {
  applyContext,
  createHandlers,
  Dependencies,
  SurfaceContext,
} from "../surface.app.ctx";
import { loadState } from "../state/registry";
import { hc } from "hono/client";
import { AppType } from "../surface.app";
import { createRouter } from "../surface.router";
import { Hono } from "hono";

async function render(c: SurfaceContext) {
  // the server needs its own instance of rpc client because it's
  // calling itself over the network. this also means it needs to pass
  // credentials because there is no cookie in that request.
  // an isomorphic loader concept could avoid this, but the added
  // complexity vastly outweighs any latency benefit (for now).
  const rpcClient = hc<AppType>(process.env.SELF_RPC_HOST ?? "", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${c.var.cookies?.get("user_id")}`,
    },
  });

  // load state modules which define a load method
  const data = await loadState(c);
  const context = {
    ...data,
    // note for SSR testing, we allow injection of a mock client.
    rpc: (c.var.rpcClientMock as unknown as typeof rpcClient) ?? rpcClient,
  };
  const router = createRouter(context);
  const memoryHistory = createMemoryHistory({ initialEntries: [c.req.path] });
  router.update({ history: memoryHistory });
  await router.load();

  // grab the index html
  const indexFilePath =
    process.env["NODE_ENV"] === "production"
      ? "build/index.html"
      : "./index.dev.html";
  const indexContents = await readFile(indexFilePath, "utf-8");

  const dehydratedSSRContent = ReactDOMServer.renderToString(
    <StartServer router={router} />
  );

  // inject the app into the root for hydration on client
  const html = indexContents.replace(
    "<!--ssr-injection-->",
    dehydratedSSRContent
  );

  // someday, it could be nice to handle additional error states here,
  // at least returning 500 and logging for o11y if a loader throws an error.
  const status = router.hasNotFoundMatch() ? 404 : 200;
  return c.html(html, status);
}

export const viewRouteHandler = (injections: Partial<Dependencies> = {}) => {
  return new Hono().get(
    "",
    ...createHandlers(applyContext(injections), render)
  );
};
