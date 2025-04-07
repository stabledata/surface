import {
  createRequestHandler,
  defaultStreamHandler,
} from "@tanstack/react-start/server";
import { createRouter } from "../surface.router";
import { HonoRequest } from "hono";

// This is from tanstack latest docs, This used to be a bit more raw but
// now seems like it's slightly more wrapped in the react-start
// framework
export function render(opts: {
  url: string;
  head: string;
  req: HonoRequest;
  res: Response;
}) {
  const { req } = opts;
  // ensure request has headers
  const url = new URL(req.url, "https://localhost:3000").href;
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

  return createRequestHandler({
    createRouter,
    request,
  })(defaultStreamHandler);
}
