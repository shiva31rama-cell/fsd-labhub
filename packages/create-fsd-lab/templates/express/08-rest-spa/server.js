const express = require("express");
const path = require("node:path");
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

let tasks = [{ id: 1, name: "Study Express" }, { id: 2, name: "Study React" }];

app.get("/api/tasks", (_req, res) => res.json(tasks));
app.post("/api/tasks", (req, res) => {
  const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
  if (!name) return res.status(400).json({ error: "Task name is required." });
  const task = { id: Date.now(), name };
  tasks.push(task);
  res.status(201).json(task);
});
app.delete("/api/tasks/:id", (req, res) => {
  const before = tasks.length;
  tasks = tasks.filter((task) => task.id !== Number(req.params.id));
  if (tasks.length === before) return res.status(404).json({ error: "Task not found." });
  res.json({ message: "Task deleted." });
});
app.listen(3000, () => console.log("Open http://localhost:3000"));
