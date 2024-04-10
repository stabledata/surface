import { createRouter as tanStackCreateRouter } from "@tanstack/react-router";
import { routeTree } from "./.routes.tree";

export type RouterContext = {
  foo: string;
};

export function createRouter() {
  return tanStackCreateRouter({ routeTree, context: { foo: "bar" } });
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}
