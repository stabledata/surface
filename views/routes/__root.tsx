import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import {
  Outlet,
  createRootRouteWithContext,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { RouterContext } from "../router";
import { RootContextProvider } from "@/providers/root-context-provider";
import { useAppState } from "@/hooks/use-app-state";
import { NotFound } from "@/error";

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => {
    return {
      meta: [
        {
          title: "Surface: A backend for Vite clients with built-in auth",
          description:
            "Surface is a backend for Vite clients with built-in auth",
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
  notFoundComponent: NotFound,
  loader: async ({ context }) => {
    return {
      ...context,
      foo: "bar",
    };
  },
});

function RootComponent() {
  const ctx = Route.useLoaderData();
  const { isDarkMode } = useAppState();

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <RootContextProvider ctx={ctx}>
        <body className={isDarkMode ? "dark" : ""}>
          <div className="background-base background-gradient min-h-[100vh] w-full pb-10">
            <Outlet />
          </div>
          <TanStackRouterDevtools position="bottom-right" />
          <Scripts />
        </body>
      </RootContextProvider>
    </html>
  );
}
