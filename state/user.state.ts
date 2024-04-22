import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { getUser, User } from "../handlers/auth.handlers";
import { SurfaceContext } from "../surface.app.ctx";
import { RouterContext } from "../surface.router";
import { registerStateLoader } from "./registry";

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

// register state module
// IMPORTANT! don't forget to add key: MyStateType to RouterContext
// ... until we can figure out a way to do this dynamically.
registerStateLoader(
  // key must be added in the RouterContext,
  // so at least you'll be warned here if forget.
  "user",
  {
    // "load" returns the state to be sent though the server
    load: async (c: SurfaceContext) => {
      const user = await getUser(c);
      // TODO: look into why this doesn't work
      // this unfortunately has no affect on server rendering
      // useUserStore.setState({ user });
      return user;
    },
    // "inflate" takes the entire context and can be used to populate
    // initial states on client load so you can populate state
    // arbitrarily here, not just for the specific key
    inflate: (context: RouterContext) => {
      useUserStore.setState({ user: context.user });
    },
  }
);
