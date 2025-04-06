import { Hono } from "hono";
import { SurfaceEnv } from "../surface.app.ctx";
import { errorHandler } from "./error.handlers";

export class PingError extends Error {}

export const ping = new Hono<SurfaceEnv>()
  .get("", (c) => {
    c.var.logger.info("👋🏼 ping from surface app");
    return c.json({ message: "pong" });
  })
  .get("/err", () => {
    throw new PingError("ping error");
  })
  .onError(errorHandler);
