import { createFileRoute, Link, Await } from "@tanstack/react-router";
import { Users } from "lucide-react";
import { User } from "../../handlers/auth.handlers";
import { useLoginRedirect } from "../hooks/use-login-redirect";

type MembersResponse = {
  members: User[];
};

export const Route = createFileRoute("/members/")({
  component: Members,
  loader: async ({
    context,
  }): Promise<{ members: User[]; slowData: Promise<string> }> => {
    const memberRpc = await context.rpc?.api.members.$get();
    const members = memberRpc?.ok
      ? ((await memberRpc.json()) as MembersResponse)
      : { members: [] };

    return {
      members: members.members,
      slowData: new Promise<string>((resolve) => {
        setTimeout(() => {
          resolve("Wow, yeah that is some slow data!");
        }, 4000);
      }),
    };
  },
});

function Members() {
  const user = useLoginRedirect();
  const { members, slowData } = Route.useLoaderData();

  if (!user) {
    // prevents markup from rendering server side
    return null;
  }

  return (
    <div>
      <h2 className="text-2xl flex items-center gap-4">
        <Users size={22} /> Members
      </h2>
      <p className="my-5">
        This is a simple demonstration of loading from either the server or the
        client via <a href="https://hono.dev/guides/rpc#rpc">hono.rpc</a>, which
        looks like this:
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
      <h3 className="mt-6">Here is deferred data that takes awhile to load:</h3>
      <div className="flex flex-col gap-3 mt-5">
        <Await
          promise={slowData as Promise<string>}
          fallback={<div>Loading...</div>}
        >
          {(data: string) => {
            return <div>{data}</div>;
          }}
        </Await>
      </div>
    </div>
  );
}
