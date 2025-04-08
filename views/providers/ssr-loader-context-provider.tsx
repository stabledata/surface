import React from "react";
import { RouterContext } from "../router";

export const RootSSRLoaderContext = React.createContext<
  RouterContext | undefined
>(undefined);

export const RootSSRLoaderContextProvider: React.FC<
  { value: Partial<RouterContext> } & React.PropsWithChildren
> = ({ value, children }) => {
  return (
    <RootSSRLoaderContext.Provider value={value}>
      {children}
    </RootSSRLoaderContext.Provider>
  );
};
