import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/members")({
  errorComponent: () => <>Error</>,
  notFoundComponent: () => <>Not Found</>,
  component: MembersLayout,
});

function MembersLayout() {
  return (
    <div className="flex flex-col items-start gap-6 pt-8 text-left max-w-md m-auto">
      <Outlet />
    </div>
  );
}
