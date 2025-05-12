import { useAppStore } from "../../state/root.store";
import { RootContext } from "@/providers/root-context-provider";
import React from "react";

export function useAppState() {
  const ssrContext = React.useContext(RootContext);
  const state = useAppStore();
  return {
    ...state,
    ...ssrContext,
  };
}
