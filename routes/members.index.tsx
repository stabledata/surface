import { createFileRoute, Link } from "@tanstack/react-router";
import { Users } from "lucide-react";
import { User } from "../services/auth.service";

export const Route = createFileRoute("/members/")({
  component: Members,
  loader: async ({ context }) => {
    const memberRpc = await context.rpc?.api.members.$get();
    const members = memberRpc?.ok ? await memberRpc.json() : { members: [] };
    return members;
  },
});

function Members() {
  const { members } = Route.useLoaderData();

  return (
    <div>
      <h2 className="text-2xl flex items-center gap-4">
        <Users size={22} /> Members
      </h2>
      <div>
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
