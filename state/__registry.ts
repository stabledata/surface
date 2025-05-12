import { StateCreator, StoreApi } from "zustand";
import { SurfaceContext } from "../surface.app.ctx";
import { RouterContext } from "../views/router";
import { AppState } from "./root.store";

export type StoreCreator<T> = StateCreator<
  AppState,
  [["zustand/devtools", never]],
  [],
  T
>;

// This allows for dynamically adding slices from remotely loaded client
// modules. It's a neat feature for the future, but not in this demo yet
declare global {
  interface Window {
    __SURFACE_STORE__: SurfaceStore;
  }
}

export type SurfaceStore = StoreApi<AppState> & {
  addSlice: <T>(name: string, slice: StoreCreator<T>) => void;
};

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
