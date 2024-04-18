import { Hono } from "hono";
import { decode, sign, verify } from "hono/jwt";
import { cookies } from "./cookies/cookies";
import { logger } from "./logger/logger";

import { handleStaticAssets } from "./services/assets.service";
import { ping } from "./services/ping.service";
import { render } from "./services/renderer.service";
import { authHandler, logoutHandler } from "./services/auth.service";
import { members } from "./services/members.service";
import { memberServiceClient } from "./services/members.service";

import { makeInjectableContext } from "./surface.app.ctx";

import dotenv from "dotenv";
dotenv.config();

export const jwt = { decode, sign, verify };

export type Dependencies = {
  logger: typeof logger;
  cookies?: ReturnType<typeof cookies>;
  jwt: typeof jwt;
  // service injections
  memberServiceClient: typeof memberServiceClient;
};

export const container: Dependencies = {
  logger,
  jwt,
  memberServiceClient,
};

export const app = (injections: Partial<Dependencies> = {}) => {
  const { dependencies, inject } = makeInjectableContext(container, injections);

  return (
    new Hono()
      .use("/assets/*", handleStaticAssets(dependencies))
      .get("/ping", inject(ping))

      // auth
      .get("/auth", inject(authHandler))
      .get("/auth/logout", inject(logoutHandler))

      // add more service handlers here so they get added to rpc
      .route("/api/members", members(container, injections))

      // catch all will attempt to render UI
      // which can match tanstack ssr or 404
      .get("/*", inject(render))
  );
};

// export the app type for for RPC
export type AppType = ReturnType<typeof app>;

// hono vite dev server middleware needs a default export
const ha = app();
export default ha;
