import { createRouter as tanStackCreateRouter } from "@tanstack/react-router";
import { routeTree } from "./.routes.tree";
import { User } from "./services/auth";
import { useUserStore } from "./state/user.state";

export type RouterContext = {
  user?: User;
};

export function createRouter(injections?: Partial<RouterContext>) {
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
      // everything passed down from the server context via dehydrate (injection)
      // can now be used to hydrate client state
      useUserStore.setState({ user: context.user });
    },
  });
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}
export { useUserStore };
