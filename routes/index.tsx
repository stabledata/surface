import { createFileRoute } from "@tanstack/react-router";
import App from "../views/home";

export const Route = createFileRoute("/")({
  component: App,
});
