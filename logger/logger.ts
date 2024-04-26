import pino from "pino";
import { env, isDev } from "../env";

const level = env("LOG_LEVEL") ?? "info";

// Define the logger with options
export const logger = pino(
  {
    level,
  },
  // for dev, make the logging nicer, prod is a plain structured version
  isDev()
    ? {
        write: (m: string) => {
          const { level, msg } = JSON.parse(m);
          const lev = pino.levels.labels[level];
          const color = {
            debug: "\x1b[36m",
            info: "\x1b[32m",
            error: "\x1b[31m",
            warn: "\x1b[33m",
          }[lev];

          console.log(color, lev, msg);
        },
      }
    : undefined
);
