import { readFile } from "node:fs/promises";
import ReactDOMServer from "react-dom/server";
import { createMemoryHistory } from "@tanstack/react-router";
import { StartServer } from "@tanstack/react-router-server/server";

import { ServiceContext } from "../surface.app";
import { createRouter } from "../router";

export async function tanstackSSR(c: ServiceContext) {
  const isProd = process.env["NODE_ENV"] === "production";
  const index = isProd ? "build/index.html" : "./index.dev.html";
  const indexContents = await readFile(index, "utf-8");
  const router = createRouter();
  const memoryHistory = createMemoryHistory({
    initialEntries: [c.req.path],
  });
  router.update({
    history: memoryHistory,
    context: {
      // TODO - make cookies a helper to avoid
      foo: c.cookies?.get("foo") || "no cookie",
    },
  });
  await router.load();
  const dehydratedSSRContent = ReactDOMServer.renderToString(
    <StartServer router={router} />
  );

  const html = indexContents.replace(
    "<!--ssr-injection-->",
    dehydratedSSRContent
  );
  // const html = dehydratedSSRContent;
  const statusCode = router.hasNotFoundMatch() ? 404 : 200;
  return c.html(html, statusCode);
}
