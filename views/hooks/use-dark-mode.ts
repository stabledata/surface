import { useContext } from "react";
import { DarkModeContext } from "@/providers/dark-mode.provider";

export const useDarkMode = () => useContext(DarkModeContext);
