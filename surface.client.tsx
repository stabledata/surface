import ReactDOM from "react-dom/client";
import { StartClient } from "@tanstack/react-router-server";
import { createRouter } from "./surface.router";
import "./views/index.css";

const router = createRouter();
const root = document.getElementById("root")!;

ReactDOM.hydrateRoot(root, <StartClient router={router} />);
