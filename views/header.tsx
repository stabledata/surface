import { Link } from "@tanstack/react-router";
import { Github } from "lucide-react";
const activeProps = {
  className: "font-bold",
};

export function Header() {
  return (
    <div className="flex gap-10 items-center justify-center py-4 border-b mb-3 text-sm">
      <Link to="/" activeProps={activeProps} activeOptions={{ exact: true }}>
        Home
      </Link>
      <Link to="/about" activeProps={activeProps}>
        Docs
      </Link>
      <Link to="/play" activeProps={activeProps}>
        Play
      </Link>
      <a href="https://github.com/stabledata/surface">
        <Github size={20} />
      </a>
    </div>
  );
}
