import { SurfaceContext } from "../surface.app.ctx";
import { RouterContext } from "../views/router";

type ServerSideLoaderFn = (
  c: SurfaceContext
) => Promise<Partial<RouterContext>> | Partial<RouterContext> | undefined;

type ClientSideHydrateFn = (c: RouterContext) => void | Promise<void>;

export const registeredServerStateModules: ServerSideLoaderFn[] = [];
export const registeredClientStateModules: ClientSideHydrateFn[] = [];

export const registerLoader = (fn: ServerSideLoaderFn) => {
  registeredServerStateModules.push(fn);
};

export const registerHydrator = (fn: ClientSideHydrateFn) => {
  registeredClientStateModules.push(fn);
};
