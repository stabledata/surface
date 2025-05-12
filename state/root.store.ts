import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { useUserStore } from "./user.store";

export const useAppStore = create<AppState>()(
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
