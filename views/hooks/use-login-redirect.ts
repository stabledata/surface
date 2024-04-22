import React from "react";
import { useUser } from "./use-user";
import { useNavigate } from "@tanstack/react-router";
import { User } from "../../handlers/auth.handlers";

export function useLoginRedirect(): User | undefined {
  const nav = useNavigate();
  const user = useUser();

  React.useEffect(() => {
    if (user) return;
    nav({ to: "/login", replace: true });
  }, [nav, user]);

  return user;
}
