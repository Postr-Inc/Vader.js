#!/usr/bin/env bun

import fs from "fs/promises";
import fsSync from "fs";
import path from "path"; 
 import readline from "readline";

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

async function run(cmd: string, args: string[] = []) {
  try {
    const proc = Bun.spawn([cmd, ...args], {
      stdout: "inherit",
      stderr: "inherit",
    });
    
    const status = await proc.exited;
    if (status !== 0) {
      console.error(`Command failed: ${cmd} ${args.join(" ")}`);
      process.exit(1);
    }
  } catch (error) {
    console.error(`Error executing command: ${error}`);
    process.exit(1);
  }
}
async function init() {
  console.log("🚀 Welcome to Vader.js project initializer!");

  const cwd = process.cwd();
  let projectDir = await ask(
    `Enter the directory to initialize the project (default: current dir):`
  );
  if (!projectDir) projectDir = ".";

  projectDir = path.resolve(cwd, projectDir);
  if (!fsSync.existsSync(projectDir)) {
    await fs.mkdir(projectDir, { recursive: true });
    console.log(`Created directory: ${projectDir}`);
  }

  // Confirm Tailwind usage
  let useTailwind = await ask("Include TailwindCSS v4 support? (y/n):");
  while (!["y", "n", "yes", "no"].includes(useTailwind)) {
    useTailwind = await ask("Please answer 'y' or 'n':");
  }
  const wantsTailwind = useTailwind === "y" || useTailwind === "yes";

  // Create folders: app, src, public
  const appDir = path.join(projectDir, "app");
  const srcDir = path.join(projectDir, "src");
  const publicDir = path.join(projectDir, "public");

  for (const dir of [appDir, srcDir, publicDir]) {
    if (!fsSync.existsSync(dir)) {
      await fs.mkdir(dir, { recursive: true });
      console.log(`Created folder: ${dir}`);
    }
  }

  // Create example app/index.jsx with counter
  const counterCode = wantsTailwind
    ? `import { useState } from "vaderjs";

export default function Counter() {
  let [count, setCount] = useState(0);
  return (
    <div class="max-w-md mx-auto p-6 bg-gray-100 rounded shadow text-center">
      <h1 class="text-2xl font-bold mb-4">Counter Example</h1>
      <p class="text-xl mb-4">Count: {count}</p>
      <button
        class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        onClick={() => setCount(count + 1)}
      >
        Increment
      </button>
    </div>
  );
}
`
    : `import { useState } from "vaderjs";

export default function Counter() {
  let [count, setCount] = useState(0);
  return (
    <div style={{ maxWidth: "300px", margin: "auto", padding: "1rem", background: "#eee", borderRadius: "8px", textAlign: "center" }}>
      <h1 style={{ fontWeight: "bold", marginBottom: "1rem" }}>Counter Example</h1>
      <p style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
`;

  await fs.writeFile(path.join(appDir, "index.jsx"), counterCode);
  console.log(`Created example route: ${path.join("app", "index.jsx")}`);

  // Create public/styles.css
  if (wantsTailwind) {
    await fs.writeFile(path.join(publicDir, "styles.css"), `@import 'tailwindcss';\n`);
  } else {
    await fs.writeFile(path.join(publicDir, "styles.css"), `/* Add your styles here */\n`);
  }
  console.log(`Created public/styles.css`);

  // Create minimal package.json if not exist
  const pkgJsonPath = path.join(projectDir, "package.json");
  if (!fsSync.existsSync(pkgJsonPath)) {
    const pkg = {
      name: path.basename(projectDir),
      version: "1.0.0",
      scripts: {
        start: "bun run vaderjs build && bun run vaderjs serve",
        build: "bun run vaderjs build",
        dev: "bun run vaderjs dev",
      },
      dependencies: {
        vaderjs: "latest",
      },
    };
    await fs.writeFile(pkgJsonPath, JSON.stringify(pkg, null, 2));
    console.log(`Created package.json`);
  }

  // Install dependencies: vaderjs + optionally tailwindcss, postcss plugins
  console.log("Installing dependencies with Bun...");
  const deps = ["vaderjs"];
  if (wantsTailwind) {
    deps.push("tailwindcss", "@tailwindcss/postcss", "postcss-cli");
  }
  await run("bun", ["install", ...deps]);
  console.log("✅ Dependencies installed.");

  // If Tailwind requested, create minimal tailwind.config.cjs and postcss.config.cjs
  if (wantsTailwind) {
    const tailwindConfig = `module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};`;
    await fs.writeFile(path.join(projectDir, "tailwind.config.cjs"), tailwindConfig);
    console.log("Created tailwind.config.cjs");

    const postcssConfig = `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};`;
    await fs.writeFile(path.join(projectDir, "postcss.config.cjs"), postcssConfig);
    console.log("Created postcss.config.cjs");
  }

  console.log(`\n🎉 Vader.js project initialized at:\n${projectDir}`);
  console.log("Run `bun run dev` or your build script to get started.");
}

init().catch((e) => {
  console.error("Initialization failed:", e);
  process.exit(1);
});
