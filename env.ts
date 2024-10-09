// much as we want to avoid it some client imports are going to grab server code.
export const env = (key: string, defaultValue?: string) => {
  const val = hasProcess() ? process.env[key] : import.meta.env[key];
  if (defaultValue === undefined && val === undefined) {
    throw new Error(`env var ${key} not found`);
  }
  return val ?? defaultValue;
};

export const isProd = () =>
  env("NODE_ENV", "none") === "production" || env("PROD", "none") === true;
export const isDev = () =>
  env("NODE_ENV", "none") !== "production" || env("DEV", "none") === true;
export const hasProcess = () => typeof process !== "undefined";
