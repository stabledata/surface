import type hono from "hono";
import { Dependencies } from "./surface.app";
import { cookies } from "./cookies/cookies";

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

export const makeInjectableContext = (
  container: Dependencies,
  injections: Partial<Dependencies>
) => {
  const dependencies = { ...container, ...injections };
  const inject = (
    handler: (ctx: ServiceContext) => Promise<Response> | Response
  ) => {
    return async (ctx: hono.Context) => {
      dependencies.logger.log(
        `surface app request: ${ctx.req.method} ${ctx.req.url}`
      );
      return await handler({
        ...ctx,
        ...{ cookies: cookies(ctx) },
        ...dependencies,
      });
    };
  };

  return {
    dependencies,
    inject,
  };
};
