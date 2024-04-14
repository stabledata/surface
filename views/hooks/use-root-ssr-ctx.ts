import { Route as RootRoute } from "../../routes/__root";

export const useRootSsrCtx = () => {
  const data = RootRoute.useLoaderData();
  return data;
};
