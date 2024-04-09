import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "./assets/vite.svg";
// import { useRouterState } from "@tanstack/react-router";

function App() {
  const [count, setCount] = useState(0);
  // const state = useRouterState();
  // console.log("trans?", state.isTransitioning, state.isLoading);
  return (
    <div className="flex flex-col gap-5">
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR ok there it is for
          dev at least..
        </p>
      </div>
      <p className="read-the-docs"></p>
    </div>
  );
}

export default App;
