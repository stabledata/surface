import { JWTPayload } from "hono/utils/jwt/types";
import { SurfaceContext } from "../../surface.app.ctx";
import { User } from "./auth.endpoints";

export const fakeUser = {
  id: "123",
  name: "Alice",
  email: "alice@domain.com",
  roles: ["admin"],
  profilePicture:
    "https://plus.unsplash.com/premium_photo-1672201106204-58e9af7a2888?q=80&w=80",
};

export async function getUser(c: SurfaceContext): Promise<User | undefined> {
  const userId = c.var.cookies.get("user_id");
  if (!userId || userId === "") return undefined;
  return fakeUser;
}

export const hasSession = async (
  c: SurfaceContext
): Promise<boolean | JWTPayload> => {
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
