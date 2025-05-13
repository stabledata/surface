import { Hono } from "hono";
import { SurfaceContext } from "../../surface.app.ctx";
import { hasSession } from "../auth/auth.helpers";

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
