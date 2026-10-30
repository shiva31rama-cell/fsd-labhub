const express = require("express");
const app = express();
app.use(express.json());

let students = [{ id: 1, name: "Ravi" }, { id: 2, name: "Sita" }];

app.post("/students", (req, res) => {
  const { id, name } = req.body;
  if (!Number.isInteger(id) || typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ error: "Send a numeric id and non-empty name." });
  }
  if (students.some((student) => student.id === id)) {
    return res.status(409).json({ error: "Student id already exists." });
  }
  const student = { id, name: name.trim() };
  students.push(student);
  res.status(201).json(student);
});

app.get("/students", (_req, res) => res.json(students));

app.delete("/students/:id", (req, res) => {
  const id = Number(req.params.id);
  const oldLength = students.length;
  students = students.filter((student) => student.id !== id);
  if (students.length === oldLength) return res.status(404).json({ error: "Student not found." });
  res.json({ message: "Student deleted successfully." });
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
