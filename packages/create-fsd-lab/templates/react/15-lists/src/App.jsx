const fruits = ["Apple", "Mango", "Banana", "Orange"];

function App() {
  return (
    <main>
      <h1>Fruit List</h1>
      <ul>
        {fruits.map((fruit) => <li key={fruit}>{fruit}</li>)}
      </ul>
    </main>
  );
}

export default App;
