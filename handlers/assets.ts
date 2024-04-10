import { serveStatic } from "@hono/node-server/serve-static";
import { Dependencies } from "../surface.app";

export function handleStaticAssets({ logger }: Dependencies) {
  const isProd = process.env["NODE_ENV"] === "production";
  return serveStatic({
    root: isProd ? "build/" : "./views/", // paths must end with '/'
    onNotFound: (path) => {
      logger.log("/asset/* requested but not found", path);
    },
  });
}
