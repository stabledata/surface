import { createFileRoute } from "@tanstack/react-router";
import App from "../home";

export const Route = createFileRoute("/")({
  component: App,
});
