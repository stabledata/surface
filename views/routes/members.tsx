import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/members")({
  errorComponent: () => (
    <div className="p-10 m-auto max-w-sm text-center">
      Error! We are working on it. Please try again later.
    </div>
  ),
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
