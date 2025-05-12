import { StoreCreator } from "./__registry";

type WithTheme = {
  isDarkMode?: boolean | undefined;
};

type ThemeStore = WithTheme & {
  toggleDarkMode: () => void;
  setIsDarkMode: (isDarkMode: boolean) => void;
};

declare module "./__registry" {
  interface AppState extends ThemeStore {}
}

declare module "../views/router" {
  interface RouterContext extends WithTheme {}
}

export const useThemeStore: StoreCreator<ThemeStore> = (set, get) => ({
  isDarkMode: undefined,
  toggleDarkMode: async () => {
    set({ isDarkMode: !get().isDarkMode });
  },
  setIsDarkMode: (isDarkMode) => set({ isDarkMode }),
});
