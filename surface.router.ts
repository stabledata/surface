import { createRouter as tanStackCreateRouter } from "@tanstack/react-router";
import { routeTree } from "./.routes.tree";
import { ServiceContext } from "./surface.app.ctx";
import { User } from "./services/auth";
import { inflateState } from "./state/registry";
import { hc } from "hono/client";
import { AppType } from "./surface.app";

// rpc client with full host name is "isomorphic"
// so we can inject it in the RouterContext vs service context.
// but using it on the server results in a network round trip vs
// using server context.
const rpcHost =
  typeof process !== "undefined"
    ? process.env.SELF_RPC_HOST
    : import.meta.env.SELF_RPC_HOST;
const rpcClient = hc<AppType>(rpcHost ?? "/", {
  headers: {
    "Content-Type": "application/json",
  },
});

export type RouterContext = {
  serviceContext?: ServiceContext;
  user?: User;
  rpc?: typeof rpcClient;
};

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}

export function createRouter(injections?: RouterContext) {
  const router = tanStackCreateRouter({
    routeTree,
    context: {
      ...injections,
      rpc: rpcClient,
    },
    dehydrate: (): RouterContext => {
      // async state need to be dehydrated from method above
      // easier to just handle it all there
      return {
        ...injections,
      };
    },
    hydrate: (context) => {
      // inflate state from the state.registry.
      // note that loaders and beforeLoaders also receive context,
      // but you'll have to add it to context/state manually or else
      // it may not be there, unless you use RPC round trip (self request)
      inflateState(context);
    },
  });

  return router;
}
