import hono, { Hono } from "hono";
import { handleStaticAssets } from "./handlers/assets";
import { ping } from "./handlers/ping";
import { tanstackSSR } from "./handlers/tanstack-ssr";
import { cookies } from "./cookies/cookies";
import { logger } from "./logger/logger";

export type Dependencies = {
  logger: typeof logger;
  cookies?: ReturnType<typeof cookies>;
};

const container: Dependencies = {
  logger,
};

type PartialHonoContext = Omit<
  hono.Context,
  | "#private"
  | "_var"
  | "layout"
  | "renderer"
  | "notFoundHandler"
  | "event"
  | "executionCtx"
  | "res"
  | "var"
>;

export type ServiceContext = PartialHonoContext & Partial<Dependencies>;

export const app = (injections: Partial<Dependencies> = {}) => {
  const dependencies = { ...container, ...injections };
  const inject = (
    handler: (ctx: ServiceContext) => Promise<Response> | Response
  ) => {
    return async (ctx: hono.Context) => {
      dependencies.logger.log(
        `surface gateway request: ${ctx.req.method} ${ctx.req.url}`
      );
      return await handler({
        ...ctx,
        ...cookies(ctx),
        ...dependencies,
      });
    };
  };

  return new Hono()
    .use("/assets/*", handleStaticAssets(dependencies))
    .get("/ping", inject(ping))
    .get("/*", inject(tanstackSSR));
};

// hono vite dev server middleware needs a default export
const ha = app();
export default ha;
