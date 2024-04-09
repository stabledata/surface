import { createFileRoute } from "@tanstack/react-router";
import React from "react";

export const Route = createFileRoute("/play")({
  component: Posts,
  loader: async () => {
    console.log("Fetching posts...");
    await new Promise((r) =>
      setTimeout(r, 300 + Math.round(Math.random() * 300))
    );
    return fetch("https://jsonplaceholder.typicode.com/posts")
      .then((d) => d.json() as Promise<unknown[]>)
      .then((d) => d.slice(0, 10));
  },
});

function Posts() {
  const posts = Route.useLoaderData();
  // const ctx = Route.useRouteContext();
  const [count, setCount] = React.useState(0);
  return (
    <div className="text-center leading-8">
      <h2>Doing some experimenting here... More soon</h2>
      <h1>
        {count} manual, and posts is {posts.length}
      </h1>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      This is the context, but we also loaded posts SSR, testing route w fetch,
    </div>
  );
}
