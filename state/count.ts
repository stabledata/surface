import { StoreCreator } from "./__registry";

type WithCount = {
  count: number;
};

type CountStore = WithCount & {
  increment: () => void;
  decrement: () => void;
};

declare module "./__registry" {
  interface AppState extends CountStore {}
}

export const useCount: StoreCreator<CountStore> = (set, get) => ({
  count: 0,
  increment: () =>
    set({ count: get().count + 1 }, false, { type: "count/increment" }),
  decrement: () =>
    set({ count: get().count + 1 }, false, { type: "count/decrement" }),
});
