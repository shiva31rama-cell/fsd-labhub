const express = require("express");
const session = require("express-session");
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(session({
  name: "fsd.auth.sid",
  secret: process.env.SESSION_SECRET || "development-only-change-this-secret",
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: "lax", secure: false, maxAge: 15 * 60 * 1000 }
}));

const DEMO_USERNAME = "admin";
const DEMO_PASSWORD = "1234"; // Educational demo only. Never store real passwords like this.

app.get("/", (_req, res) => res.send(`<h1>Demo Login</h1>
  <form action="/login" method="POST">
    <input name="username" placeholder="Username" required>
    <input name="password" type="password" placeholder="Password" required>
    <button>Login</button>
  </form><p>Demo credentials: admin / 1234</p>`));

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (username !== DEMO_USERNAME || password !== DEMO_PASSWORD) {
    return res.status(401).send("Invalid username or password.");
  }
  req.session.regenerate((error) => {
    if (error) return res.status(500).send("Unable to create session.");
    req.session.user = username;
    res.redirect("/profile");
  });
});

app.get("/profile", (req, res) => {
  if (!req.session.user) return res.status(401).send("Please log in first. <a href='/'>Login</a>");
  res.send(`Welcome ${req.session.user}. <a href="/logout">Logout</a>`);
});

app.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("fsd.auth.sid");
    res.send("Logged out.");
  });
});
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("fsd.auth.sid");
    res.redirect("/");
  });
});

app.listen(3000, () => console.log("Open http://localhost:3000"));
