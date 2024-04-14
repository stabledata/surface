import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { DehydrateRouter } from "@tanstack/react-router-server/client";
import type { RouterContext } from "../surface.router";
import { Header } from "../views/header";

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
  loader: ({ context }) => {
    // usually, "hydration" through the router suffices for SPA type
    // needs (reducing server round trips for auth, user data, etc.

    // but sometimes you may _need_ to render markup on the server for
    // SEO. wherever it's needed, you can import this Route and use
    // RootRoute.useLoaderData() to fet the context returned here from
    // the server and use that value instead of global client state see:
    // views/hooks/use-root-ssr-ctx.ts for an example

    // NOTE - this return will no longer hold loader state another
    // approach would be to load your global state here, but we are
    // doing this via the surface.router and state.registry

    // generally speaking - TS router loaders should be considered
    // "client side only"
    return context;
  },
});

function RootComponent() {
  // const d = Route.useLoaderData();

  return (
    <div className="background-base background-gradient h-[100vh] w-full">
      <Header />
      <Outlet />
      <DehydrateRouter />
    </div>
  );
}
