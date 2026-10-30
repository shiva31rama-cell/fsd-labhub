import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import readline from "node:readline/promises";
import { fileURLToPath } from "node:url";
import { catalog, categories } from "./catalog.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(here, "..");
const templatesRoot = path.join(packageRoot, "templates");

function safeFolderName(value) {
  const cleaned = value.trim().replace(/[^a-zA-Z0-9._-]/g, "-").replace(/^-+|-+$/g, "");
  if (!cleaned || cleaned === "." || cleaned === "..") throw new Error("Enter a valid folder name.");
  return cleaned;
}

function assertInside(parent, child) {
  const relative = path.relative(parent, child);
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error("Selected path is outside the permitted project directory.");
  }
}

async function exists(target) {
  try { await fs.access(target); return true; }
  catch (error) { if (error.code === "ENOENT") return false; throw error; }
}

function installNpmDependencies(cwd) {
  return new Promise((resolve, reject) => {
    const command = process.platform === "win32" ? "npm.cmd" : "npm";
    const child = spawn(command, ["install"], { cwd, stdio: "inherit", shell: process.platform === "win32" });
    child.once("error", reject);
    child.once("exit", (code) => code === 0 ? resolve() : reject(new Error(`npm install exited with code ${code ?? "unknown"}`)));
  });
}

export async function scaffold(item, destination, options = {}) {
  if (!catalog.some((entry) => entry.id === item.id)) throw new Error("Unknown experiment.");
  const target = path.resolve(destination);
  const source = path.resolve(templatesRoot, item.template);
  assertInside(templatesRoot, source);
  if (await exists(target)) throw new Error(`Destination already exists: ${target}`);

  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.cp(source, target, { recursive: true, errorOnExist: true, force: false });

  if (item.category !== "MongoDB") {
    const isReact = item.category === "ReactJS";
    const dependencies = item.dependencies ?? [];
    const devDependencies = item.devDependencies ?? [];
    const manifest = {
      name: path.basename(target).toLowerCase().replace(/[^a-z0-9-]/g, "-"),
      version: "1.0.0",
      private: true,
      description: `FSD LabHub educational experiment: ${item.title}`,
      scripts: isReact ? { dev: "vite", build: "vite build", preview: "vite preview" } : { start: "node server.js" },
      dependencies: Object.fromEntries(dependencies.map((name) => [name, "*"]))
    };
    if (devDependencies.length) manifest.devDependencies = Object.fromEntries(devDependencies.map((name) => [name, "*"]));
    await fs.writeFile(path.join(target, "package.json"), JSON.stringify(manifest, null, 2) + "\n", "utf8");
    if (options.install !== false && (dependencies.length || devDependencies.length)) await installNpmDependencies(target);
  }
  return target;
}

async function chooseNumber(rl, prompt, maximum) {
  const number = Number(await rl.question(`${prompt} (1-${maximum}): `));
  if (!Number.isInteger(number) || number < 1 || number > maximum) throw new Error("Invalid selection. Run the installer again and choose a listed number.");
  return number;
}

function showExperiments(items) {
  items.forEach((item, index) => console.log(`  ${index + 1}. [${item.id}] ${item.title}`));
  console.log(`  ${items.length + 1}. Install all listed experiments`);
}

export async function run() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  try {
    console.log("\n==========================================");
    console.log("                 FSD LABHUB");
    console.log("        Free FSD Experiment Installer");
    console.log("==========================================\n");
    console.log("Select a category:");
    categories.forEach((category, index) => console.log(`  ${index + 1}. ${category}`));
    console.log(`  ${categories.length + 1}. All categories (18 experiments)`);

    const categoryChoice = await chooseNumber(rl, "Your choice", categories.length + 1);
    const items = categoryChoice === categories.length + 1 ? catalog : catalog.filter((item) => item.category === categories[categoryChoice - 1]);
    console.log("\nAvailable experiments:");
    showExperiments(items);

    const programChoice = await chooseNumber(rl, "Your choice", items.length + 1);
    const selected = programChoice === items.length + 1 ? items : [items[programChoice - 1]];
    const parentInput = (await rl.question("\nDestination folder (default: fsd-labs): ")).trim() || "fsd-labs";
    const base = path.resolve(process.cwd(), safeFolderName(parentInput));

    if (await exists(base)) {
      const proceed = (await rl.question("Folder already exists. Add experiment folders inside it? (y/N): ")).trim().toLowerCase();
      if (proceed !== "y" && proceed !== "yes") throw new Error("Cancelled to avoid changing an existing folder.");
    }
    await fs.mkdir(base, { recursive: true });
    const answer = (await rl.question("Install npm dependencies now? (Y/n): ")).trim().toLowerCase();
    const install = answer !== "n" && answer !== "no";

    for (const item of selected) {
      const destination = path.resolve(base, item.slug);
      assertInside(base, destination);
      console.log(`\nCreating [${item.id}] ${item.title}...`);
      const target = await scaffold(item, destination, { install });
      console.log(`Created: ${path.relative(process.cwd(), target)}`);
      if (item.category === "ReactJS") console.log(`Run: cd "${path.relative(process.cwd(), target)}" && npm run dev`);
      else if (item.category === "ExpressJS") console.log(`Run: cd "${path.relative(process.cwd(), target)}" && npm start`);
      else console.log(`Open "${path.join(target, item.entry)}" in mongosh or MongoDB Compass.`);
    }

    console.log("\nAll selected experiments have been created.");
    if (!install) console.log("Dependencies were not installed. Run npm install inside each ExpressJS/ReactJS project.");
    console.log("MongoDB exercises require a MongoDB server and mongosh. Read the README in each experiment folder.");
  } finally {
    rl.close();
  }
}
