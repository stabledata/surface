import { HonoRequest } from "hono";
import {
  createRequestHandler,
  defaultStreamHandler,
} from "@tanstack/react-start/server";

import { SurfaceContext } from "../surface.app.ctx";
import { createRouter, RouterContext } from "./router";
import { registeredServerStateModules } from "../state/__registry";
import { isDev } from "../env";
import { Manifest } from "@tanstack/react-router";

/**
 * loadServerRouterContext
 * @param c SurfaceContext
 * This is the bridge between server side (SurfaceContext) and client side state (RouterContext)
 * It's called on the server when routes are being delegated to SSR (Tanstack Router).
 */
async function loadServerRouterContext(c: SurfaceContext) {
  const ssrInjectedState: Partial<RouterContext> = {};
  for (const fn of registeredServerStateModules) {
    const state = await fn(c);
    if (state !== undefined) {
      Object.assign(ssrInjectedState, state);
    }
  }
  return ssrInjectedState;
}

export async function getRouterManifest() {
  // for development environments we have to load some vite refresh runtime things
  const routerManifest: Manifest = {
    routes: {
      __root__: {
        // default root always has the favicon
        assets: [
          {
            tag: "link",
            attrs: {
              rel: "icon",
              type: "image/svg+xml",
              href: "/assets/favicon.svg",
            },
          },
        ],
      },
    },
  };

  if (isDev()) {
    // push the react refresh HRM stuff
    routerManifest.routes.__root__.assets?.push({
      tag: "script",
      attrs: {
        type: "module",
        suppressHydrationWarning: true,
        async: true,
      },
      children: `import RefreshRuntime from "/@react-refresh";
      RefreshRuntime.injectIntoGlobalHook(window)
      window.$RefreshReg$ = () => {}
      window.$RefreshSig$ = () => (type) => type
      window.__vite_plugin_react_preamble_installed__ = true;`,
    });
    // push the vite client and the view client into the manifest
    routerManifest.routes.__root__.assets?.push({
      tag: "script",
      attrs: {
        type: "module",
        src: "/@vite/client",
      },
    });
    routerManifest.routes.__root__.assets?.push({
      tag: "script",
      attrs: {
        type: "module",
        src: "/views/client.tsx",
      },
    });
  } else {
    // production, we need to import manifest.json.js from build/.vite/manifest.json.js
    // you will get a build error here until you build.
    const viteManifest = await import("../build/.vite/manifest.json");
    const indexManifest = viteManifest.default["index.html"];

    // you will get a build error here until you build.
    for (const css of indexManifest.css) {
      routerManifest.routes.__root__.assets?.push({
        tag: "link",
        attrs: {
          rel: "stylesheet",
          crossorigin: true,
          href: `/${css}`,
        },
      });
    }

    // main entry point js
    routerManifest.routes.__root__.assets?.push({
      tag: "script",
      attrs: {
        type: "module",
        crossorigin: true,
        src: `/${indexManifest.file}`,
      },
    });
  }

  return routerManifest;
}

// This is from tanstack latest docs, This used to be a bit more raw but
// now seems like it's slightly more wrapped in the react-start
// framework now, but similar principles seem to apply.
export async function render(opts: {
  url: string;
  head: string;
  req: HonoRequest;
  c: SurfaceContext;
  // res: Response; // maybe needed later?
}) {
  const { req } = opts;
  // ensure request has headers
  const url = new URL(req.url).href;
  const request = new Request(url, {
    method: req.method,
    headers: (() => {
      const headers = new Headers();
      for (const [key, value] of Object.entries(req.header)) {
        headers.set(key, value as string);
      }
      return headers;
    })(),
  });

  const ssrState = await loadServerRouterContext(opts.c);
  const manifest = await getRouterManifest();

  return createRequestHandler({
    createRouter: () => createRouter({ ...ssrState, manifest }),
    request,
    // getRouterManifest,
  })(defaultStreamHandler);
}
