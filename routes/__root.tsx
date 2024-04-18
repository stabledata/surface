import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { DehydrateRouter } from "@tanstack/react-router-server/client";
import type { RouterContext } from "../surface.router";
import { Header } from "../views/header";
import { RootSSRLoaderContextProvider } from "../views/providers/ssr-loader-context-provider";

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
  notFoundComponent: () => <>Root Not Found</>,
  errorComponent: () => <>Root Error</>,
  loader: ({ context }) => {
    // usually, "hydration" through the router using state modules
    // suffices for SPA type needs (reducing server round trips for
    // auth, user data, etc.)

    // but... sometimes you may _need_ to render markup on the server
    // for SEO. For that, we pass this context through to a provider so
    // hooks can get that sweet SEO markup on the server

    // Note however, the loaderData will ONLY hold this state on the
    // first request. when you navigate on the client, loaderData is
    // empty. surface solves for this state modules and the router.
    return context;
  },
});

function RootComponent() {
  const loaderData = Route.useLoaderData();
  return (
    <RootSSRLoaderContextProvider value={loaderData}>
      <div className="background-base background-gradient min-h-[100vh] w-full pb-10">
        <Header />
        <Outlet />
        <DehydrateRouter />
      </div>
    </RootSSRLoaderContextProvider>
  );
}
