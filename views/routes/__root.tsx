import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import {
  Outlet,
  createRootRouteWithContext,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { RouterContext } from "../../surface.router";
import { Header } from "../header";

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
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
    scripts: [
      {
        src: "https://cdn.tailwindcss.com",
      },
      {
        type: "module",
        children: `import RefreshRuntime from "/@react-refresh"
  RefreshRuntime.injectIntoGlobalHook(window)
  window.$RefreshReg$ = () => {}
  window.$RefreshSig$ = () => (type) => type
  window.__vite_plugin_react_preamble_installed__ = true`,
      },
      {
        type: "module",
        src: "/@vite/client",
      },
      {
        type: "module",
        src: "/views/client.tsx",
      },
    ],
  }),
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
