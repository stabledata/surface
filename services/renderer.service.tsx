import { readFile } from "node:fs/promises";
import ReactDOMServer from "react-dom/server";
import { createMemoryHistory } from "@tanstack/react-router";
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

  // check for dehydration errors...
  const dehydrated = router.dehydrate();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hasError = dehydrated.state.dehydratedMatches.find((r: any) => {
    // error not exposed in tanstack, TODO: consider PR/ask.
    return r.error;
  });

  if (hasError) {
    // TODO: better server error handling.
    // This is likely 403 most of the time, but loader
    // errors could occur on server as well.

    console.log(
      "ssr error (possibly intentional if for auth)",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (hasError as any).error
    );
    return c.html(indexContents, 500);
  }

  return c.html(html, 200);
}
