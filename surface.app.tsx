import { Hono } from "hono";
import { handleStaticAssets } from "./services/assets";
import { ping } from "./services/ping";
import { render } from "./services/renderer";
import { cookies } from "./cookies/cookies";
import { logger } from "./logger/logger";
import { authHandler, logoutHandler } from "./services/auth";
import { makeInjectableContext } from "./surface.app.ctx";

import dotenv from "dotenv";
dotenv.config();

export type Dependencies = {
  logger: typeof logger;
  cookies?: ReturnType<typeof cookies>;
};

const container: Dependencies = {
  logger,
};

export const app = (injections: Partial<Dependencies> = {}) => {
  const { dependencies, inject } = makeInjectableContext(container, injections);

  return (
    new Hono()
      .use("/assets/*", handleStaticAssets(dependencies))
      .get("/ping", inject(ping))
      .get("/auth", inject(authHandler))
      .get("/auth/logout", inject(logoutHandler))
      // add more service handlers here
      .get("/*", inject(render))
  );
};

// hono vite dev server middleware needs a default export
const ha = app();
export default ha;
