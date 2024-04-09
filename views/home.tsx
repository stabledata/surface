import { useState } from "react";
import { Zap } from "lucide-react";
function App() {
  const [count, setCount] = useState(0);
  return (
    <div className="flex flex-col gap-5 justify-center items-center max-w-md m-auto mt-10">
      <div className="flex gap-5 items-center">
        <img src="/assets/surface.svg" className="w-20" alt="Surface logo" />
      </div>
      <h1 className="text-4xl">Surface</h1>
      <h3 className="text-center w-full leading-8 text-md">
        Built on Vite, React, Hono, and Tanstack.
      </h3>

      <p className="text-center w-full leading-7 text-sm">
        <strong>Surface isn't a framework or a package</strong>. It's a simple
        way of building, designed to unify your client and service gateway.
      </p>

      <div className="text-center mt-4">
        <button
          onClick={() => setCount((count) => count + 1)}
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition-colors duration-150 w-48"
        >
          local count is {count}
        </button>
      </div>
      <p className="text-xs flex gap-1 items-center">
        <span>A homage to Vite default page</span> <Zap size={13} />
      </p>
    </div>
  );
}

export default App;
