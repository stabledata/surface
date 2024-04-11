import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { DehydrateRouter } from "@tanstack/react-router-server/client";
import type { RouterContext } from "../surface.router";
import { Header } from "../views/header";
import React from "react";
import type { User } from "../services/auth";

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
  loader: ({ context }) => {
    // NOTE: this is a server pass through! since it is at the root, you
    // can use the data to render the tree via SSR

    // however -- when you navigate this becomes the client context
    // which is different and possibly lacking the data it previous had.
    // to capture this, you should set data you need in state via the
    // hydrate function in surface.router.ts and

    return context;
  },
});

export let userState: User | undefined = undefined;

export const UserCtx = React.createContext<User | undefined>(undefined);

function RootComponent() {
  const { user } = Route.useLoaderData();
  // temporary hack test stateful transition from fake hook.
  // theoretically, we could use an effect to dispatch this
  // but... the hydrate method seems most appropriate
  if (user !== undefined) {
    userState = user;
  }

  return (
    <div className="background-base background-gradient h-[100vh] w-full">
      <UserCtx.Provider value={user}>
        <Header />
        <Outlet />
      </UserCtx.Provider>
      <DehydrateRouter />
    </div>
  );
}
