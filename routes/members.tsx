import {
  createFileRoute,
  // notFound,
  Outlet,
  redirect,
} from "@tanstack/react-router";
import { Suspense } from "react";

export const Route = createFileRoute("/members")({
  errorComponent: () => <>Error</>,
  notFoundComponent: () => <>Not Found</>,
  beforeLoad: async ({ context }) => {
    if (!context.user) {
      throw redirect({ to: "/login" });
      // throw notFound();
    }
  },
  component: MembersLayout,
});

function MembersLayout() {
  return (
    <div className="flex flex-col items-start gap-6 pt-8 text-left max-w-md m-auto">
      <Suspense fallback={<p>ok</p>}>
        <button onClick={() => alert("nope")}>Go to member 1</button>
        <Outlet />
      </Suspense>
    </div>
  );
}
