import { ServiceContext } from "../surface.app.ctx";

export type User = {
  id: string;
  name: string;
  email: string;
  roles: string[];
  profilePicture: string;
};

const fakeUser = {
  id: "123",
  name: "Alice",
  email: "alice@domain.com",
  roles: ["admin"],
  profilePicture:
    "https://lh3.googleusercontent.com/a/ACg8ocIBaI40KOmbbQOPIE2tzc0KDHbxc41ZrqLg6dCuQ2SUGMi0jQ5w=s576-c-no",
};

export function authHandler(c: ServiceContext): Response {
  // this is a fake login handler
  // pretend it's an oauth callback from your favorite identity provider
  // perhaps set some tokens here in http only cookie, exp etc.
  c.cookies?.set("user_id", fakeUser.id, { path: "/", httpOnly: true });

  // redirect to existing location (if passed)
  const redirectTo = c.req.query("return") ?? "/";
  return c.redirect(redirectTo);
}

export async function getUser(c: ServiceContext): Promise<User | undefined> {
  const userId = c.cookies?.get("user_id");
  if (!userId || userId === "") return undefined;
  return fakeUser;
}

export async function logoutHandler(c: ServiceContext): Promise<Response> {
  c.cookies?.set("user_id", "", { path: "/", httpOnly: true });
  const redirectTo = c.req.query("return") ?? "/";
  return c.redirect(redirectTo);
}
