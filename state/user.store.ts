import { User } from "../endpoints/auth/auth.endpoints";
import { SurfaceContext } from "../surface.app.ctx";
import { RouterContext } from "../views/router";
import { registerHydrator, registerLoader } from "./__registry";
import { StoreCreator, useRootStore } from "./root.store";
import { logger } from "../logger/logger";
import { getUser } from "../endpoints/auth/auth.helpers";

type WithUser = {
  user?: User | undefined;
};

type UserStore = WithUser & {
  setUser: (user: User) => void;
};

declare module "./root.store" {
  interface SurfaceState extends UserStore {}
}

declare module "../views/router" {
  interface RouterContext extends WithUser {}
}

export const useUserStore: StoreCreator<UserStore> = (set) => ({
  user: undefined,
  setUser: (user: User) => set({ user }),
});

registerLoader(async (c: SurfaceContext) => {
  const user = await getUser(c);
  logger.debug("loading user server side:", user);
  return {
    user,
  };
});

registerHydrator((context: RouterContext) => {
  const { user } = context;
  if (user) {
    logger.debug("hydrating user client side:", user);
    useRootStore.setState({ user });
  }
});
