import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import {
  Outlet,
  createRootRouteWithContext,
  HeadContent,
  Scripts,
  Manifest,
} from "@tanstack/react-router";
import { RouterContext } from "../router";
import { RootContextProvider } from "@/providers/root-context-provider";
import { useAppState } from "@/hooks/use-app-state";
import { NotFound } from "@/error";

export const Route = createRootRouteWithContext<RouterContext>()({
  head: (ctx) => {
    // This is gnar-bar but createRequestHandler is more start vs router so we pass through
    // the same way we do for all the other data and the head gets the context and voila
    const loaderData = ctx.loaderData as unknown as { manifest: Manifest };
    const assets = loaderData.manifest.routes.__root__?.assets ?? [];
    const links = assets
      .filter((asset) => asset.tag === "link")
      .map((link) => ({
        rel: link.attrs?.rel,
        href: link.attrs?.href,
      }));

    // console.log(
    //   "loaderData with manifest links???",
    //   JSON.stringify(assets, null, 2),
    //   JSON.stringify(links, null, 2)
    // );
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
      links: links,
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
