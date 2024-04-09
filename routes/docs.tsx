import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/docs")({
  component: Docs,
});

function Docs() {
  return <div className="p-8 text-center">Coming soon.</div>;
}
