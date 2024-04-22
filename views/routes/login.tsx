import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useUser } from "../hooks/use-user";
import React from "react";

export const Route = createFileRoute("/login")({
  component: Login,
});

function Login() {
  const user = useUser();
  const nav = useNavigate();
  React.useEffect(() => {
    if (user) {
      nav({ to: "/members" });
    }
  });
  return (
    <div className="p-5 text-center">
      <h1 className="text-2xl mb-5">Members only area!</h1>
      <p>
        <a href="/auth/login?return=members">Login first</a>
      </p>
    </div>
  );
}
