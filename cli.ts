#!/usr/bin/env bun

import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import readline from "readline";

const cwd = process.cwd();

/* ---------------------------------- utils --------------------------------- */

function ask(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) =>
    rl.question(question + " ", (answer) => {
      rl.close();
      resolve(answer.trim());
    })
  );
}

async function run(cmd, args = []) {
  const proc = Bun.spawn([cmd, ...args], {
    stdout: "inherit",
    stderr: "inherit",
  });

  const status = await proc.exited;
  if (status !== 0) process.exit(status);
}

function logSection(title) {
  console.log(`\n${title}`);
  console.log("─".repeat(title.length));
}

function getFlags() {
  return new Set(process.argv.slice(2));
}

/* ---------------------------------- init ---------------------------------- */

export async function initProject(dir) {
  const flags = getFlags();
  const autoYes = flags.has("--yes");

  console.log("🚀 Initializing Vader.js project");

  const projectDir = path.resolve(cwd, dir || ".");
  if (!fsSync.existsSync(projectDir)) {
    await fs.mkdir(projectDir, { recursive: true });
  }

  const files = fsSync.readdirSync(projectDir);
  if (files.length && !autoYes) {
    const confirm = await ask("Directory is not empty. Continue? (y/n):");
    if (confirm !== "y") process.exit(0);
  }

  logSection("📁 Creating folders");

  for (const d of ["app", "public"]) {
    const p = path.join(projectDir, d);
    if (!fsSync.existsSync(p)) {
      await fs.mkdir(p, { recursive: true });
      console.log(`created ${d}/`);
    }
  }

  logSection("🧱 Writing files");

  await fs.writeFile(
    path.join(projectDir, "app/index.jsx"),
    `import { component, useState } from "vaderjs";

export default component(() => {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(c => c + 1)}>
      Count: {count}
    </button>
  );
});
`
  );

  await fs.writeFile(
    path.join(projectDir, "public/styles.css"),
    `/* Global styles (optional) */`
  );

  await fs.writeFile(
    path.join(projectDir, "vaderjs.config.ts"),
    `import defineConfig from "vaderjs/config";

export default defineConfig({
  port: 3000,
  plugins: [],
});
`
  );

  if (!fsSync.existsSync(path.join(projectDir, "package.json"))) {
    await fs.writeFile(
      path.join(projectDir, "package.json"),
      JSON.stringify(
        {
          name: path.basename(projectDir),
          private: true,
          scripts: {
            dev: "vaderjs dev",
            build: "vaderjs build",
            start: "vaderjs serve",
          },
          dependencies: {
            vaderjs: "latest",
          },
        },
        null,
        2
      )
    );
  }

  logSection("📦 Installing dependencies");
  await run("bun", ["install", "--force"]);

  console.log("\n✅ Project ready");
  console.log("Run `bun run dev` to start");
}

/* ---------------------------------- add ----------------------------------- */

export async function addPlugin(name) {
  if (!name) {
    console.error("Please specify a plugin to add.");
    process.exit(1);
  }

  const flags = getFlags();
  const force = flags.has("--force");

  const pkgName = name.startsWith("vaderjs-") ? name : `vaderjs-${name}`;
  const importName = pkgName.replace(/^vaderjs-/, "").replace(/-/g, "_");

  logSection(`➕ Adding plugin: ${pkgName}`);

 const args = ["add", pkgName];
if (force) args.push("--force");

await run("bun", args);

  const configPath = path.join(cwd, "vaderjs.config.ts");
  if (!fsSync.existsSync(configPath)) {
    console.warn("⚠️  vaderjs.config.ts not found, skipping registration");
    return;
  }

  let config = await fs.readFile(configPath, "utf8");

  if (config.includes(`from "${pkgName}"`)) {
    console.log("ℹ️  Plugin already registered");
    return;
  }

  config =
    `import ${importName} from "${pkgName}";\n` +
    config.replace(/plugins:\s*\[/, `plugins: [${importName}, `);

  await fs.writeFile(configPath, config);
  console.log("✔ Plugin registered");
}

/* -------------------------------- remove ---------------------------------- */

export async function removePlugin(name) {
  if (!name) {
    console.error("Please specify a plugin to remove.");
    process.exit(1);
  }

  const pkgName = name.startsWith("vaderjs-") ? name : `vaderjs-${name}`;
  const importName = pkgName.replace(/^vaderjs-/, "").replace(/-/g, "_");

  logSection(`➖ Removing plugin: ${pkgName}`);

  await run("bun", ["remove", pkgName]);

  const configPath = path.join(cwd, "vaderjs.config.ts");
  if (!fsSync.existsSync(configPath)) return;

  let config = await fs.readFile(configPath, "utf8");

  config = config
    .replace(new RegExp(`import ${importName} from ".*?";\\n?`, "g"), "")
    .replace(new RegExp(`\\b${importName},?\\s*`, "g"), "");

  await fs.writeFile(configPath, config);
  console.log("✔ Plugin removed");
}

/* ---------------------------------- list ---------------------------------- */

export async function listPlugins() {
  const pkgPath = path.join(cwd, "package.json");
  if (!fsSync.existsSync(pkgPath)) {
    console.log("No package.json found.");
    return;
  }

  const pkg = JSON.parse(await fs.readFile(pkgPath, "utf8"));
  const deps = Object.keys(pkg.dependencies || {}).filter((d) =>
    d.startsWith("vaderjs-")
  );

  if (!deps.length) {
    console.log("No Vader plugins installed.");
    return;
  }

  logSection("🔌 Installed Vader plugins");
  deps.forEach((d) => console.log("•", d));
}
 