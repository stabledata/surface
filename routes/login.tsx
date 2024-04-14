import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({
  component: () => (
    <div className="p-5 text-center">
      <h1 className="text-2xl">You tried to access a members only area..</h1>
      <p>
        <a href="/auth">Login first...</a>
      </p>
    </div>
  ),
});
