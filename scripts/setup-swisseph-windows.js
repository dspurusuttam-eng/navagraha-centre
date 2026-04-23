/* eslint-disable @typescript-eslint/no-require-imports */
const { execFileSync, spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

if (process.platform !== "win32") {
  console.error("setup:swisseph:windows is only supported on Windows.");
  process.exit(1);
}

const repoRoot = path.resolve(__dirname, "..");
const swissephDir = path.join(repoRoot, "node_modules", "swisseph");
const programFilesX86 =
  process.env["ProgramFiles(x86)"] || "C:\\Program Files (x86)";
const vsWherePath = path.join(
  programFilesX86,
  "Microsoft Visual Studio",
  "Installer",
  "vswhere.exe",
);

function run(command, args, options = {}) {
  const isCmdShim = process.platform === "win32" && command.toLowerCase().endsWith(".cmd");

  const result = spawnSync(command, args, {
    cwd: options.cwd || repoRoot,
    env: { ...process.env, ...(options.env || {}) },
    stdio: options.capture ? "pipe" : "inherit",
    encoding: "utf8",
    shell: isCmdShim,
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    const details = options.capture
      ? [result.stdout, result.stderr].filter(Boolean).join("\n")
      : "";
    throw new Error(
      `Command failed (${command} ${args.join(" ")}): ${result.status}${
        details ? `\n${details}` : ""
      }`,
    );
  }

  return (result.stdout || "").trim();
}

function runInVsCommandPrompt(vsInstallPath, workingDirectory, nodeGypPath, step) {
  const vcVarsPath = path.join(
    vsInstallPath,
    "VC",
    "Auxiliary",
    "Build",
    "vcvars64.bat",
  );

  if (!fs.existsSync(vcVarsPath)) {
    throw new Error(`Missing Visual Studio vcvars64.bat at ${vcVarsPath}`);
  }

  const pythonPath = detectPython();
  const commandFilePath = path.join(
    workingDirectory,
    `.codex-swisseph-${step}.cmd`,
  );
  const commandFileContent = [
    "@echo off",
    `set "PYTHON=${pythonPath}"`,
    `set "npm_config_python=${pythonPath}"`,
    `call "${vcVarsPath}"`,
    `node "${nodeGypPath}" ${step} --verbose`,
  ].join("\r\n");

  fs.writeFileSync(commandFilePath, commandFileContent, "utf8");

  try {
    run(path.basename(commandFilePath), [], {
      cwd: workingDirectory,
    });
  } finally {
    fs.rmSync(commandFilePath, { force: true });
  }
}

function detectPython() {
  const candidates = [
    process.env.PYTHON,
    process.env.npm_config_python,
    process.env.python,
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  const resolvers = [
    () =>
      run("python", ["-c", "import sys; print(sys.executable)"], {
        capture: true,
      }),
    () =>
      run("py", ["-3", "-c", "import sys; print(sys.executable)"], {
        capture: true,
      }),
  ];

  for (const resolver of resolvers) {
    try {
      const resolved = resolver();
      if (resolved && fs.existsSync(resolved)) {
        return resolved;
      }
    } catch {
      // keep trying other resolvers
    }
  }

  throw new Error(
    "Python 3 was not found. Install Python 3 and make sure it is available in PowerShell.",
  );
}

function detectVsInstallPath() {
  if (!fs.existsSync(vsWherePath)) {
    throw new Error(`vswhere.exe was not found at ${vsWherePath}`);
  }

  const output = execFileSync(
    vsWherePath,
    [
      "-products",
      "*",
      "-requires",
      "Microsoft.VisualStudio.Workload.VCTools",
      "-version",
      "[17.0,18.0)",
      "-format",
      "json",
    ],
    { encoding: "utf8" },
  );

  const instances = JSON.parse(output);
  const preferred = instances.find((instance) => instance.installationPath);

  if (!preferred) {
    throw new Error(
      "Visual Studio 2022 Build Tools with Desktop C++ workload were not found.",
    );
  }

  return preferred.installationPath;
}

function resolveNodeGypPath() {
  const candidates = [
    path.join(repoRoot, "node_modules", "node-gyp", "bin", "node-gyp.js"),
    path.join(
      swissephDir,
      "node_modules",
      "node-gyp",
      "bin",
      "node-gyp.js",
    ),
  ];

  const found = candidates.find((candidate) => fs.existsSync(candidate));

  if (!found) {
    throw new Error("node-gyp was not found after installing swisseph.");
  }

  return found;
}

function patchProjectFile(filePath, options) {
  let content = fs.readFileSync(filePath, "utf8");
  let changed = false;

  if (content.includes("<PlatformToolset>ClangCL</PlatformToolset>")) {
    content = content.replaceAll(
      "<PlatformToolset>ClangCL</PlatformToolset>",
      "<PlatformToolset>v143</PlatformToolset>",
    );
    changed = true;
  }

  if (options.addCpp20 && !content.includes("<LanguageStandard>stdcpp20</LanguageStandard>")) {
    content = content.replaceAll(
      "<MultiProcessorCompilation>true</MultiProcessorCompilation>",
      [
        "<MultiProcessorCompilation>true</MultiProcessorCompilation>",
        "      <LanguageStandard>stdcpp20</LanguageStandard>",
      ].join("\n"),
    );
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, content, "utf8");
  }
}

function verifySwissephLoad() {
  const output = run(
    "node",
    [
      "-e",
      [
        "const swe = require('swisseph');",
        "if (typeof swe.swe_calc_ut !== 'function') {",
        "  throw new Error('swisseph loaded without swe_calc_ut');",
        "}",
        "console.log('swisseph-ready');",
      ].join(" "),
    ],
    { cwd: repoRoot, capture: true },
  );

  if (!output.includes("swisseph-ready")) {
    throw new Error("swisseph verification did not complete.");
  }
}

function main() {
  console.log("Installing swisseph without native scripts...");
  run("npm.cmd", ["install", "swisseph", "--ignore-scripts", "--no-save"], {
    cwd: repoRoot,
  });

  if (!fs.existsSync(swissephDir)) {
    throw new Error(`swisseph directory was not created at ${swissephDir}`);
  }

  const vsInstallPath = detectVsInstallPath();
  const nodeGypPath = resolveNodeGypPath();

  console.log(`Using Visual Studio Build Tools at ${vsInstallPath}`);
  console.log("Configuring swisseph native build...");
  runInVsCommandPrompt(vsInstallPath, swissephDir, nodeGypPath, "configure");

  patchProjectFile(path.join(swissephDir, "build", "swisseph.vcxproj"), {
    addCpp20: true,
  });
  patchProjectFile(
    path.join(swissephDir, "build", "deps", "swisseph", "swissephz.vcxproj"),
    { addCpp20: false },
  );

  console.log("Building swisseph with MSVC v143 + C++20...");
  runInVsCommandPrompt(vsInstallPath, swissephDir, nodeGypPath, "build");

  console.log("Verifying swisseph runtime load...");
  verifySwissephLoad();
  console.log("swisseph is ready on this Windows machine.");
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
