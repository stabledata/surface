import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { DehydrateRouter } from "@tanstack/react-router-server/client";
import type { RouterContext } from "../surface.router";
import { Header } from "../views/header";
import { RootSSRLoaderContextProvider } from "../views/providers/ssr-loader-context-provider";

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
  loader: ({ context }) => {
    // usually, "hydration" through the router suffices for SPA type
    // needs (reducing server round trips for auth, user data, etc.

    // but sometimes you may _need_ to render markup on the server for
    // SEO. For that, we pass this context through to a provider so
    // that hooks which need to pick it up can do so.

    // BIG CAVEAT: the provider will ONLY hold state
    // approach would be to load your global state here, but we are
    // doing this via the surface.router and state.registry

    // generally speaking - TS router loaders should be considered
    // "client side only"
    return context;
  },
});

function RootComponent() {
  const loaderData = Route.useLoaderData();
  return (
    <RootSSRLoaderContextProvider value={loaderData}>
      <div className="background-base background-gradient h-[100vh] w-full">
        <Header />
        <Outlet />
        <DehydrateRouter />
      </div>
    </RootSSRLoaderContextProvider>
  );
}
