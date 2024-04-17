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

  // the serer needs its own instance of rpc client because it's
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

  console.log("hasError", JSON.stringify(hasError));

  if (hasError) {
    // TODO: refine this a bit more. if we throw a redirect from
    // tanstack we can redirect at the server which seems desireable...
    // but DehydratedRouteMatch only picks a few RouteMatch props
    // and error is not one of them, I don't really want to deal with suspense
    // on the server, there are enough folks complaining about this in Next now,
    // for good reason.
    // will create an issue later on w TS router on this one
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const error = (hasError as any).error?.data?.data;
    if (error && error.isRedirect) {
      c.logger.log(
        "ssr redirected via tanstack redirect",
        error.to,
        error.statusCode
      );
      return c.redirect(error.to);
    }

    c.logger.error(`unknown ssr error thrown ${JSON.stringify(error)}`);
    return c.html(indexContents, 500);
  }

  const status = router.hasNotFoundMatch() ? 404 : 200;
  return c.html(html, status);
}
