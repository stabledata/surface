import { Hono } from "hono";
import { Dependencies } from "../surface.app";
import { makeInjectableContext, ServiceContext } from "../surface.app.ctx";
import { fakeUser, hasSession, User } from "./auth.service";

const fakeMembers: User[] = [
  fakeUser,
  {
    name: "Bob",
    email: "bob@member.net",
    id: "2",
    roles: [],
    profilePicture: "",
  },
];

export const handleGetMembers = async (
  c: ServiceContext
): Promise<Response> => {
  if (!(await hasSession(c))) {
    return c.text("Unauthorized", 401);
  }
  c.logger?.log("member service: Getting team members...");
  await new Promise((r) => setTimeout(r, 1_000));
  c.logger?.log("member service: Returning team members");
  return c.json({ members: fakeMembers });
};

export const handleGetMember = async (c: ServiceContext): Promise<Response> => {
  if (!(await hasSession(c))) {
    return c.text("Unauthorized", 401);
  }
  const id = c.req.param("id");
  c.logger?.log(`member service: Getting member with id: ${id}`);
  await new Promise((r) => setTimeout(r, 1_000));
  const member = fakeMembers.find((m) => m.id === id);
  if (!member) {
    return c.notFound();
  }
  return c.json(member);
};

export const members = (
  container: Dependencies,
  injections: Partial<Dependencies> = {}
) => {
  const { inject } = makeInjectableContext(container, injections);
  return new Hono()
    .get("/", inject(handleGetMembers))
    .get("/:id", inject(handleGetMember));
};
