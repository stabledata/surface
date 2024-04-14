import { ServiceContext } from "../surface.app";
import { RouterContext } from "../surface.router";

type StateModule = {
  load: (context: ServiceContext) => Promise<unknown | undefined>;
  inflate: (context: RouterContext) => void;
};

type Registry<K extends string = string> = {
  keys: K[];
  loaders: { [key in K]: StateModule["load"] };
  inflators: { [key in K]: StateModule["inflate"] };
};

// Initialize the registry with no keys
const registeredStateModules: Registry = {
  keys: [],
  loaders: {},
  inflators: {},
};

export const registerStateLoader = <K extends string>(
  key: K,
  module: StateModule
): void => {
  registeredStateModules.keys.push(key);
  registeredStateModules.loaders[key] = module.load;
  registeredStateModules.inflators[key] = module.inflate;
};

export const loadState = async (c: ServiceContext) => {
  // load all the registered state modules
  const loadedStateData: Record<string, unknown> = {};
  // iterate over the loaders and assign the returned data to the key at index
  let keyIndex = 0;
  for (const key in registeredStateModules.loaders) {
    const loader = registeredStateModules.loaders[key];
    const data = await loader(c);
    loadedStateData[registeredStateModules.keys[keyIndex]] = data;
    keyIndex++;
  }
  return loadedStateData;
};

export const inflateState = (context: RouterContext) => {
  for (const key in registeredStateModules.inflators) {
    const inflator = registeredStateModules.inflators[key];
    inflator(context);
  }
};
