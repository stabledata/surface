import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/members")({
  component: () => (
    <div className="flex flex-col items-start gap-6 pt-8 text-left max-w-md m-auto">
      <Outlet />
    </div>
  ),
});
