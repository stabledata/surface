import { HonoRequest } from "hono";
import {
  createRequestHandler,
  defaultStreamHandler,
} from "@tanstack/react-start/server";
import { SurfaceContext } from "../surface.app.ctx";
import { createRouter, RouterContext } from "./router";
import { registeredServerStateModules } from "../state/__registry";
import { Api } from "surface.app";
import { hc } from "hono/client";

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
  const rpcClient = hc<Api>(`${process.env.SELF_RPC_HOST}/`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${opts.c.var.cookies.get("session")}`,
    },
  });

  return createRequestHandler({
    createRouter: () => createRouter({ ...ssrState, rpc: rpcClient }),
    request,
    // TODO: Maybe this is a cleaner approach than
    // head tag bashing in handlers/view.handler.tsx
    // getRouterManifest: () => ...
  })(defaultStreamHandler);
}
