import { readFile } from "node:fs/promises";
import ReactDOMServer from "react-dom/server";
import { createMemoryHistory, Redirect } from "@tanstack/react-router";
import { StartServer } from "@tanstack/react-router-server/server";
import { ServiceContext } from "../surface.app.ctx";
import { loadState } from "../state/registry";

export async function render(c: ServiceContext) {
  // get index.html
  const isProd = process.env["NODE_ENV"] === "production";
  const index = isProd ? "build/index.html" : "./index.dev.html";
  const indexContents = await readFile(index, "utf-8");

  // load state modules that define a load method
  // and inject them into the router

  const data = await loadState(c);
  const router = c.router(data, c);
  const memoryHistory = createMemoryHistory({ initialEntries: [c.req.path] });
  router.update({ history: memoryHistory });
  try {
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

    return c.html(html, 200);
  } catch (e: unknown) {
    c.logger.log(`Assumed 403 on path that threw redirect: ${c.req.path}`);
    return c.html(indexContents, 403);
  }
}
