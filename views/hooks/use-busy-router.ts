import { useRouterState } from "@tanstack/react-router";
import React from "react";

export function useBusyRouter() {
  const routerState = useRouterState();
  const [isBusy, setIsBusy] = React.useState(false);
  const busy = routerState.isLoading || routerState.isTransitioning;

  React.useEffect(() => {
    // don't actually set this state until the delay is over
    const delaySetBusy = setTimeout(() => {
      setIsBusy(busy);
    }, 90);

    return () => {
      clearTimeout(delaySetBusy);
    };
  }, [busy]);

  return isBusy;
}
