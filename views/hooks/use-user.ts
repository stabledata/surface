import { useUserStore } from "../../state/user.state";
import { useRootSsrCtx } from "./use-root-ssr-ctx";

export function useUser() {
  const ctx = useRootSsrCtx();
  const state = useUserStore();
  return ctx?.user || state.user;
}
