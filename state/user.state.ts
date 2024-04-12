import { create } from "zustand";
import { User } from "../services/auth";
import { devtools } from "zustand/middleware";

// some basic state management
type UserStore = {
  user: User | undefined;
  setUser: (user: User) => void;
};

export const useUserStore = create<UserStore>()(
  devtools((set) => ({
    user: undefined,
    setUser: (user: User) => set({ user }),
  }))
);
