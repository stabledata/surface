import { FileDigit } from "lucide-react";
import { Button } from "./components/ui/button";
import { SurfaceIcon } from "./components/icon/SurfaceIcon";
import { Header } from "./header";
import { useAppState } from "./hooks/use-app-state";
function App() {
  const { count, increment } = useAppState();
  return (
    <div>
      <Header />
      <div className="flex flex-col items-center justify-center max-w-md gap-5 m-auto mt-10">
        <div className="flex items-center gap-5">
          <SurfaceIcon className="w-22 h-22" />
        </div>

        <h1 className="text-4xl font-bold uppercase">Surface</h1>

        <p className="font-medium text-md">You might have a new BFF.</p>

        <h3 className="w-full leading-8 text-center text-md">
          Built with Vite, React, Hono, Tanstack and Zustand.
        </h3>

        <p className="w-full text-sm leading-7 text-center">
          <strong className="font-semibold">Surface isn't a framework.</strong>{" "}
          It's a pattern for building web applications that unifies your client
          and service gateway.
        </p>

        <div className="mt-4 text-center">
          <Button onClick={() => increment()}>count is {count}</Button>
        </div>
        <p className="flex items-center gap-1 text-xs">
          <span>Homage to Vite default page</span> <FileDigit size={13} />
        </p>
      </div>
    </div>
  );
}

export default App;
