import { registerHydrator, StoreCreator } from "./__registry";
import { logger } from "../logger/logger";
import { RouterContext } from "@/router";
import { useAppStore } from "./root.store";

type WithCount = {
  count: number;
};

type CountStore = WithCount & {
  increment: () => void;
  decrement: () => void;
};

declare module "./root.store" {
  interface AppState extends CountStore {}
}

export const useCount: StoreCreator<CountStore> = (set, get) => ({
  count: 0,
  increment: () =>
    set({ count: get().count + 1 }, false, { type: "count/increment" }),
  decrement: () =>
    set({ count: get().count + 1 }, false, { type: "count/decrement" }),
});

registerHydrator((context: RouterContext) => {
  const { user } = context;
  if (user) {
    logger.debug("hydrating count client side:", user);
    useAppStore.setState({ count: 0 });
  }
});
