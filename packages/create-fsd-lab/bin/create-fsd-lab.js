#!/usr/bin/env node
import { run } from "../src/cli.js";

run().catch((error) => {
  console.error("\nFSD LabHub installer failed:", error.message);
  process.exitCode = 1;
});
