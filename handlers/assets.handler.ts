import { serveStatic } from "@hono/node-server/serve-static";
import { isProd } from "../env";
import { logger } from "../logger/logger";

export const handleStaticAssets = serveStatic({
  root: isProd() ? "build/" : "./views/", // paths must end with '/'
  onNotFound: (path) => {
    logger?.info("/asset/* requested but not found at path", path);
  },
});
