const express = require("express");
const app = express();

app.get("/", (_req, res) => res.send("Welcome to ExpressJS"));
app.get("/about", (_req, res) => res.send("About page"));

// Route parameter: /students/101
app.get("/students/:id", (req, res) => {
  res.send("Student ID: " + req.params.id);
});

// Query parameter: /search?name=Ravi
app.get("/search", (req, res) => {
  res.send("Search name: " + (req.query.name || ""));
});

// URL building with a route parameter
app.get("/link/:id", (req, res) => {
  const url = new URL("/students/" + encodeURIComponent(req.params.id), `${req.protocol}://${req.get("host")}`);
  res.send("Generated URL: " + url.pathname);
});

app.listen(3000, () => console.log("Server running at http://localhost:3000"));
