require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const app = express();
app.use(express.json());

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  age: { type: Number, min: 1 },
  department: String
}, { timestamps: true });

const Student = mongoose.model("Student", studentSchema);

app.post("/students", async (req, res, next) => {
  try { res.status(201).json(await Student.create(req.body)); }
  catch (error) { next(error); }
});
app.get("/students", async (_req, res, next) => {
  try { res.json(await Student.find()); } catch (error) { next(error); }
});
app.get("/students/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: "Invalid student id." });
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ error: "Student not found." });
    res.json(student);
  } catch (error) { next(error); }
});
app.put("/students/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: "Invalid student id." });
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!student) return res.status(404).json({ error: "Student not found." });
    res.json(student);
  } catch (error) { next(error); }
});
app.delete("/students/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: "Invalid student id." });
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ error: "Student not found." });
    res.json({ message: "Student deleted.", student });
  } catch (error) { next(error); }
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: "Server error." });
});

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/fsd_lab";
mongoose.connect(MONGODB_URI)
  .then(() => app.listen(PORT, () => console.log(`MongoDB connected. API at http://localhost:${PORT}`)))
  .catch((error) => { console.error("MongoDB connection failed:", error.message); process.exit(1); });
