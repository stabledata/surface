import { createRouter as tanStackCreateRouter } from "@tanstack/react-router";
import { routeTree } from "./.routes.tree";
import { ServiceContext } from "./surface.app";
import { User } from "./services/auth";
import { inflateState } from "./state/registry";

export type RouterContext = {
  serviceContext?: ServiceContext;
  user?: User;
  foo?: string;
};

export function createRouter(dehydratedState?: RouterContext) {
  const router = tanStackCreateRouter({
    routeTree,
    context: {
      ...dehydratedState,
    },
    dehydrate: (): RouterContext => {
      // async state need to be dehydrated from method above
      // easier to just handle it all there
      return {
        ...dehydratedState,
      };
    },
    hydrate: (context) => {
      // inflate state from the state.registry.
      // now... loaders and beforeLoaders also receive context
      // however this will always get run on the client whereas
      // loaders may run on the server OR the client depending
      inflateState(context);
    },
  });

  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}
