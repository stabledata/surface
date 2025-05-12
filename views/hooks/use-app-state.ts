import { getRouteApi } from "@tanstack/react-router";
import { useAppStore } from "../../state/root.store";

export function useAppState() {
  const ssrLoader = getRouteApi("__root__");
  const ssrContext = ssrLoader.useLoaderData();
  const state = useAppStore();
  return {
    ...ssrContext,
    ...state,
  };
}
