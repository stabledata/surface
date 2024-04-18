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
        to the "view" router. That router is Tanstack's relatively new but full
        featured and production ready router. This example uses a new but
        familiar{" "}
        <a href="https://tanstack.com/router/v1/docs/framework/react/guide/file-based-routing">
          file system based pattern.
        </a>
      </div>

      <h4 className="mt-5 text-md font-semibold">Loaders</h4>
      <div className="my-5 text-sm leading-6">
        The loader paradigm follows the render as you fetch pattern. Newer
        frameworks like Remix, Astro, Modern and more have elected to move this
        way for good reason. Loaders in our case are{" "}
        <a href="https://tanstack.com/router/v1/docs/framework/react/guide/data-loading">
          provided by Tanstack Router
        </a>{" "}
        and are run on the server during an initial request, or the client
        during subsequent route navigation.
      </div>

      <h4 className="mt-5 text-md font-semibold">Isomorphism</h4>
      <div className="my-5 text-sm leading-6">
        Because we can inject context into our loaders from the server, it's
        very tempting to make this code isomorphic and get magical. Rather
        fortuitously, a router update broke our magic in production. So, we
        pulled back and ensured the loader code is the same on both the client
        and server. This keeps the{" "}
        <a href="https://github.com/stabledata/surface/blob/main/services/renderer.service.tsx#L11">
          renderer service
        </a>{" "}
        simple.
        <br />
        <br />
        That said, it would be nice to have a loader server hook method binding
        that could allow us to return different status codes or even redirect at
        the server, but this is a discussion for another day.
      </div>

      <h4 className="mt-5 text-md font-semibold">App State and SSR</h4>
      <div className="my-5 text-sm leading-6">
        Surface lets us define app state such as a user session and pass it
        between client and server seamlessly.
        <br />
        <br />
        To do this without manually adding context into our renderer service we
        create one new abstraction -- a "state module". State modules have a
        registry the renderer service will read, then pass the data through
        Tanstack Router's dehydrate and hydrate methods automatically.
      </div>
    </div>
  );
}
