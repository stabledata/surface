import { createFileRoute } from "@tanstack/react-router";
import { NotebookPen } from "lucide-react";

export const Route = createFileRoute("/docs")({
  component: Docs,
});

function Docs() {
  return (
    <div className="max-w-md m-auto pt-5">
      <h2 className="text-2xl flex items-center gap-4">
        <NotebookPen size={22} />
        Field Notes
      </h2>
      <h3 className="mt-5">Principals</h3>
      <div className="my-5">
        Consciously working to reduce complexity is paramount to any software
        project, but perhaps even more so when we begin to blur the lines
        between client and server. Javascript has afforded us this ability, but
        we must wield the power responsibly.
      </div>

      <h4 className="mt-5 text-md font-semibold">No Magic</h4>
      <div className="my-5 text-sm leading-6">
        Nothing is abstracted away. This is a pattern for building web clients.
        There is no library, SDK, framework or anything more than a starting
        point. You can use it as a reference or a head start on your next
        project.
      </div>

      <h4 className="mt-5 text-md font-semibold">Context Injection</h4>
      <div className="my-5 text-sm leading-6">
        Surface wraps both Hono and Tanstack routers with a dead simple
        injection pattern that makes testing a breeze and the nuances between
        client and server easier to reason about.
      </div>

      <h4 className="mt-5 text-md font-semibold">
        Single Service BFF and Client
      </h4>
      <div className="my-5 text-sm leading-6">
        Surface is deployed as a NodeJS (or Bun) app container with a{" "}
        <a href="https://hono.dev/">Hono</a> backend. Routes are first matched
        by Hono and the catch all is delegated to{" "}
        <a href="https://tanstack.com/router/latest">Tanstack Router</a> and
        renders a client that builds and runs a dev server on{" "}
        <a href="https://vitejs.dev/">Vite.</a>.
      </div>

      <h4 className="mt-5 text-md font-semibold">Flexible Routing</h4>
      <div className="my-5 text-sm leading-6">
        Routes are entirely flexible. You don't have to prefix a backend request
        with <pre className="inline-block">/api</pre>, unless of course you want
        to. If Hono matches a route, say to <pre className="inline">/auth</pre>{" "}
        it will handle it on the server. If it doesn't match, it will delegate
        to the client router. The client router is Tanstack's relatively new but
        very full featured and production ready router, the example here uses a
        new but familiar{" "}
        <a href="https://tanstack.com/router/v1/docs/framework/react/guide/file-based-routing">
          file system based pattern.
        </a>
      </div>

      <h4 className="mt-5 text-md font-semibold">Loaders</h4>
      <div className="my-5 text-sm leading-6">
        The loader paradigm follows the render as you fetch pattern. Newer
        frameworks like Remix, Astro, Modern and more have elected to pursue
        this way, for good reason. Loaders in our case are{" "}
        <a href="https://tanstack.com/router/v1/docs/framework/react/guide/data-loading">
          provided by Tanstack Router
        </a>{" "}
        and are run on the server during an initial request the client after
        subsequent route navigation. <br />
        <br />
        If we chose to, we could inject the server context into our router
        context, and run loaders in a forked manner, calling services directly
        on the service and using RPC on the client. Ultimately the decision to
        keep this simple as possible made sense and we treat loaders as a single
        code path that works on both.
      </div>

      <h4 className="mt-5 text-md font-semibold">Application State and SSR</h4>
      <div className="my-5 text-sm leading-6">
        One of the biggest benefits of the surface pattern, is that we can store
        auth in httpOnly cookies for quick session lookups and <i>somewhat</i>{" "}
        seamlessly pass state between the client and server. <br />
        <br />
        Several patterns were explored here, but ultimately the one that made
        the most sense was to take advantage of the Tanstack router's ability to
        dehydrate and rehydrate state by injecting sever session data directly
        through the router.
      </div>
    </div>
  );
}
