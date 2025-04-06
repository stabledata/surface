import { Hono } from "hono";
import type { Dependencies, Env } from "./surface.app.ctx";

import { handleStaticAssets } from "./handlers/assets.handler";
import { ping } from "./handlers/ping.handler";
import { authRoutesHandlers } from "./handlers/auth.handlers";
// import { members } from "./handlers/members.service";
// renders tanstack router SSR
import { viewRouteHandler } from "./handlers/view.handler";

import dotenv from "dotenv";
import { membersRouteHandlers } from "./handlers/members.handlers";
import { errorHandler } from "./handlers/error.handlers";
import { compress } from "hono/compress";

dotenv.config();

export const app = (inject: Partial<Dependencies> = {}) => {
  return (
    new Hono<Env>()
      .use(compress())
      .use("/assets/*", handleStaticAssets)

      // ping example (healthcheck)
      .route("/ping", ping)

      // auth
      .route("/auth", authRoutesHandlers(inject))

      // members
      .route("/api/members", membersRouteHandlers(inject))

      // views (client SSR)
      .route("/*", viewRouteHandler(inject))

      // handle errors
      .onError(errorHandler)
  );
};

// export the app type for for RPC
export type AppType = ReturnType<typeof app>;

// hono vite dev server middleware needs a default export
const ha = app();
export default ha;
