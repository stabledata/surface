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

export type ServiceContext = PartialHonoContext & Dependencies;

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
        // FIXME: not perfect, cookies seem to complain more than others.
        // rather not do TS acrobatics, but it gets us to where we want to be
        cookies: cookies(ctx as unknown as ServiceContext),
        ...dependencies,
      });
    };
  };

  return {
    dependencies,
    inject,
  };
};
