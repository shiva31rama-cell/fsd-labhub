import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { catalog } from "../src/catalog.js";
import { scaffold } from "../src/cli.js";

test("creates an Express project manifest and source file", async () => {
  const base = await fs.mkdtemp(path.join(os.tmpdir(), "fsd-express-"));
  const item = catalog.find((entry) => entry.id === "01a");
  const target = await scaffold(item, path.join(base, item.slug), { install: false });
  const manifest = JSON.parse(await fs.readFile(path.join(target, "package.json"), "utf8"));
  assert.equal(manifest.scripts.start, "node server.js");
  assert.ok(manifest.dependencies.express);
  await fs.access(path.join(target, "server.js"));
});

test("creates a React project with Vite scripts", async () => {
  const base = await fs.mkdtemp(path.join(os.tmpdir(), "fsd-react-"));
  const item = catalog.find((entry) => entry.id === "07b");
  const target = await scaffold(item, path.join(base, item.slug), { install: false });
  const manifest = JSON.parse(await fs.readFile(path.join(target, "package.json"), "utf8"));
  assert.equal(manifest.scripts.dev, "vite");
  assert.ok(manifest.devDependencies.vite);
  await fs.access(path.join(target, "src", "App.jsx"));
});

test("creates MongoDB query files without a false Node package manifest", async () => {
  const base = await fs.mkdtemp(path.join(os.tmpdir(), "fsd-mongo-"));
  const item = catalog.find((entry) => entry.id === "09a");
  const target = await scaffold(item, path.join(base, item.slug), { install: false });
  await fs.access(path.join(target, "queries.mongodb.js"));
  await assert.rejects(fs.access(path.join(target, "package.json")));
});
