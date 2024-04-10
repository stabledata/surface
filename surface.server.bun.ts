import { app } from "./surface.app";

const port = process.env.PORT || 4001;
const serve = app();

console.log(`Service starting on port: ${port}`);

export default {
  port,
  fetch: serve.fetch,
};
