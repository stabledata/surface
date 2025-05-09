import { getRouteApi } from "@tanstack/react-router";
import { useRootStore } from "../../state/root.store";

export function useAppState() {
  const ssrLoader = getRouteApi("__root__");
  const ssrContext = ssrLoader.useLoaderData();
  const state = useRootStore();
  return {
    ...ssrContext,
    ...state,
  };
}
