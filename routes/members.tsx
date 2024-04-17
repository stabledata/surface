import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/members")({
  errorComponent: () => <>Error</>,
  notFoundComponent: () => <>Not Found</>,
  beforeLoad: async ({ context }) => {
    if (context.serviceContext && !context.user) {
      context.serviceContext.logger.log(
        "Unauthorized access to members, returning 401"
      );
      context.serviceContext.status(401);
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
