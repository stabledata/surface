import { useRootStore } from "../../state/root.store";
import { useRootSsrCtx } from "./use-root-ssr-ctx";

export function useUser() {
  const ctx = useRootSsrCtx();
  const state = useRootStore();
  return ctx?.user || state.user;
}
