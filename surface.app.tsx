import { Hono } from "hono";
import type { Dependencies } from "./surface.app.ctx";

import { handleStaticAssets } from "./handlers/assets.service";
import { pingRouteHandler } from "./handlers/ping.handler";
import { authRoutesHandlers } from "./handlers/auth.handlers";
// import { members } from "./handlers/members.service";
// renders tanstack router SSR
import { viewRouteHandler } from "./handlers/view.handler";

import dotenv from "dotenv";
import { membersRouteHandlers } from "./handlers/members.handlers";

dotenv.config();

export const app = (injections: Partial<Dependencies> = {}) => {
  return (
    new Hono()
      .use("/assets/*", handleStaticAssets(injections))
      .route("ping/", pingRouteHandler(injections))

      // auth
      .route("/auth", authRoutesHandlers(injections))

      // members
      .route("/api/members", membersRouteHandlers(injections))

      // views
      .route("/*", viewRouteHandler(injections))
  );
};

// export the app type for for RPC
export type AppType = ReturnType<typeof app>;

// hono vite dev server middleware needs a default export
const ha = app();
export default ha;
