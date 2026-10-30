import "./App.scss";

const students = ["Ravi", "Sita", "Rahul"];

function App() {
  return (
    <main className="container">
      <h1>Student Details</h1>
      {students.map((student, index) => (
        <p className="student" key={student}>{index + 1}. {student}</p>
      ))}
    </main>
  );
}
export default App;
