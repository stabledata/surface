import { Hono } from "hono";
import { SurfaceEnv } from "../../surface.app.ctx";
import { fakeUser } from "./auth.helpers";

export type User = {
  id: string;
  name: string;
  email: string;
  roles: string[];
  profilePicture: string;
};

export const sessions = new Hono<SurfaceEnv>()
  .get("/login", async (c) => {
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
  })
  .get("/logout", async (c) => {
    c.var.cookies.set("user_id", "", { path: "/", httpOnly: true });
    const redirectTo = c.req.query("return") ?? "/";
    return c.redirect(redirectTo);
  });
