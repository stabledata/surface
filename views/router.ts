import {
  AnyRouter,
  Manifest,
  createRouter as tanStackCreateRouter,
} from "@tanstack/react-router";
import { routeTree } from "../.routes.tree";
import { registeredClientStateModules } from "../state/__registry";
import { rpcClient } from "./client";

export interface RouterContext {
  rpc?: typeof rpcClient;
  manifest?: Manifest;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}

export function createRouter(injections?: Partial<RouterContext>): AnyRouter {
  const router = tanStackCreateRouter({
    routeTree,
    context: {
      ...injections,
    },
    dehydrate: (): RouterContext => {
      // async state need to be dehydrated from method above
      // easier to just handle it all there
      return {
        ...injections,
      };
    },
    hydrate: (context) => {
      // pulls from the hydration registry and invokes the
      // functions registered there.
      for (const fn of registeredClientStateModules) {
        void fn(context);
      }
    },
  });

  return router;
}
