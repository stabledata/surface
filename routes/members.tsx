import { createFileRoute, Outlet } from "@tanstack/react-router";

class UnauthorizedError extends Error {
  public status = 403;
  constructor() {
    super("Unauthorized");
  }
}
export const Route = createFileRoute("/members")({
  beforeLoad: async ({ context }) => {
    if (context.serviceContext && !context.user) {
      throw new UnauthorizedError();
      // throw redirect({ to: "/login" });
    }
  },
  component: MembersLayout,
});

function MembersLayout() {
  return (
    <div className="flex flex-col items-start gap-6 pt-8 text-left max-w-md m-auto">
      <Outlet />
    </div>
  );
}
