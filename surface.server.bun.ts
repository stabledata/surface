import { logger } from "./logger/logger";
import { app } from "./surface.app";

const port = process.env.PORT || 4000;
const serve = app;

logger.info(`Service starting on port: ${port}`);

export default {
  port,
  fetch: serve.fetch,
};
