import { Hono } from "hono";
import { applyContext, type SurfaceEnv } from "./surface.app.ctx";

import { handleStaticAssets } from "./handlers/assets.handler";
import { ping } from "./handlers/ping.handler";
import { sessions } from "./handlers/auth.handlers";

import { ssr } from "./handlers/view.handler";

import dotenv from "dotenv";
import { members } from "./handlers/members.handlers";
import { errorHandler } from "./handlers/error.handlers";
// import { compress } from "hono/compress";

dotenv.config();

export const app = new Hono<SurfaceEnv>()
  //.use(compress())
  .use(applyContext({}))
  .use("/assets/*", handleStaticAssets)

  // ping
  .route("/ping", ping)

  // auth
  .route("/auth", sessions)

  // members (just an example - you probably don't need this)
  .route("/api/members", members)

  // views (client routing via tanstack router SSR)
  .route("/*", ssr)

  // handle errors
  .onError(errorHandler);

// export the app type for for RPC
export type AppType = typeof app;

// hono vite dev server middleware needs a default export
export default app;
