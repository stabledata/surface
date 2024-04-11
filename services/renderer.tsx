import { readFile } from "node:fs/promises";
import ReactDOMServer from "react-dom/server";
import { createMemoryHistory } from "@tanstack/react-router";
import { StartServer } from "@tanstack/react-router-server/server";

import { ServiceContext } from "../surface.app";
import { createRouter } from "../surface.router";
import { getUser } from "./auth";

export async function tanstackSSR(c: ServiceContext) {
  const isProd = process.env["NODE_ENV"] === "production";
  const index = isProd ? "build/index.html" : "./index.dev.html";
  const indexContents = await readFile(index, "utf-8");
  const user = await getUser(c);
  const router = createRouter({ user });
  const memoryHistory = createMemoryHistory({
    initialEntries: [c.req.path],
  });
  router.update({
    history: memoryHistory,
    context: {
      user: await getUser(c),
    },
  });
  await router.load();

  // if we haven't found a match don't try to render anything and return
  // 404
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
