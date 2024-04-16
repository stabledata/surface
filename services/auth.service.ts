import { ServiceContext } from "../surface.app.ctx";

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

export async function authHandler(c: ServiceContext): Promise<Response> {
  // this is a fake login handler
  // pretend it's an oauth callback from your favorite identity provider...
  c.cookies?.set("user_id", fakeUser.id, { path: "/", httpOnly: true });

  // generate a jwt for session calls
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: fakeUser.id,
    iat: now,
    exp: now + 60 * 60 * 24,
  };
  // FIXME: throw if there is no secret
  const token = await c.jwt.sign(payload, process.env.JWT_SECRET ?? "");
  c.cookies?.set("session", token, { path: "/", httpOnly: true });

  // redirect to existing location (if passed)
  const redirectTo = c.req.query("return") ?? "/";
  return c.redirect(redirectTo);
}

export async function getUser(c: ServiceContext): Promise<User | undefined> {
  const userId = c.cookies?.get("user_id");
  if (!userId || userId === "") return undefined;
  return fakeUser;
}

export const hasSession = async (c: ServiceContext): Promise<boolean> => {
  // TODO: replace this with jwt validation
  const authHeader = c.req.header("Authorization") ?? "";
  const userId = c.cookies?.get("user_id") || authHeader > "Bearer ";
  const hasUserId = userId !== undefined && userId > "";
  if (hasUserId) {
    return true;
  }
  // we can simply check for cookie presence client side
  // but for service calls we need to check the jwt as Bearer token
  const token = authHeader.replace("Bearer ", "");
  try {
    const decoded = await c.jwt.verify(token, process.env.JWT_SECRET ?? "");
    return decoded;
  } catch (e) {
    c.logger.error(`Error validating session token!`);
    return false;
  }
};

// TODO:
// export const hasValidSession = (c: ServiceContext): boolean => {
//   const userId = c.cookies?.get("user_id");
//   const hasUserId = userId !== undefined && userId > "";
//   return hasUserId;
// };

export async function logoutHandler(c: ServiceContext): Promise<Response> {
  c.cookies?.set("user_id", "", { path: "/", httpOnly: true });
  const redirectTo = c.req.query("return") ?? "/";
  return c.redirect(redirectTo);
}
