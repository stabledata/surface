import React from "react";
import { RootSSRLoaderContext } from "../providers/ssr-loader-context-provider";

export const useRootSsrCtx = () => {
  const data = React.useContext(RootSSRLoaderContext);
  return data;
};
