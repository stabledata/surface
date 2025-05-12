import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { useUserStore } from "./user.store";
import { useCount } from "./count";
import { useThemeStore } from "./theme";
import { persist } from "zustand/middleware";
import { AppState, hydrateClient } from "./__registry";
import { RouterContext } from "@/router";

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

hydrateClient((context: RouterContext) => {
  const { user } = context;
  if (user) {
    useAppStore.setState({ count: 0, user });
  }
});
