import { Hono } from "hono";
import { SurfaceEnv } from "../../surface.app.ctx";
import { PingError } from "../../handlers/error.handler";

export const ping = new Hono<SurfaceEnv>()
  .get("", (c) => {
    c.var.logger.info("👋🏼 ping from surface app");
    return c.json({ message: "pong" });
  })
  // simulates error for testing
  .get("/err", () => {
    throw new PingError("ping error");
  });
