import { SurfaceContext } from "../surface.app.ctx";

export class PingError extends Error {}

export class AuthError extends Error {
  constructor(
    message: string,
    public readonly code: string = "AUTH_FAILED",
  ) {
    super(message);
  }
}

export const errorHandler = (err: unknown, c: SurfaceContext): Response => {
  const { error } = c.var.logger;
  const { text, json } = c;

  if (err instanceof PingError) {
    error(`some kind of error happened: ${err}`);
    return text("oh noes", 418);
  }

  if (err instanceof AuthError) {
    error(`Authentication error: ${err.message}`, err);
    return json(
      {
        error: "Authentication failed",
        code: err.code,
        message: err.message,
      },
      401,
    );
  }

  // unknown error
  error(`unhandled service error type: ${err}`, err);
  return json({ error: "Internal server error" }, 500);
};
