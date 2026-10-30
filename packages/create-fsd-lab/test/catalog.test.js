import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { catalog, categories } from "../src/catalog.js";

const testDir = path.dirname(fileURLToPath(import.meta.url));
const templatesRoot = path.resolve(testDir, "../templates");

test("catalog contains exactly 18 unique experiments", () => {
  assert.equal(catalog.length, 18);
  assert.equal(new Set(catalog.map((item) => item.id)).size, 18);
  assert.deepEqual(categories, ["ExpressJS", "ReactJS", "MongoDB"]);
});

test("every catalogue item has a template, README and entry file", async () => {
  for (const item of catalog) {
    const template = path.resolve(templatesRoot, item.template);
    const relative = path.relative(templatesRoot, template);
    assert.ok(relative && !relative.startsWith(".."), `Unsafe template path: ${item.template}`);
    await fs.access(template);
    await fs.access(path.join(template, item.entry));
    await fs.access(path.join(template, "README.md"));
  }
});

test("MongoDB shell experiments are not described as Node servers", () => {
  for (const item of catalog.filter((entry) => entry.category === "MongoDB")) {
    assert.deepEqual(item.dependencies, []);
    assert.equal(item.entry, "queries.mongodb.js");
  }
});
