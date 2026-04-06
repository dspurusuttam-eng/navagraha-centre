import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const workspaceRoot = join(process.cwd(), "src");
const inspectedExtensions = new Set([".ts", ".tsx"]);
const violations: string[] = [];

function walkDirectory(directoryPath: string) {
  for (const entry of readdirSync(directoryPath)) {
    const entryPath = join(directoryPath, entry);
    const entryStats = statSync(entryPath);

    if (entryStats.isDirectory()) {
      walkDirectory(entryPath);
      continue;
    }

    const extension = entryPath.slice(entryPath.lastIndexOf("."));

    if (!inspectedExtensions.has(extension)) {
      continue;
    }

    const source = readFileSync(entryPath, "utf8");

    if (/<img\b/i.test(source)) {
      violations.push(entryPath);
    }
  }
}

walkDirectory(workspaceRoot);

if (violations.length) {
  console.error(
    "Raw <img> usage detected. Use next/image for optimized assets:"
  );

  for (const filePath of violations) {
    console.error(`- ${filePath}`);
  }

  process.exitCode = 1;
} else {
  console.log("Image optimization check passed. No raw <img> tags were found.");
}
