import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { DehydrateRouter } from "@tanstack/react-router-server/client";
import type { RouterContext } from "../surface.router";
import { Header } from "../views/header";

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
  loader: () => {
    return {
      // foo: "bar",
    };
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
