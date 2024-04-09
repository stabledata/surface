import { app } from "./app";

const port = process.env.PORT || 4001;

console.log(`Service starting on port: ${port}`);

export default {
  port,
  fetch: app.fetch,
};
