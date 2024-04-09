import { createFileRoute } from "@tanstack/react-router";
import App from "../views/App";

export const Route = createFileRoute("/")({
  component: App,
});
