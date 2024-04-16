import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { Users } from "lucide-react";
import { User } from "../services/auth.service";

export const Route = createFileRoute("/members/")({
  component: Members,
  loader: async ({ context }): Promise<{ members: User[] }> => {
    const memberRpc = await context.rpc?.api.members.$get();
    // if we get a 401, redirect
    if (memberRpc?.status === 401) {
      throw redirect({ to: "/login" });
    }
    return memberRpc?.ok ? await memberRpc.json() : { members: [] };
  },
});

function Members() {
  const { members } = Route.useLoaderData();

  return (
    <div>
      <h2 className="text-2xl flex items-center gap-4">
        <Users size={22} /> Members
      </h2>
      <p className="my-5">
        This is a simple demonstration of loading from either the server or the
        client via hono.rpc, which looks like this:
      </p>
      <pre>context.rpc?.api.members.$get()</pre>
      <p className="my-5 text-xs">
        Now, the reality of how this works client vs. server is more
        complicated, but you can see the <Link to="/docs">notes</Link> about
        that.
      </p>
      <h3 className="text-sm">Here are the members:</h3>
      <div className="flex flex-col gap-3 mt-5">
        {members.map((member: User) => (
          <div key={member.id}>
            <Link
              to={`/members/$id`}
              params={{
                id: member.id,
              }}
            >
              {member.name}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
