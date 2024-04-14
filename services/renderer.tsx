import { readFile } from "node:fs/promises";
import ReactDOMServer from "react-dom/server";
import { createMemoryHistory } from "@tanstack/react-router";
import { StartServer } from "@tanstack/react-router-server/server";
import { ServiceContext } from "../surface.app";
import { createRouter } from "../surface.router";
import { loadState } from "../state/registry";

export async function render(c: ServiceContext) {
  // get index.html
  const isProd = process.env["NODE_ENV"] === "production";
  const index = isProd ? "build/index.html" : "./index.dev.html";
  const indexContents = await readFile(index, "utf-8");

  // load state modules that define a load method
  // and inject them into the router
  const data = await loadState(c);
  const router = createRouter({ ...data });
  const memoryHistory = createMemoryHistory({ initialEntries: [c.req.path] });
  router.update({ history: memoryHistory });
  await router.load();

  // if we haven't found a match...
  // don't try to render anything and return 404
  if (router.hasNotFoundMatch()) {
    return c.text("Not found", 404);
  }

  const dehydratedSSRContent = ReactDOMServer.renderToString(
    <StartServer router={router} />
  );

  const html = indexContents.replace(
    "<!--ssr-injection-->",
    dehydratedSSRContent
  );

  return c.html(html, 200);
}
