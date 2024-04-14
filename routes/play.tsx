import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/play")({
  component: Posts,
  loader: async ({ context }) => {
    await new Promise((r) =>
      setTimeout(r, 300 + Math.round(Math.random() * 300))
    );

    const memberRpc = await context.rpc?.members.$get();
    const members = memberRpc?.ok ? await memberRpc.json() : { members: [] };
    return members;
  },
});

function Posts() {
  const { members } = Route.useLoaderData();

  return (
    <div className="flex flex-col items-center text-center gap-6 pt-8">
      <h2>Doing some experimenting here. More soon!</h2>
      <p>We loaded {members.length} members</p>
    </div>
  );
}
