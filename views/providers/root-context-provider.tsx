import { RouterContext } from "@/router";
import React from "react";

export const RootContext = React.createContext<RouterContext | null>(null);

type RouterContextProps = {
  ctx: RouterContext;
  children: React.ReactNode;
};

export const RootContextProvider: React.FC<RouterContextProps> = ({
  children,
  ctx,
}) => {
  return <RootContext.Provider value={ctx}>{children}</RootContext.Provider>;
};
