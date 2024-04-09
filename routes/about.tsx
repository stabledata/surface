import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  component: About,
});

function About() {
  return (
    <div className="p-8 text-center">
      Hello from About! BTW, You can't use lazy routes or things go badly with
      SSR.
    </div>
  );
}
