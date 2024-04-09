import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { readFile } from "node:fs/promises";
import { createRouter } from "./router";
import { createMemoryHistory } from "@tanstack/react-router";
import { StartServer } from "@tanstack/react-router-server/server";
import ReactDOMServer from "react-dom/server";
import { getCookie, setCookie } from "hono/cookie";

const isProd = process.env["NODE_ENV"] === "production";

const app = new Hono()
  .use("/assets/*", serveStatic({ root: isProd ? "build/" : "./" })) // path must end with '/'
  .get("/api", (c) => {
    setCookie(c, "delicious_cookie", "cool");
    return c.json({ message: "Hello, from /api! Check your cookies now." });
  })
  .get("/*", async (c) => {
    const index = isProd ? "build/index.html" : "./index.dev.html";
    const indexContents = await readFile(index, "utf-8");
    const router = createRouter();
    const memoryHistory = createMemoryHistory({
      initialEntries: [c.req.path],
    });
    router.update({
      history: memoryHistory,
      context: {
        // test sending a cooke set from another route through.
        foo: getCookie(c, "delicious_cookie") || "no cookie set!",
      },
    });
    await router.load();
    const dehydratedSSRContent = ReactDOMServer.renderToString(
      <StartServer router={router} />
    );

    const html = indexContents.replace(
      "<!--ssr-injection-->",
      dehydratedSSRContent
    );
    // const html = dehydratedSSRContent;
    const statusCode = router.hasNotFoundMatch() ? 404 : 200;
    return c.html(html, statusCode);
  });

app;

export default app;

const port = Number(process.env.PORT || 4002);
const host = process.env.HOST || "localhost";
if (isProd) {
  serve({ ...app, port }, () => {
    console.log(`Surface production server stared on http://${host}:${port}`);
  });
}
