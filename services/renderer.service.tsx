import { readFile } from "node:fs/promises";
import ReactDOMServer from "react-dom/server";
import { createMemoryHistory } from "@tanstack/react-router";
import { StartServer } from "@tanstack/react-router-server/server";
import { ServiceContext } from "../surface.app.ctx";
import { loadState } from "../state/registry";
import { hc } from "hono/client";
import { AppType } from "../surface.app";
import { createRouter } from "../surface.router";

// FIXME: this is a temporary typing for tantack redirect throws
type TsThrownRedirectError = {
  isRedirect: boolean;
  to: string;
  statusCode: number;
};

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
  const router = createRouter({ ...data, rpc: rpcClient });
  const memoryHistory = createMemoryHistory({ initialEntries: [c.req.path] });
  router.update({ history: memoryHistory, context: { rpc: rpcClient } });
  await router.load();

  // just return the index with a 404 header
  if (router.hasNotFoundMatch()) {
    return c.html(indexContents, 404);
  }

  const dehydratedSSRContent = ReactDOMServer.renderToString(
    // TODO: I guess file an issue for this, this wants an isServer boolean.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <StartServer<any> router={router} />
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
    // TODO: refine this a bit more. if we throw a redirect from
    // tanstack, this is somewhat more predictable and we can redirect
    // from the top layer in the event of direct request...
    // but, doesn't seem like a clean way to grab this information currently
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const error = (hasError as any).error?.data?.data as TsThrownRedirectError;
    if (error.isRedirect) {
      c.logger.log(
        "ssr redirected via tanstack redirect",
        error.to,
        error.statusCode
      );
      return c.redirect(error.to);
    }

    c.logger.error(
      "unknown ssr error thrown",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      error
    );
    return c.html(indexContents, 500);
  }

  return c.html(html, 200);
}
