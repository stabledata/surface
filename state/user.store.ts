import { User } from "../service/auth/auth.endpoints";
import { SurfaceContext } from "../surface.app.ctx";
import { registerLoader, StoreCreator } from "./__registry";
import { logger } from "../logger/logger";
import { getUser } from "../service/auth/auth.helpers";

type WithUser = {
  user?: User | undefined;
};

type UserStore = WithUser & {
  setUser: (user: User) => void;
};

declare module "./__registry" {
  interface AppState extends UserStore {}
}

declare module "../views/router" {
  interface RouterContext extends WithUser {}
}

export const useUserStore: StoreCreator<UserStore> = (set) => ({
  user: undefined,
  setUser: (user: User) => set({ user }, false, { type: "user/setUser" }),
});

registerLoader(async (c: SurfaceContext) => {
  try {
    const user = await getUser(c);
    if (user) {
      logger.debug(`User ${user.email || user.id || "unknown"} loaded for SSR`);
    }

    return {
      user,
    };
  } catch (error) {
    logger.error("Error loading user data server side:", error);
    return {
      user: undefined,
    };
  }
});
