import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import {
  Outlet,
  createRootRouteWithContext,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { RouterContext } from "../router";
import { DarkModeProvider } from "@/providers/dark-mode.provider";

export const Route = createRootRouteWithContext<RouterContext>()({
  head: (ctx) => {
    // TODO: Figure out how to do this in other matches better..
    // ideally we can SSR for SEO here.
    const title =
      (ctx.loaderData as unknown as { title?: string })?.title ??
      "Surface: The best way to build your app";
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
      // title: "Surface!",
    };
  },
});

function RootComponent() {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <DarkModeProvider>
        <body>
          <div className="background-base background-gradient min-h-[100vh] w-full pb-10">
            <Outlet />
          </div>
          <TanStackRouterDevtools position="bottom-right" />
          <Scripts />
        </body>
      </DarkModeProvider>
    </html>
  );
}
