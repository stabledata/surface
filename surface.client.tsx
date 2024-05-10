import ReactDOM from "react-dom/client";
import { StartClient } from "@tanstack/react-router-server";
import { createRouter } from "./surface.router";
import { hc } from "hono/client";
import { AppType } from "./surface.app";
import "./views/index.css";

export const rpcClient = hc<AppType>(`/`, {
  headers: {
    "Content-Type": "application/json",
  },
});

const router = createRouter({ rpc: rpcClient });
const root = document.getElementById("root")!;

ReactDOM.hydrateRoot(root, <StartClient router={router} />);
