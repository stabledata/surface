import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { getUser, User } from "../services/auth";
import { ServiceContext } from "../surface.app";
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

// "load" returns the state to be sent though the server
// see the registration method below
export const load = async (c: ServiceContext) => {
  const user = await getUser(c);
  useUserStore.setState({ user });
  return user;
};

// "inflate" takes the entire client context and can be used to
// populate initial states on client load
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const inflate = (context: RouterContext) => {
  useUserStore.setState({ user: context.user });
};

// register the state module -
// Don't forget to add your key: Type to RouterContext
// maybe someday we can make this more magical but
// the challenge is mostly that it needs to work both on the server
// and the client
registerStateLoader("user", { load, inflate });
