import React from "react";
import { useAppState } from "./use-app-state";
import { useNavigate } from "@tanstack/react-router";
import { User } from "../../endpoints/auth/auth.endpoints";

export function useLoginRedirect(): User | undefined {
  const nav = useNavigate();
  const { user } = useAppState();

  React.useEffect(() => {
    if (user) return;
    nav({ to: "/login", replace: true });
  }, [nav, user]);

  return user;
}
