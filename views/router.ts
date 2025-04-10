import {
  AnyRouter,
  createRouter as tanStackCreateRouter,
} from "@tanstack/react-router";
import { routeTree } from "../.routes.tree";
import {
  registeredClientStateModules,
  registerHydrator,
} from "../state/__registry";
import { rpcClient } from "./client";
import { logger } from "../logger/logger";
import { useRootStore } from "../state/root.store";

export interface RouterContext {
  rpc?: typeof rpcClient;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}

registerHydrator((context: RouterContext) => {
  const { user } = context;
  if (user) {
    logger.debug("hydrating user client side:", user);
    useRootStore.setState({ user });
  }
});

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
