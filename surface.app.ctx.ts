import { hc } from "hono/client";
import { createFactory } from "hono/factory";
import { decode, sign, verify } from "hono/jwt";
import { cookies } from "./cookies/cookies";
import { logger } from "./logger/logger";
import { memberServiceClient } from "./handlers/members.handlers";
import { Context } from "hono";

const jwt = { decode, sign, verify };

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

type Env = {
  Variables: Dependencies;
};

export type SurfaceContext = Context<Env>;

export const { createMiddleware, createHandlers } = createFactory<Env>();

// type safe dependency injection via middleware.
// more verbose than the previous pattern but no type acrobatics!
// handlers docs here: https://hono.dev/guides/best-practices#factory-createhandlers-in-hono-factory
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
