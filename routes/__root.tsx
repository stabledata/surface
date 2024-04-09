import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { DehydrateRouter } from "@tanstack/react-router-server/client";
import { RouterContext } from "../router";
import { Header } from "../views/header";

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
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
