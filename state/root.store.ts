import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { useUserStore } from "./user.store";
import { useCount } from "./count";
import { useThemeStore } from "./theme";
import { persist } from "zustand/middleware";

export interface AppState {}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (get, set, store) => {
        return {
          ...useUserStore(get, set, store),
          ...useThemeStore(get, set, store),
          ...useCount(get, set, store),
        };
      },
      {
        name: "app-state-data",
        partialize: (state) => ({ isDarkMode: state.isDarkMode }),
      }
    ),
    {
      enabled: typeof window !== "undefined",
    }
  )
);
