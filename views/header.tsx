import { Link, useRouterState } from "@tanstack/react-router";
import { Github, RefreshCw } from "lucide-react";
import { useBusyRouter } from "./hooks/use-busy-router";
import { useRootSsrCtx } from "./hooks/use-root-ssr-ctx";
import { useRootStore } from "../state/root.store";

const activeProps = {
  className: "underline",
};

export function Header() {
  const isLoading = useBusyRouter();
  const { location } = useRouterState();
  const { user: clientStoreUser } = useRootStore();
  const ssrCtx = useRootSsrCtx();
  const SSRUser = ssrCtx?.user;
  const user = clientStoreUser || SSRUser;
  return (
    <div className="header">
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
            className="w-5 h-5 rounded-full bg-cover bg-center"
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
