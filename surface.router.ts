import { createRouter as tanStackCreateRouter } from "@tanstack/react-router";
import { routeTree } from "./.routes.tree";
import { User } from "./services/auth";
// import { ServiceContext } from "./surface.app";

export type RouterContext = {
  // this gets injected server side so page loaders can access services... but what if they can't....
  // serverContext?: ServiceContext;
  // probably do TRPC or something like that here as well, or hono's built in RPC
  user?: User;
};

export function createRouter(injections: Partial<RouterContext>) {
  return tanStackCreateRouter({
    routeTree,
    context: {
      ...injections,
    },
    dehydrate: () => {
      return {
        ...injections,
      };
    },
    hydrate: (context) => {
      console.log("neat! we can put things in state here", context);
    },
  });
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}
