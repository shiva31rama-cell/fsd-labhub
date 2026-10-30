import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { catalog } from "../packages/create-fsd-lab/src/catalog.js";
import { scaffold } from "../packages/create-fsd-lab/src/cli.js";

const work = await fs.mkdtemp(path.join(os.tmpdir(), "fsd-runtime-"));
let failures = 0;

function report(label, error) {
  console.log(error ? `FAIL ${label}: ${error.message}` : `PASS ${label}`);
  if (error) failures += 1;
}
function cookieHeader(response) {
  const values = typeof response.headers.getSetCookie === "function"
    ? response.headers.getSetCookie()
    : [response.headers.get("set-cookie") || ""];
  return values.map((value) => value.split(";")[0]).filter(Boolean).join("; ");
}
function npm(cwd, args) {
  return new Promise((resolve, reject) => {
    const cmd = process.platform === "win32" ? "npm.cmd" : "npm";
    const child = spawn(cmd, args, { cwd, stdio: "inherit", shell: process.platform === "win32" });
    child.once("error", reject);
    child.once("exit", (code) => code === 0 ? resolve() : reject(new Error(`npm ${args.join(" ")} exited ${code}`)));
  });
}
async function startServer(target) {
  let logs = "";
  const child = spawn(process.execPath, ["server.js"], {
    cwd: target,
    env: {
      ...process.env,
      PORT: "3000",
      SESSION_SECRET: "ci-only-demo-secret",
      MONGODB_URI: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/fsd_lab_ci"
    },
    stdio: ["ignore", "pipe", "pipe"]
  });
  child.stdout.on("data", (part) => { logs += part.toString(); });
  child.stderr.on("data", (part) => { logs += part.toString(); });
  try {
    const deadline = Date.now() + 30000;
    while (Date.now() < deadline) {
      if (child.exitCode !== null) throw new Error(`Server exited early. ${logs}`);
      try {
        await fetch("http://127.0.0.1:3000/", { signal: AbortSignal.timeout(1500) });
        return child;
      } catch {
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    }
    throw new Error(`Server startup timed out. ${logs}`);
  } catch (error) {
    child.kill("SIGTERM");
    throw error;
  }
}
async function stopServer(child) {
  child.kill("SIGTERM");
  await new Promise((resolve) => {
    if (child.exitCode !== null) return resolve();
    const timer = setTimeout(resolve, 1500);
    child.once("exit", () => { clearTimeout(timer); resolve(); });
  });
}
async function readJson(url, init) {
  const response = await fetch(url, init);
  const value = await response.json();
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${JSON.stringify(value)}`);
  return value;
}

try {
  for (const item of catalog.filter((entry) => entry.category === "ExpressJS")) {
    let child;
    try {
      const target = path.join(work, item.slug);
      await scaffold(item, target, { install: false });
      await npm(target, ["install", "--no-audit", "--no-fund"]);
      child = await startServer(target);
      const base = "http://127.0.0.1:3000";

      if (item.id === "01a") {
        const route = await (await fetch(base + "/students/42")).text();
        const query = await (await fetch(base + "/search?name=Ravi")).text();
        if (!route.includes("42") || !query.includes("Ravi")) throw new Error("route/query parameter check failed");
      } else if (item.id === "01b") {
        const created = await readJson(base + "/students", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: 45, name: "CI Student" }) });
        const rows = await readJson(base + "/students");
        if (created.id !== 45 || !rows.some((row) => row.id === 45)) throw new Error("POST/GET check failed");
        await readJson(base + "/students/45", { method: "DELETE" });
      } else if (item.id === "02a") {
        const html = await (await fetch(base + "/")).text();
        if (!html.includes("Student List") || !html.includes("Ravi")) throw new Error("EJS render check failed");
      } else if (item.id === "02b") {
        const html = await (await fetch(base + "/")).text();
        const response = await fetch(base + "/submit", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ name: "CI Student", email: "ci@example.test" }) });
        if (!html.includes('name="email"') || !(await response.text()).includes("ci@example.test")) throw new Error("form submission check failed");
      } else if (item.id === "03a") {
        const first = await fetch(base + "/");
        const cookie = cookieHeader(first);
        const result = await (await fetch(base + "/cookie", { headers: { cookie } })).text();
        if (!result.includes("Student")) throw new Error("cookie read check failed");
      } else if (item.id === "03b") {
        const login = await fetch(base + "/login", { method: "POST", redirect: "manual", headers: { "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ username: "admin", password: "1234" }) });
        if (login.status !== 302) throw new Error("login did not redirect");
        const profile = await (await fetch(base + "/profile", { headers: { cookie: cookieHeader(login) } })).text();
        if (!profile.includes("Welcome admin")) throw new Error("authenticated profile check failed");
      } else if (item.id === "04a") {
        const created = await readJson(base + "/students", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: "CI Student", age: 20, department: "CSE" }) });
        const rows = await readJson(base + "/students");
        if (!rows.some((row) => row._id === created._id)) throw new Error("Mongoose create/read check failed");
        await readJson(base + "/students/" + created._id, { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: "Updated Student" }) });
        await readJson(base + "/students/" + created._id, { method: "DELETE" });
      } else if (item.id === "04b") {
        const page = await (await fetch(base + "/")).text();
        if (!page.includes("Task Manager")) throw new Error("SPA page check failed");
        const created = await readJson(base + "/api/tasks", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: "CI task" }) });
        await readJson(base + "/api/tasks/" + created.id, { method: "DELETE" });
      }
      report(`Express ${item.id} - ${item.title}`);
    } catch (error) {
      report(`Express ${item.id} - ${item.title}`, error);
    } finally {
      if (child) await stopServer(child);
    }
  }

  for (const item of catalog.filter((entry) => entry.category === "ReactJS")) {
    try {
      const target = path.join(work, item.slug);
      await scaffold(item, target, { install: false });
      await npm(target, ["install", "--no-audit", "--no-fund"]);
      await npm(target, ["run", "build"]);
      await fs.access(path.join(target, "dist", "index.html"));
      report(`React ${item.id} - ${item.title}`);
    } catch (error) {
      report(`React ${item.id} - ${item.title}`, error);
    }
  }

  for (const item of catalog.filter((entry) => entry.category === "MongoDB")) {
    try {
      const target = path.join(work, item.slug);
      await scaffold(item, target, { install: false });
      const query = await fs.readFile(path.join(target, item.entry), "utf8");
      if (!query.includes("db.") || !query.includes("students")) throw new Error("MongoDB shell commands are missing");
      report(`MongoDB ${item.id} - query file/content validation`);
    } catch (error) {
      report(`MongoDB ${item.id}`, error);
    }
  }

async function testInteractiveInstaller() {
  const bin = path.resolve(process.cwd(), "packages/create-fsd-lab/bin/create-fsd-lab.js");
  const folder = "cli-install-all-18";
  let output = "";
  const child = spawn(process.execPath, [bin], { cwd: work, stdio: ["pipe", "pipe", "pipe"] });
  child.stdout.on("data", (part) => { output += part.toString(); });
  child.stderr.on("data", (part) => { output += part.toString(); });
  const code = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      child.kill("SIGTERM");
      reject(new Error("Interactive installer timed out. " + output));
    }, 60000);
    child.once("error", (error) => { clearTimeout(timer); reject(error); });
    child.once("exit", (exitCode) => { clearTimeout(timer); resolve(exitCode); });
    child.stdin.end(`4\n19\n${folder}\nn\n`);
  });
  if (code !== 0) throw new Error(`Installer exited with code ${code}. ${output}`);
  const generated = await fs.readdir(path.join(work, folder), { withFileTypes: true });
  const directories = generated.filter((entry) => entry.isDirectory());
  if (directories.length !== 18) {
    throw new Error(`Expected 18 generated experiment folders, found ${directories.length}. ${output}`);
  }
  report("Interactive CLI installs all 18 experiments");
}

  try { await testInteractiveInstaller(); } catch (error) { report("Interactive CLI installs all 18 experiments", error); }
} finally {
  await fs.rm(work, { recursive: true, force: true });
}

console.log(`\nRuntime smoke test failures: ${failures}`);
if (failures) process.exitCode = 1;
