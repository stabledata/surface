import { app } from "./surface.app";

const port = process.env.PORT || 4000;
const serve = app();

console.log(
  `Service starting on port: ${port} SLKDJFLKSDJFLKSDJFLKDSJFLKSDJFLKDSJFLSDJFLKD`
);

export default {
  port,
  fetch: serve.fetch,
};
