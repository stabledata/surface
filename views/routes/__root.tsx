import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import {
  Outlet,
  createRootRouteWithContext,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { RouterContext } from "../router";
import { Header } from "../header";

export const Route = createRootRouteWithContext<RouterContext>()({
  head: (ctx) => {
    // TODO: Figure out how to do this in other matches better.
    const title =
      ctx.loaderData?.title ?? "Surface: The best start to build your app";
    return {
      meta: [
        {
          title,
        },
        {
          charSet: "UTF-8",
        },
        {
          name: "viewport",
          content: "width=device-width, initial-scale=1.0",
        },
      ],
    };
  },
  component: RootComponent,
  loader: async ({ context }) => {
    return {
      ...context,
      foo: "bar",
      title: "Surface!",
    };
  },
});

function RootComponent() {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <div className="background-base background-gradient min-h-[100vh] w-full pb-10">
          <Header />
          <Outlet />
        </div>
        <TanStackRouterDevtools position="bottom-right" />
        <Scripts />
      </body>
    </html>
  );
}
