import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import readline from "node:readline/promises";
import { fileURLToPath } from "node:url";
import { catalog, categories } from "./catalog.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const templatesRoot = path.resolve(here, "../templates");

function askChoice(rl, label, max) {
  return rl.question(`${label} (1-${max}): `);
}

function safeName(value) {
  const cleaned = value.trim().replace(/[^a-zA-Z0-9._-]/g, "-").replace(/^-+|-+$/g, "");
  if (!cleaned || cleaned === "." || cleaned === "..") throw new Error("Choose a valid folder name.");
  return cleaned;
}

async function copyTemplate(item, target) {
  const source = path.join(templatesRoot, item.template);
  await fs.access(source);
  await fs.cp(source, target, { recursive: true, errorOnExist: true, force: false });
}

async function installDependencies(target, dependencies, devDependencies = []) {
  const packageJsonPath = path.join(target, "package.json");
  const packageJson = {
    name: path.basename(target).toLowerCase().replace(/[^a-z0-9-]/g, "-"),
    version: "1.0.0",
    private: true,
    description: "FSD LabHub educational experiment",
    scripts: {},
    dependencies: Object.fromEntries(dependencies.map((name) => [name, "latest"]))
  };
  if (devDependencies.length) {
    packageJson.devDependencies = Object.fromEntries(devDependencies.map((name) => [name, "latest"]));
  }

  const isReact = itemForPath(target)?.category === "ReactJS";
  packageJson.scripts = isReact
    ? { dev: "vite", build: "vite build", preview: "vite preview" }
    : { start: "node server.js" };
  await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2) + "\n");
}

function itemForPath(target) {
  return selectedItem;
}
let selectedItem;

export async function scaffold(item, destination, options = {}) {
  const target = path.resolve(destination);
  try {
    await fs.access(target);
    throw new Error(`Destination already exists: ${target}`);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  await fs.mkdir(path.dirname(target), { recursive: true });
  await copyTemplate(item, target);
  selectedItem = item;
  const dependencies = item.dependencies ?? [];
  const devDependencies = item.devDependencies ?? [];
  await installDependencies(target, dependencies, devDependencies);

  if (options.install !== false && (dependencies.length || devDependencies.length)) {
    const { spawn } = await import("node:child_process");
    const npm = process.platform === "win32" ? "npm.cmd" : "npm";
    await new Promise((resolve, reject) => {
      const child = spawn(npm, ["install"], { cwd: target, stdio: "inherit", shell: process.platform === "win32" });
      child.once("error", reject);
      child.once("exit", (code) => code === 0 ? resolve() : reject(new Error(`npm install exited with code ${code}`)));
    });
  }
  return target;
}

export async function run() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  try {
    console.log("\n==========================================");
    console.log("              FSD LABHUB");
    console.log("       Free FSD Experiment Installer");
    console.log("==========================================\n");
    console.log("Select a category:");
    categories.forEach((category, index) => console.log(`  ${index + 1}. ${category}`));
    console.log(`  ${categories.length + 1}. All experiments`);
    const categoryChoice = Number(await askChoice(rl, "Your choice", categories.length + 1));
    if (!Number.isInteger(categoryChoice) || categoryChoice < 1 || categoryChoice > categories.length + 1) {
      throw new Error("Invalid category choice.");
    }

    const items = categoryChoice === categories.length + 1
      ? catalog
      : catalog.filter((item) => item.category === categories[categoryChoice - 1]);

    console.log("\nAvailable experiments:");
    items.forEach((item, index) => console.log(`  ${index + 1}. [${item.id}] ${item.title}`));
    console.log(`  ${items.length + 1}. Install all shown experiments`);
    const programChoice = Number(await askChoice(rl, "Your choice", items.length + 1));
    if (!Number.isInteger(programChoice) || programChoice < 1 || programChoice > items.length + 1) {
      throw new Error("Invalid experiment choice.");
    }

    const selected = programChoice === items.length + 1 ? items : [items[programChoice - 1]];
    const parent = safeName(await rl.question("\nDestination folder name (default: fsd-labs): ") || "fsd-labs");
    const base = path.resolve(process.cwd(), parent);
    await fs.mkdir(base, { recursive: true });

    for (const item of selected) {
      const destination = path.join(base, item.slug);
      console.log(`\nCreating ${item.title}...`);
      const target = await scaffold(item, destination);
      console.log(`Created: ${target}`);
      console.log(item.category === "ReactJS"
        ? `Next: cd ${path.relative(process.cwd(), target)} && npm run dev`
        : item.category === "MongoDB"
          ? `Open ${path.join(target, item.entry)} in mongosh or MongoDB Compass.`
          : `Next: cd ${path.relative(process.cwd(), target)} && npm start`);
    }
    console.log("\nDone. Read each experiment README before running it.");
  } finally {
    rl.close();
  }
}
