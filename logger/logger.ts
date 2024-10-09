import { Logger } from "tslog";
import { env, isDev } from "../env";

const level = env("LOG_LEVEL", "info");
const levels = ["trace", "debug", "info", "warn", "error", "fatal"];

export const logger = new Logger({
  minLevel: levels.indexOf(level),
  type: isDev() ? "pretty" : "json",
});
