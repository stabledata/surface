import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { DehydrateRouter } from "@tanstack/react-router-server/client";
import type { RouterContext } from "../surface.router";
import { Header } from "../views/header";

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
  loader: ({ context }) => {
    // NOTE: this is a server pass through!
    // since it is at the root, we
    // can use the data to render the tree via SSR

    // however -- when you navigate this becomes the client context
    // which is different lacking the data it had on the server.
    // to capture this, you should set data you need in state via the
    // hydrate function in surface.router.ts and
    return context;
  },
});

function RootComponent() {
  return (
    <div className="background-base background-gradient h-[100vh] w-full">
      <Header />
      <Outlet />

      <DehydrateRouter />
    </div>
  );
}
