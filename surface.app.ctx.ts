import { Context } from "hono";
import { hc } from "hono/client";
import { createFactory } from "hono/factory";
import * as jwt from "hono/jwt";
import { getCookie, setCookie } from "hono/cookie";
import { CookieOptions } from "hono/utils/cookie";
import { logger } from "./logger/logger";
import { WorkOS } from "@workos-inc/node";
import { env } from "./env";
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

// works as singleton
const workos: WorkOS | undefined = undefined;
export const getWorkOS = () => {
  if (workos !== undefined) {
    return workos;
  }
  return new WorkOS(env("WORKOS_API_KEY"));
};

export type Dependencies = {
  // utils
  logger: typeof logger;
  cookies: ReturnType<typeof cookies>;
  jwt: typeof jwt;

  // auth via workos
  workos: WorkOS;

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
    c.set("jwt", injections.jwt ?? jwt);
    c.set("workos", injections.workos ?? getWorkOS());

    // For demo only, remove as this gets cooler.
    c.set(
      "memberServiceClient",
      injections.memberServiceClient ?? memberServiceClient,
    );

    // for testing only
    c.set("rpcClientMock", injections.rpcClientMock);
    await next();
  });
