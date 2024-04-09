import { serve } from "@hono/node-server";
import app from "./surface.app";

const port = Number(process.env.PORT || 4002);
const host = process.env.HOST || "localhost";

serve({ ...app, port }, () => {
  console.log(`Surface production server stared on http://${host}:${port}`);
});
