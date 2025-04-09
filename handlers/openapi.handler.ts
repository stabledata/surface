import { Hono } from "hono";
import { openAPISpecs } from "hono-openapi";
import { SurfaceEnv } from "../surface.app.ctx";
import { swaggerUI } from "@hono/swagger-ui";

export const bindOpenAPIRouteToApp = (
  app: Hono<SurfaceEnv>,
  endpoint: string = "/spec"
) => {
  app
    .get(
      endpoint,
      openAPISpecs(app, {
        documentation: {
          info: {
            title: "Surface API",
            version: "1.0.0",
            description: "Surface Template/Demo API",
          },
          servers: [
            { url: "http://localhost:4000", description: "Local Dev Server" },
          ],
        },
      })
    )
    .get("/ui", swaggerUI({ url: "/spec" }));
};
