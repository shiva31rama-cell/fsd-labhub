const express = require("express");
const path = require("node:path");
const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/", (_req, res) => {
  res.render("index", { title: "Student List", students: ["Ravi", "Sita", "Rahul"] });
});

app.listen(3000, () => console.log("Open http://localhost:3000"));
