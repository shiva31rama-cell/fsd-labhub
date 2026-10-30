import { useState } from "react";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <main>
      <h1>Conditional Rendering</h1>
      {isLoggedIn ? <h2>Welcome, user!</h2> : <h2>Please log in.</h2>}
      <button onClick={() => setIsLoggedIn((current) => !current)}>
        Toggle login
      </button>
    </main>
  );
}

export default App;
