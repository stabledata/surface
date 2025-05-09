import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAppState } from "../hooks/use-app-state";
import React from "react";

export const Route = createFileRoute("/login")({
  component: Login,
});

function Login() {
  const { user } = useAppState();
  const nav = useNavigate();
  React.useEffect(() => {
    if (user) {
      nav({ to: "/members" });
    }
  });
  return (
    <div className="p-5 text-center">
      <h1 className="mb-5 text-2xl">Members only area!</h1>
      <p>
        <a href="/auth/login?return=/members">Login first</a>
      </p>
    </div>
  );
}
