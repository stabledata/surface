import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { getUser, User } from "../services/auth";
import { ServiceContext } from "../surface.app.ctx";
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
// - Don't forget to add key: MyStateType to RouterContext
// maybe someday we can make this more magical but the
// challenge is mostly that it needs to work server and the client
registerStateLoader(
  // key must be added in the RouterContext
  "user",
  {
    // "load" returns the state to be sent though the server
    load: async (c: ServiceContext) => {
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
