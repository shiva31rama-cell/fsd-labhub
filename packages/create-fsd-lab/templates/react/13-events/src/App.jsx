import { useState } from "react";

function App() {
  const [name, setName] = useState("");

  function handleClick() {
    window.alert("Button clicked!");
  }

  function handleChange(event) {
    setName(event.target.value);
  }

  return (
    <main>
      <h1>React Event Handling</h1>
      <button onClick={handleClick}>Click Me</button>
      <p>
        <input value={name} onChange={handleChange} placeholder="Enter your name" />
      </p>
      <p>Your name: {name}</p>
    </main>
  );
}

export default App;
