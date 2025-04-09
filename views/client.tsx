import ReactDOM from "react-dom/client";
import { StartClient } from "@tanstack/react-start";
import { createRouter } from "./router";
import { hc } from "hono/client";
import { Api } from "../surface.app";
import "./index.css";

export const rpcClient = hc<Api>(`/`, {
  headers: {
    "Content-Type": "application/json",
  },
});

const router = createRouter({ rpc: rpcClient });

ReactDOM.hydrateRoot(document, <StartClient router={router} />);
