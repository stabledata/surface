import { SurfaceContext } from "../surface.app.ctx";
import { PingError } from "./ping.handler";

export const errorHandler = (err: unknown, c: SurfaceContext): Response => {
  const { error } = c.var.logger;
  const { text, json } = c;

  if (err instanceof PingError) {
    error(`some kind of error happened: ${err}`);
    return text("oh noes", 418);
  }
  // unknown error
  error(`unhandled service error type: ${err}`);
  return json({}, 500);
};
