import { getCookie, setCookie } from "hono/cookie";
import { CookieOptions } from "hono/utils/cookie";
import { SurfaceContext } from "../surface.app.ctx";

export function cookies(c: SurfaceContext) {
  const get = (name: string) => {
    return getCookie(c, name);
  };

  const set = (name: string, value: string, opt?: CookieOptions) => {
    return setCookie(c, name, value, opt);
  };

  return { get, set };
}
