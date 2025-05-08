import { Link, useRouterState } from "@tanstack/react-router";
import { Github, RefreshCw } from "lucide-react";
import { useBusyRouter } from "./hooks/use-busy-router";
import { useUser } from "./hooks/use-user";

const activeProps = {
  className: "underline",
};

export function Header() {
  const isLoading = useBusyRouter();
  const { location } = useRouterState();
  const user = useUser();

  return (
    <div className="flex items-center justify-center gap-5">
      <Link to="/" activeProps={activeProps} activeOptions={{ exact: true }}>
        Home
      </Link>
      <Link to="/docs" activeProps={activeProps}>
        Notes
      </Link>
      <Link to="/members" activeProps={activeProps}>
        Members
      </Link>

      {!user ? (
        <a href={`/auth/login?return=${location.pathname}`}>Login</a>
      ) : (
        <div className="flex items-center gap-5">
          Hi {user.name}!{" "}
          <div
            className="w-5 h-5 bg-center bg-cover rounded-full"
            style={{ backgroundImage: `url(${user.profilePicture})` }}
          />
          <a href={`/auth/logout?return=${location.pathname}`}>Logout</a>
        </div>
      )}
      <a href="https://github.com/stabledata/surface">
        <Github size={20} />
      </a>
      {isLoading ? (
        <RefreshCw size={20} className="absolute right-4 animate-spin" />
      ) : null}
    </div>
  );
}
