import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import readline from "node:readline/promises";
import { fileURLToPath } from "node:url";
import { catalog, categories } from "./catalog.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(here, "..");
const templatesRoot = path.join(packageRoot, "templates");
const workspaceName = "fsd-labhub-generated-labs";
const npmInstallArgs = ["install", "--no-audit", "--no-fund", "--prefer-offline"];

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

export function buildWorkspaceManifest(items) {
  const workspaces = [...new Set(items
    .filter((item) => item.category !== "MongoDB")
    .map((item) => item.slug))];

  if (workspaces.length === 0) return null;

  return {
    name: workspaceName,
    version: "1.0.0",
    private: true,
    description: "Shared dependency installation for generated FSD LabHub experiments",
    workspaces
  };
}

async function ensureWorkspaceManifest(base, items) {
  const generatedManifest = buildWorkspaceManifest(items);
  if (!generatedManifest) return false;

  const manifestPath = path.join(base, "package.json");
  if (await exists(manifestPath)) {
    let existing;
    try {
      existing = JSON.parse(await fs.readFile(manifestPath, "utf8"));
    } catch {
      return false;
    }

    // Only update a workspace manifest that FSD LabHub itself created.
    // Never overwrite a student's unrelated package.json.
    if (existing.name !== workspaceName || existing.private !== true || !Array.isArray(existing.workspaces)) {
      return false;
    }

    existing.workspaces = [...new Set([...existing.workspaces, ...generatedManifest.workspaces])];
    await fs.writeFile(manifestPath, JSON.stringify(existing, null, 2) + "\n", "utf8");
    return true;
  }

  await fs.writeFile(manifestPath, JSON.stringify(generatedManifest, null, 2) + "\n", "utf8");
  return true;
}

function installNpmDependencies(cwd) {
  return new Promise((resolve, reject) => {
    // npm.cmd is a Windows command script. Invoke it through cmd.exe without
    // enabling Node's deprecated shell:true argument handling.
    const windows = process.platform === "win32";
    const command = windows ? (process.env.ComSpec || "cmd.exe") : "npm";
    const args = windows
      ? ["/d", "/c", "npm.cmd install --no-audit --no-fund --prefer-offline"]
      : npmInstallArgs;

    const child = spawn(command, args, { cwd, stdio: "inherit" });
    child.once("error", reject);
    child.once("exit", (code) => code === 0
      ? resolve()
      : reject(new Error(`npm install exited with code ${code ?? "unknown"}`)));
  });
}

export async function scaffold(item, destination) {
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

function printRunInstructions(base, selected) {
  for (const item of selected) {
    const target = path.join(base, item.slug);
    const relative = path.relative(process.cwd(), target) || ".";
    if (item.category === "ReactJS") {
      console.log(`Run ReactJS: cd "${relative}" && npm run dev`);
    } else if (item.category === "ExpressJS") {
      console.log(`Run ExpressJS: cd "${relative}" && npm start`);
    } else {
      console.log(`MongoDB file: ${path.join(relative, item.entry)} (run with mongosh --file)`);
    }
  }
}

async function finishInstallation(base, selected, install) {
  const nodeItems = selected.filter((item) => item.category !== "MongoDB");
  const workspaceMode = await ensureWorkspaceManifest(base, selected);

  if (install && nodeItems.length > 0) {
    if (workspaceMode) {
      console.log("\nInstalling shared dependencies once for all selected ExpressJS/ReactJS projects...");
      await installNpmDependencies(base);
      console.log("Shared dependencies installed. npm workspaces avoids repeating downloads for each lab.");
    } else {
      console.log("\nAn existing parent package.json was preserved. Installing dependencies separately in each selected project...");
      for (const item of nodeItems) {
        await installNpmDependencies(path.join(base, item.slug));
      }
    }
  } else if (!install && nodeItems.length > 0) {
    if (workspaceMode) {
      const relative = path.relative(process.cwd(), base) || ".";
      console.log(`Install all selected ExpressJS/ReactJS dependencies once: cd "${relative}" && npm install --no-audit --no-fund --prefer-offline`);
    } else {
      console.log("Dependencies were not installed. Run npm install inside each generated ExpressJS/ReactJS project.");
    }
  }

  if (selected.some((item) => item.category === "MongoDB")) {
    console.log("MongoDB exercises require mongosh and a reachable MongoDB server or Atlas deployment. They do not install a database server.");
  }

  printRunInstructions(base, selected);
}

export async function run() {
  const args = process.argv.slice(2);
  const readOption = (name, fallback = undefined) => {
    const index = args.indexOf(name);
    return index >= 0 ? args[index + 1] : fallback;
  };

  if (args.includes("--help") || args.includes("-h")) {
    console.log("FSD LabHub installer");
    console.log("Global install: npm install --global create-fsd-lab");
    console.log("Run globally: create-fsd-lab");
    console.log("One-time run: npx create-fsd-lab");
    console.log("Install all: create-fsd-lab --all --dir fsd-labs");
    console.log("Install category: create-fsd-lab --category ExpressJS --dir express-labs");
    console.log("Install one: create-fsd-lab --experiment 01a --dir routing-lab");
    console.log("Add --no-install to create projects without downloading npm dependencies.");
    return;
  }

  const nonInteractive = args.includes("--all") || args.includes("--category") || args.includes("--experiment");
  if (nonInteractive) {
    let selected;
    if (args.includes("--all")) {
      selected = catalog;
    } else if (args.includes("--category")) {
      const category = readOption("--category");
      selected = catalog.filter((item) => item.category.toLowerCase() === String(category ?? "").toLowerCase());
      if (!selected.length) throw new Error("Unknown category. Use ExpressJS, ReactJS or MongoDB.");
    } else {
      const experiment = readOption("--experiment");
      selected = catalog.filter((item) =>
        item.id.toLowerCase() === String(experiment ?? "").toLowerCase()
        || item.slug.toLowerCase() === String(experiment ?? "").toLowerCase()
      );
      if (!selected.length) throw new Error("Unknown experiment ID or slug. Check the project README.");
    }

    const folder = safeFolderName(readOption("--dir", "fsd-labs"));
    const base = path.resolve(process.cwd(), folder);
    if (await exists(base)) throw new Error(`Destination folder already exists: ${base}`);
    await fs.mkdir(base, { recursive: true });

    for (const item of selected) {
      const destination = path.resolve(base, item.slug);
      assertInside(base, destination);
      console.log(`Creating [${item.id}] ${item.title}...`);
      const target = await scaffold(item, destination);
      console.log(`Created: ${path.relative(process.cwd(), target)}`);
    }

    await finishInstallation(base, selected, !args.includes("--no-install"));
    console.log(`\nSuccessfully created ${selected.length} experiment project(s) in ${folder}.`);
    return;
  }

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
      const target = await scaffold(item, destination);
      console.log(`Created: ${path.relative(process.cwd(), target)}`);
    }

    await finishInstallation(base, selected, install);
    console.log("\nAll selected experiments have been created.");
  } finally {
    rl.close();
  }
}
