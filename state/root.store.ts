import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { useUserStore } from "./user.store";

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
