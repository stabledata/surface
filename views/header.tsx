import { Link, useRouterState } from "@tanstack/react-router";
import { Github, RefreshCw } from "lucide-react";
import { useBusyRouter } from "./hooks/use-busy-router";
import { useUserStore } from "../state/user.state";
import { useRootSsrCtx } from "./hooks/use-root-ssr-ctx";

const activeProps = {
  className: "underline",
};

export function Header() {
  const isLoading = useBusyRouter();
  const { location } = useRouterState();
  const { user: clientStoreUser } = useUserStore();
  const ssrCtx = useRootSsrCtx();
  const SSRUser = ssrCtx?.user;
  const user = clientStoreUser || SSRUser;
  return (
    <div className="header">
      <Link to="/" activeProps={activeProps} activeOptions={{ exact: true }}>
        Home
      </Link>
      <Link to="/docs" activeProps={activeProps}>
        Docs
      </Link>
      <Link to="/play" activeProps={activeProps}>
        Play
      </Link>
      {!user ? (
        <a href={`/auth?return=${location.pathname}`}>Login</a>
      ) : (
        <div className="flex items-center gap-5">
          Hi {user.name}!{" "}
          <img src={user.profilePicture} className="w-5 rounded-full" />
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
