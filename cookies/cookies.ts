import hono from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { ServiceContext } from "../surface.app.ctx";
import { CookieOptions } from "hono/utils/cookie";

export function cookies(c: ServiceContext) {
  const get = (name: string) => {
    return getCookie(c as unknown as hono.Context, name);
  };

  const set = (name: string, value: string, opt?: CookieOptions) => {
    return setCookie(c as unknown as hono.Context, name, value, opt);
  };

  return { get, set };
}
