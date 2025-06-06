import { Link, useRouterState } from "@tanstack/react-router";
import { Github, Moon, RefreshCw, Sun } from "lucide-react";
import { useBusyRouter } from "./hooks/use-busy-router";
import { useAppState } from "./hooks/use-app-state";
import { IconSwitch } from "./components/ui/icon-switch";

const activeProps = {
  className: "underline",
};

export function Header() {
  const isLoading = useBusyRouter();
  const { location } = useRouterState();
  const { user, isDarkMode, toggleDarkMode } = useAppState();

  return (
    <div className="flex items-center justify-center gap-6 py-3 text-sm bg-white border-b dark:bg-black border-sidebar-border">
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
          <a href="/team" className="flex items-center gap-2">
            Hi {user.name}!{" "}
            <div
              className="w-5 h-5 bg-center bg-cover rounded-full"
              style={{ backgroundImage: `url(${user.profilePicture})` }}
            />
          </a>
          <a href={`/auth/logout?return=${location.pathname}`}>Logout</a>
        </div>
      )}
      <IconSwitch
        className="w-5 cursor-pointer"
        onIcon={<Moon className="size-5" />}
        offIcon={<Sun className="size-5" />}
        value={isDarkMode ? "on" : "off"}
        onSwitch={() => {
          toggleDarkMode();
        }}
      />
      <a href="https://github.com/stabledata/surface">
        <Github size={20} />
      </a>
      {isLoading ? (
        <RefreshCw size={20} className="absolute right-4 animate-spin" />
      ) : null}
    </div>
  );
}
