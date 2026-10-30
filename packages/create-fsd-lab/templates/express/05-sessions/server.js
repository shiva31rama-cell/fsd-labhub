const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const app = express();

app.use(cookieParser());
app.use(session({
  name: "fsd.sid",
  secret: process.env.SESSION_SECRET || "development-only-change-this-secret",
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: "lax", secure: false, maxAge: 15 * 60 * 1000 }
}));

app.get("/", (req, res) => {
  req.session.views = (req.session.views || 0) + 1;
  res.cookie("labUser", "Student", { httpOnly: true, sameSite: "lax" });
  res.send(`Session visits: ${req.session.views}<br><a href="/cookie">Read cookie</a>`);
});

app.get("/cookie", (req, res) => {
  res.send("Cookie value: " + (req.cookies.labUser || "not set"));
});

app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("fsd.sid");
    res.send("Session destroyed.");
  });
});

app.listen(3000, () => console.log("Open http://localhost:3000"));
