import { createContext, useState, useEffect } from "react";

const getPreferredDarkMode = (): Mode => {
  if (typeof window !== "undefined") {
    const preferredDarkMode = window.matchMedia("(prefers-color-scheme: dark)")
      .matches
      ? "dark"
      : "light";
    return preferredDarkMode;
  }
  return "light";
};

type Mode = "light" | "dark" | "auto";
type DarkModeContextType = {
  mode: Mode;
  setDarkMode: (mode: Mode) => void;
};

export const DarkModeContext = createContext<DarkModeContextType>({
  mode: getPreferredDarkMode() as Mode,
  setDarkMode: () => {},
});

export const DarkModeProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [mode, setMode] = useState(getPreferredDarkMode);

  useEffect(() => {
    if (mode === "dark") {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [mode]);

  const setDarkMode = (mode: Mode) => {
    setMode(mode);
  };

  return (
    <DarkModeContext.Provider value={{ mode, setDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
};
