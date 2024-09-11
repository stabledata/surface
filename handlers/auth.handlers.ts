import { Hono } from "hono";
import {
  SurfaceContext,
  applyContext,
  createHandlers,
  Dependencies,
} from "../surface.app.ctx";

export type User = {
  id: string;
  name: string;
  email: string;
  roles: string[];
  profilePicture: string;
};

export const fakeUser = {
  id: "123",
  name: "Alice",
  email: "alice@domain.com",
  roles: ["admin"],
  profilePicture:
    "https://lh3.googleusercontent.com/a/ACg8ocIBaI40KOmbbQOPIE2tzc0KDHbxc41ZrqLg6dCuQ2SUGMi0jQ5w=s576-c-no",
};

export async function getUser(c: SurfaceContext): Promise<User | undefined> {
  const userId = c.var.cookies.get("user_id");
  if (!userId || userId === "") return undefined;
  return fakeUser;
}

export const hasSession = async (c: SurfaceContext): Promise<boolean> => {
  // we can simply check for cookie presence client side
  // but for service calls we need to check the jwt as Bearer token
  // plenty more to do here obviously but a good starting point for "real" auth.
  const authHeader = c.req.header("Authorization") ?? "";
  const userId = c.var.cookies.get("user_id") || authHeader > "Bearer ";
  const hasUserId = userId !== undefined && userId > "";
  if (hasUserId) {
    return true;
  }
  const token = authHeader.replace("Bearer ", "");
  try {
    const decoded = await c.var.jwt.verify(token, process.env.JWT_SECRET ?? "");
    return decoded;
  } catch (e) {
    c.var.logger.error(`No valid session was found.`);
    return false;
  }
};

export const authRoutesHandlers = (injections: Partial<Dependencies> = {}) => {
  const createSession = createHandlers(applyContext(injections), async (c) => {
    const { cookies, jwt } = c.var;
    cookies.set("user_id", fakeUser.id, { path: "/", httpOnly: true });

    // generate a jwt for session calls
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      sub: fakeUser.id,
      iat: now,
      exp: now + 60 * 60 * 24,
    };

    // this will throw if JWT_SECRET is empty
    const token = await jwt.sign(payload, process.env.JWT_SECRET ?? "");
    cookies.set("session", token, { path: "/", httpOnly: true });

    // redirect to location (if passed)
    const redirectTo = c.req.query("return") ?? "/";
    return c.redirect(redirectTo);
  });

  const endSession = createHandlers(applyContext(injections), async (c) => {
    c.var.cookies.set("user_id", "", { path: "/", httpOnly: true });
    const redirectTo = c.req.query("return") ?? "/";
    return c.redirect(redirectTo);
  });

  return new Hono()
    .get("/login", ...createSession)
    .get("/logout", ...endSession);
};
