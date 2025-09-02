import { useAppStore } from "../../state/root.store";
import { RootContext } from "@/providers/root-context-provider";
import React from "react";
import { User } from "../../service/auth/auth.endpoints";

export function useAppState() {
  const ssrContext = React.useContext(RootContext);
  const state = useAppStore();
  return {
    ...state,
    ...ssrContext,
  };
}

export function useUser(): User | undefined {
  const { user } = useAppState();
  return user;
}

export function useIsAuthenticated(): boolean {
  const user = useUser();
  return !!user;
}
