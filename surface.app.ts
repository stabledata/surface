import { Hono } from "hono";
import dotenv from "dotenv";

import { applyContext, type SurfaceEnv } from "./surface.app.ctx";
import { handleStaticAssets } from "./handlers/assets.handler";
import { ping } from "./service/ping/ping.endpoints";
import { sessions } from "./service/auth/auth.endpoints";
import { members } from "./service/members/members.endpoints";
import { ssr } from "./handlers/view.handler";
import { errorHandler } from "./handlers/error.handler";
import { bindOpenAPIRouteToApp } from "./handlers/openapi.handler";

dotenv.config();

export const app = new Hono<SurfaceEnv>();
// TODO: security and all the other things should be done here e.g.:
// hono.dev/docs/middleware/builtin/secure-headers#secure-headers-middleware
//.use(compress())
//.use(secureHeaders())

// bind the openapi specs to the app
// https://hono.dev/examples/hono-openapi#hono-openapi
bindOpenAPIRouteToApp(app);

// add routing
const api = app

  .use(applyContext({}))
  .use("/assets/*", handleStaticAssets)

  // ping
  .route("/ping", ping)

  // auth
  .route("/auth", sessions)

  // members (just an example - you probably don't need this)
  .route("/api/members", members)

  // views (catch all delegates to client routing via tanstack router / SSR)
  .route("/*", ssr)

  // handle errors
  .onError(errorHandler);

// export the app type for for RPC
export type Api = typeof api;

// hono vite dev server middleware needs a default export
export default app;
