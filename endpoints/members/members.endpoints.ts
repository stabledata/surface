import { Hono } from "hono";
import { SurfaceContext } from "../../surface.app.ctx";
import { User } from "../auth/auth.endpoints";
import { fakeUser, hasSession } from "../auth/auth.helpers";

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

// we can pretend this our our client which we want in our gateway API contexts.
// ideally, it's generated from some other kid of upstream service.
export const memberServiceClient = {
  getMembers: async (): Promise<User[]> => {
    // testing this method as an example now, so don't delay too much
    // await new Promise((r) => setTimeout(r, 200));
    return fakeMembers;
  },
  getMember: async (id: string) => {
    await new Promise((r) => setTimeout(r, 1_000));
    const member = fakeMembers.find((m) => m.id === id);
    return member;
  },
};

// these are the "API" handlers, which are part of surface.
export const handleGetMembers = async (
  c: SurfaceContext
): Promise<Response> => {
  if (!(await hasSession(c))) {
    return c.text("Unauthorized", 401);
  }
  const members = await c.var.memberServiceClient.getMembers();
  c.var.logger.info("member service: Getting team members");
  return c.json({ members }, 200);
};

export const handleGetMember = async (c: SurfaceContext): Promise<Response> => {
  if (!(await hasSession(c))) {
    return c.text("Unauthorized", 401);
  }
  const id = c.req.param("id");
  c.var.logger.info(`member service: Getting member with id: ${id}`);
  const member = await c.var.memberServiceClient.getMember(id);
  if (!member) {
    return c.notFound();
  }
  return c.json(member);
};

export const members = new Hono()
  .get("/", handleGetMembers)
  .get("/:id", handleGetMember);
