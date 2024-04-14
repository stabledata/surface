import { Hono } from "hono";
import { Dependencies } from "../surface.app";
import { makeInjectableContext, ServiceContext } from "../surface.app.ctx";

export const handleGetMembers = async (
  c: ServiceContext
): Promise<Response> => {
  c.logger?.log("Getting team members...");
  return c.json({ members: ["Alice", "Bob", "Charlie"] });
};

export const members = (
  container: Dependencies,
  injections: Partial<Dependencies> = {}
) => {
  const { inject } = makeInjectableContext(container, injections);
  return new Hono().get("/", inject(handleGetMembers));
};
