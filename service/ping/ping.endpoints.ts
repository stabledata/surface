import { Hono } from "hono";
import { SurfaceEnv } from "../../surface.app.ctx";
import { PingError } from "../../handlers/error.handler";
import { describeRoute } from "hono-openapi";
import {
  resolver,
  // validator
} from "hono-openapi/zod";
import { z } from "zod";

const response = z.object({
  message: z.string(),
});

export const ping = new Hono<SurfaceEnv>()
  .get(
    "",
    describeRoute({
      description: "Ping the server, get a pong back",
      responses: {
        200: {
          description: "Successful ping!",
          content: {
            "text/json": { schema: resolver(response) },
          },
        },
      },
    }),
    (c) => {
      c.var.logger.info("👋🏼 ping from surface app");
      return c.json({ message: "pong" });
    }
  )
  // simulates error for testing
  .get("/err", () => {
    throw new PingError("ping error");
  });
