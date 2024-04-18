import { ServiceContext } from "../surface.app.ctx";
import { RouterContext } from "../surface.router";

type PropertyOfContext = RouterContext[keyof RouterContext];

type StateModule = {
  load: (context: ServiceContext) => Promise<PropertyOfContext | undefined>;
  inflate: (context: RouterContext) => void;
};

type Registry<K extends string = string> = {
  loaders: { [key in K]: StateModule["load"] };
  inflators: { [key in K]: StateModule["inflate"] };
};

// Initialize the registry with no keys
const registeredStateModules: Registry = {
  loaders: {},
  inflators: {},
};

// TODO: explore creative TS ways to dynamically type RouterContext?
export const registerStateLoader = (
  key: keyof RouterContext,
  module: StateModule
): void => {
  registeredStateModules.loaders[key] = module.load;
  registeredStateModules.inflators[key] = module.inflate;
};

export const loadState = async (c: ServiceContext) => {
  const loadedStateData: Record<string, PropertyOfContext> = {};
  for (const key in registeredStateModules.loaders) {
    const loader = registeredStateModules.loaders[key];
    const data = await loader(c);
    loadedStateData[key] = data;
  }
  return loadedStateData;
};

export const inflateState = (context: RouterContext) => {
  for (const key in registeredStateModules.inflators) {
    const inflator = registeredStateModules.inflators[key];
    inflator(context);
  }
};
