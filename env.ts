// much as we want to avoid it some client imports are going to grab server code.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const env = (key: any) =>
  hasProcess() ? process.env[key] : import.meta.env[key];

export const isProd = () => env("NODE_ENV") === "production";
export const isDev = () => env("NODE_ENV") !== "production";
export const hasProcess = () => typeof process !== "undefined";
