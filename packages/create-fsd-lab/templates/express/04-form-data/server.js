const express = require("express");
const app = express();
app.use(express.urlencoded({ extended: true }));

app.get("/", (_req, res) => {
  res.send(`<!doctype html><html><body>
    <h1>Student Form</h1>
    <form action="/submit" method="POST">
      <label>Name <input name="name" required></label><br><br>
      <label>Email <input type="email" name="email" required></label><br><br>
      <button type="submit">Submit</button>
    </form>
  </body></html>`);
});

app.post("/submit", (req, res) => {
  const { name, email } = req.body;
  res.send(`Name: ${escapeHtml(name)} | Email: ${escapeHtml(email)}`);
});

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}

app.listen(3000, () => console.log("Open http://localhost:3000"));
