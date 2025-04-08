import { create, StateCreator, StoreApi } from "zustand";
import { devtools } from "zustand/middleware";
import { useUserStore } from "./user.store";

export interface SurfaceState {}

export type StoreCreator<T> = StateCreator<
  SurfaceState,
  [["zustand/devtools", never]],
  [],
  T
>;

// TODO: This is for dynamically adding slices.
// Neat, but not needed in demo yet...
export type SurfaceStore = StoreApi<SurfaceState> & {
  addSlice: <T>(name: string, slice: StoreCreator<T>) => void;
};

declare global {
  interface Window {
    __SURFACE_STORE__: SurfaceStore;
  }
}

export const useRootStore = create<SurfaceState>()(
  devtools(
    (get, set, store) => {
      return {
        ...useUserStore(get, set, store),
      };
    },
    {
      enabled: true,
    }
  )
);
