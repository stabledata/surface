import { Hono } from "hono";
import { createHandlers, applyContext, Dependencies } from "../surface.app.ctx";

export const pingRouteHandler = (inject: Partial<Dependencies>) => {
  const get = createHandlers(applyContext(inject), (c) => {
    c.var.logger.log("👋🏼 ping from surface app");
    return c.json({ message: "pong" });
  });

  return new Hono().get("", ...get);
};
