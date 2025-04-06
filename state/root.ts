import { StateCreator, StoreApi } from "zustand";

export interface SurfaceState {}

export type StoreCreator<T> = StateCreator<
  SurfaceState,
  [["zustand/devtools", never]],
  [],
  T
>;

export type SurfaceStore = StoreApi<SurfaceState> & {
  addSlice: <T>(name: string, slice: StoreCreator<T>) => void;
};

declare global {
  interface Window {
    __SURFACE_STORE__: SurfaceStore;
  }
}
