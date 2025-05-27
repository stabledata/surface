import { Context } from "hono";
import { hc } from "hono/client";
import { createFactory } from "hono/factory";
import * as jwt from "hono/jwt";
import { getCookie, setCookie } from "hono/cookie";
import { CookieOptions } from "hono/utils/cookie";
import { logger } from "./logger/logger";

import { memberServiceClient } from "./service/members/member.service.client";

/**
 * This is a wrapper around the hono cookie utils to make them easier to use in the context
 * of surface.
 * @param c - The context of the request
 * @returns An object with get and set methods for cookies
 */
export function cookies(c: SurfaceContext) {
  const get = (name: string) => {
    return getCookie(c, name);
  };

  const set = (name: string, value: string, opt?: CookieOptions) => {
    return setCookie(c, name, value, opt);
  };

  return { get, set };
}

export type Dependencies = {
  // utils
  logger: typeof logger;
  cookies: ReturnType<typeof cookies>;
  jwt: typeof jwt;

  // specifically for testing, allows overwriting the rpc client
  rpcClientMock?: typeof hc;

  // "services" injection
  memberServiceClient: typeof memberServiceClient;
};

export type SurfaceEnv = {
  Variables: Dependencies;
};

export type SurfaceContext = Context<SurfaceEnv>;

export const { createMiddleware, createHandlers } = createFactory<SurfaceEnv>();

export const applyContext = (injections: Partial<Dependencies>) =>
  createMiddleware(async (c, next) => {
    c.set("logger", injections.logger ?? logger);
    c.set("cookies", injections.cookies ?? cookies(c));
    c.set("jwt", jwt);
    c.set(
      "memberServiceClient",
      injections.memberServiceClient ?? memberServiceClient
    );
    c.set("rpcClientMock", injections.rpcClientMock);
    await next();
  });
