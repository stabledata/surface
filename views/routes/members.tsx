import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/members")({
  errorComponent: () => (
    <div className="max-w-sm p-10 m-auto text-center">
      Error! We are working on it. Please try again later.
    </div>
  ),
  notFoundComponent: () => <>Not Found</>,
  component: MembersLayout,
  staticData: {
    title: "Members",
  },
});

function MembersLayout() {
  return (
    <div className="flex flex-col items-start max-w-md gap-6 pt-8 m-auto text-left">
      <Outlet />
    </div>
  );
}
