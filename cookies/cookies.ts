import { Context } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { CookieOptions } from "hono/utils/cookie";
import { Dependencies } from "../surface.app.ctx";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function cookies(c: Context<{ Variables: Dependencies }, any, object>) {
  const get = (name: string) => {
    return getCookie(c, name);
  };

  const set = (name: string, value: string, opt?: CookieOptions) => {
    return setCookie(c, name, value, opt);
  };

  return { get, set };
}
