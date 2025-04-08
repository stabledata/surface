import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import {
  Outlet,
  createRootRouteWithContext,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { RouterContext } from "../router";
import { Header } from "../header";

const header = () => {
  // TODO: Using the rendering context we can probably update the title if we want which matters for SSR / SEO
  return {
    meta: [
      {
        title: "Surface",
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
};

export const Route = createRootRouteWithContext<RouterContext>()({
  head: header,
  component: RootComponent,
  loader: async () => {
    // root loader
    return {
      foo: "bar",
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
