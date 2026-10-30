import { useState } from "react";

function Welcome({ name }) {
  return <h2>Welcome, {name}</h2>;
}

function App() {
  const [count, setCount] = useState(0);
  return (
    <main>
      <Welcome name="Rama" />
      <p>Count: {count}</p>
      <button onClick={() => setCount((current) => current + 1)}>Increase</button>
    </main>
  );
}
export default App;
