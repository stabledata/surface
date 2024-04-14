import {
  createFileRoute,
  Outlet,
  redirect,
  useNavigate,
} from "@tanstack/react-router";
import { useUser } from "../views/hooks/use-user";
import { useEffect } from "react";

export const Route = createFileRoute("/members")({
  beforeLoad: async ({ context }) => {
    if (context.serviceContext && !context.user) {
      throw redirect({ to: "/login" });
    }
  },
  component: MembersLayout,
});

function MembersLayout() {
  const user = useUser();
  const nav = useNavigate();

  useEffect(() => {
    if (user === undefined) {
      nav({ to: "/login" });
    }
  }, [user, nav]);

  if (user === undefined) {
    return null;
  }
  return (
    <div className="flex flex-col items-start gap-6 pt-8 text-left max-w-md m-auto">
      <Outlet />
    </div>
  );
}
