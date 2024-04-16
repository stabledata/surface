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
  const isProd = process.env["NODE_ENV"] === "production";
  const index = isProd ? "build/index.html" : "./index.dev.html";
  const indexContents = await readFile(index, "utf-8");

  // the serer needs its own instance of rpc client because it's basically
  // going to call itself over HTTP. further, it needs to pass credentials
  // because there is no cookie in that request.
  const rpcClient = hc<AppType>(process.env.SELF_RPC_HOST ?? "", {
    headers: {
      "Content-Type": "application/json",
      // TODO: have to pass a bearer token here.
      // might as well just get out the jwt tooling now but to close loop for commit..
      Authorization: `Bearer ${c.cookies?.get("user_id")}`,
    },
  });

  // load state modules that define a load method
  // and inject them into the router
  const data = await loadState(c);
  const router = createRouter({ ...data, rpc: rpcClient });
  const memoryHistory = createMemoryHistory({ initialEntries: [c.req.path] });
  router.update({ history: memoryHistory, context: { rpc: rpcClient } });
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
    // The best we could likely do here is to match on the "name"
    // and map a code to make it more friendly.

    console.log(
      "ssr rendering error thrown (possibly intentional if for auth)",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (hasError as any).error
    );
    return c.html(indexContents, 500);
  }

  return c.html(html, 200);
}
