#!/usr/bin/env bun

import { build, serve } from "bun";
import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import { initProject } from "vaderjs/cli";

const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

globalThis.isDev = process.argv[2] === "dev";

const logger = {
  _log: (color, ...args) => console.log(color, ...args, colors.reset),
  info: (...args) => logger._log(colors.cyan, "ℹ", ...args),
  success: (...args) => logger._log(colors.green, "✅", ...args),
  warn: (...args) => logger._log(colors.yellow, "⚠️", ...args),
  error: (...args) => logger._log(colors.red, "❌", ...args),
  step: (...args) => logger._log(colors.magenta, "\n🚀", ...args),
};

async function timedStep(name, fn) {
  logger.step(`${name}...`);
  const start = performance.now();
  try {
    await fn();
    const duration = (performance.now() - start).toFixed(2);
    logger.success(`Finished '${name}' in ${duration}ms`);
  } catch (e) {
    logger.error(`Error during '${name}':`, e);
    if (!isDev) process.exit(1);
  }
}

// --- CONSTANTS ---

const PROJECT_ROOT = process.cwd();
const PUBLIC_DIR = path.join(PROJECT_ROOT, "public");
const DIST_DIR = path.join(PROJECT_ROOT, "dist");
const SRC_DIR = path.join(PROJECT_ROOT, "src");
const APP_DIR = path.join(PROJECT_ROOT, "app");

const VADER_SRC_PATH = path.join(
  PROJECT_ROOT,
  "node_modules",
  "vaderjs",
  "index.ts"
);

const TEMP_SRC_DIR = path.join(PROJECT_ROOT, ".vader_temp_src");

let config: any = {};
let htmlInjections: string[] = [];

// --- JSConfig Setup ---

async function ensureJSConfig() {
  const jsconfigPath = path.join(PROJECT_ROOT, "jsconfig.json");
  
  // Check if jsconfig.json already exists
  let existingConfig = {};
  if (fsSync.existsSync(jsconfigPath)) {
    try {
      const content = await fs.readFile(jsconfigPath, "utf8");
      existingConfig = JSON.parse(content);
    } catch (e) {
      logger.warn("Existing jsconfig.json is invalid, will overwrite");
    }
  }
  
  // Define the required VaderJS configuration
  const vaderConfig = {
    compilerOptions: {
      jsx: "react",
      jsxFactory: "Vader.createElement",
      jsxFragmentFactory: "Fragment"
    }
  };
  
  // Merge with existing config (preserve other settings)
  const mergedConfig = {
    ...existingConfig,
    compilerOptions: {
      ...(existingConfig.compilerOptions || {}),
      ...vaderConfig.compilerOptions
    }
  };
  
  // Write the config
  await fs.writeFile(jsconfigPath, JSON.stringify(mergedConfig, null, 2));
  logger.success(`jsconfig.json created/updated at ${jsconfigPath}`);
}

// --- FILE WATCHER ---

class FileWatcher {
  watchers = new Map<string, any>();
  callbacks: ((file: string) => void)[] = [];

  watch(dir: string) {
    if (!fsSync.existsSync(dir)) return;

    const watcher = fsSync.watch(dir, { recursive: true }, (_, filename) => {
      if (!filename) return;

      const file = path.join(dir, filename);

      if (
        file.includes("node_modules") ||
        file.includes("dist") ||
        file.includes(".git")
      )
        return;

      this.callbacks.forEach((cb) => cb(file));
    });

    this.watchers.set(dir, watcher);
  }

  onChange(cb: (file: string) => void) {
    this.callbacks.push(cb);
  }

  clear() {
    this.watchers.forEach((w) => w.close());
    this.watchers.clear();
  }
}

const watcher = new FileWatcher();

// --- CONFIG ---

export async function loadConfig() {
  try {
    const mod = await import(path.join(PROJECT_ROOT, "vaderjs.config.js"));
    return mod.default || mod;
  } catch {
    return {};
  }
}

export function defineConfig(cfg: any) {
  return cfg;
}

// --- BUILD HELPERS ---

function patchHooksUsage(code: string) {
  return code.replace(
    /import\s+{[^}]*use(State|Effect|Memo)[^}]*}\s+from\s+['"]vaderjs['"];?\n?/g,
    ""
  );
}

async function preprocessSources(src: string, dest: string) {
  await fs.mkdir(dest, { recursive: true });

  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await preprocessSources(srcPath, destPath);
    } else if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) {
      let content = await fs.readFile(srcPath, "utf8");
      content = patchHooksUsage(content);
      await fs.writeFile(destPath, content);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

async function buildVaderCore() {
  if (!fsSync.existsSync(VADER_SRC_PATH)) {
    throw new Error("Missing vaderjs dependency");
  }

  await build({
    entrypoints: [VADER_SRC_PATH],
    outdir: path.join(DIST_DIR, "src", "vader"),
    target: "browser",
    jsxFactory: "e",
    jsxFragment: "Fragment",
    jsxImportSource: "vaderjs",
    sourcemap: "external",
  });
}

async function buildSrc() {
  if (!fsSync.existsSync(SRC_DIR)) return;

  if (fsSync.existsSync(TEMP_SRC_DIR)) {
    await fs.rm(TEMP_SRC_DIR, { recursive: true, force: true });
  }

  await preprocessSources(SRC_DIR, TEMP_SRC_DIR);

  const entrypoints: string[] = [];

  function collect(dir: string) {
    const files = fsSync.readdirSync(dir, { withFileTypes: true });

    for (const f of files) {
      const full = path.join(dir, f.name);

      if (f.isDirectory()) collect(full);
      else if (/\.(ts|tsx|js|jsx)$/.test(f.name)) entrypoints.push(full);
    }
  }

  collect(TEMP_SRC_DIR);

  if (!entrypoints.length) return;

  await build({
    entrypoints,
    outdir: path.join(DIST_DIR, "src"),
    root: TEMP_SRC_DIR,
    naming: { entry: "[dir]/[name].js" },
    jsxFactory: "e",
    jsxFragment: "Fragment",
    jsxImportSource: "vaderjs",
    target: "browser",
    external: ["vaderjs"],
  });
}

async function copyPublicAssets() {
  if (!fsSync.existsSync(PUBLIC_DIR)) return;

  const items = await fs.readdir(PUBLIC_DIR);

  for (const item of items) {
    await fs.cp(
      path.join(PUBLIC_DIR, item),
      path.join(DIST_DIR, item),
      { recursive: true }
    );
  }
}

// Helper function to find App file
function findAppFile(): string | null {
  const possiblePaths = [
    path.join(PROJECT_ROOT, "App.tsx"),
    path.join(PROJECT_ROOT, "App.jsx"),
    path.join(PROJECT_ROOT, "App.ts"),
    path.join(PROJECT_ROOT, "App.js"),
    path.join(APP_DIR, "index.tsx"),
    path.join(APP_DIR, "index.jsx"),
  ];
  
  for (const appPath of possiblePaths) {
    if (fsSync.existsSync(appPath)) {
      return appPath;
    }
  }
  
  return null;
}

async function buildAppEntrypoints() {
  // First check for root App file (VaderJS standard)
  const appFile = findAppFile();
  
  if (appFile) {
    logger.info(`Building App from: ${appFile}`);
    
    await build({
      entrypoints: [appFile],
      outdir: DIST_DIR,
      target: "browser",
      jsxFactory: "e",
      jsxFragment: "Fragment",
      jsxImportSource: "vaderjs",
      naming: "index.js",
      external: [], // Bundle everything for website
    });

    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Vader App</title>
</head>
<body>
<div id="app"></div>
<script type="module" src="/index.js"></script>
</body>
</html>`;

    await fs.writeFile(path.join(DIST_DIR, "index.html"), html);
    return;
  }
  
  // Fallback to app directory structure
  if (!fsSync.existsSync(APP_DIR)) {
    logger.warn("No App.tsx or app directory found");
    return;
  }

  const entries = fsSync
    .readdirSync(APP_DIR, { recursive: true })
    .filter((f) => /index\.(tsx|jsx)$/.test(f as string))
    .map((f) => ({
      name:
        path.dirname(f as string) === "."
          ? "index"
          : path.dirname(f as string),
      path: path.join(APP_DIR, f as string),
    }));

  for (const entry of entries) { 
    var outDir = path.join(DIST_DIR, entry.name === "index" ? "" : entry.name); 

    await fs.mkdir(outDir, { recursive: true });
    console.log("Building entrypoint:", entry.path);
    await build({
      entrypoints: [entry.path],
      outdir: outDir,
      target: "browser",
      jsxFactory: "e",
      jsxFragment: "Fragment",
      jsxImportSource: "vaderjs",
      external: [], // Bundle everything for website
    });

    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Vader App</title>
</head>
<body>
<div id="app"></div>
<script type="module" src="/index.js"></script>
</body>
</html>`;

    await fs.writeFile(path.join(outDir, "index.html"), html);
  }
}

async function buildAll(dev = false) {
  const start = performance.now();

  // Ensure jsconfig.json exists before building
  await ensureJSConfig();

  if (fsSync.existsSync(DIST_DIR)) {
    await fs.rm(DIST_DIR, { recursive: true, force: true });
  }

  await fs.mkdir(DIST_DIR, { recursive: true });

  await timedStep("Build Vader Core", buildVaderCore);
  await timedStep("Build Src", buildSrc);
  await timedStep("Copy Public", copyPublicAssets);
  await timedStep("Build App", buildAppEntrypoints);

  logger.success(
    `Build finished in ${(performance.now() - start).toFixed(1)}ms`
  );
}

// --- DEV SERVER ---

async function runDevServer() {
  await buildAll(true);

  const clients = new Set<any>();

  const port = config.port || 3000;

  const server = serve({
    port,

    fetch(req, server) {
      const url = new URL(req.url);

      if (url.pathname === "/__hmr" && server.upgrade(req)) return;

      let filePath = path.join(DIST_DIR, url.pathname);

      if (!path.extname(filePath)) {
        filePath = path.join(filePath, "index.html");
      }
      
      // Ensure we're serving from dist directory
      if (url.pathname === "/" || url.pathname === "") {
        filePath = path.join(DIST_DIR, "index.html");
      }
      
      console.log("Serving:", filePath);

      const file = Bun.file(filePath);

      return file.exists().then((exists) =>
        exists
          ? new Response(file)
          : new Response("Not Found", { status: 404 })
      );
    },

    websocket: {
      open(ws) {
        clients.add(ws);
      },
      close(ws) {
        clients.delete(ws);
      },
    },
  });

  watcher.watch(APP_DIR);
  watcher.watch(SRC_DIR);
  watcher.watch(PUBLIC_DIR);
  
  // Also watch for root App file
  const rootAppDir = path.dirname(findAppFile() || "");
  if (rootAppDir && rootAppDir !== PROJECT_ROOT) {
    watcher.watch(rootAppDir);
  }

  watcher.onChange(async () => {
    logger.info("Changes detected, rebuilding...");
    await buildAll(true);

    for (const c of clients) c.send("reload");
  });

  logger.success(`Dev server running http://localhost:${port}`);
}

// --- PROD SERVER ---

async function runProdServer() {
  const port = config.port || 3000;
  
  const server = serve({
    port,
    fetch(req) {
      const url = new URL(req.url);
      let filePath = path.join(DIST_DIR, url.pathname);
      
      if (!path.extname(filePath)) {
        filePath = path.join(filePath, "index.html");
      }
      
      if (url.pathname === "/" || url.pathname === "") {
        filePath = path.join(DIST_DIR, "index.html");
      }
      
      const file = Bun.file(filePath);
      
      return file.exists().then((exists) =>
        exists
          ? new Response(file)
          : new Response("Not Found", { status: 404 })
      );
    },
  });
  
  logger.success(`Serving production http://localhost:${port}`);
}

// --- CLI ENTRY ---

async function main() {
  console.log(`${colors.magenta}
    __     __  ____   ____   _______  __
   |  |   /  |/ __ \\ / __ \\ / ____/ |/ /
   |  |  /   / / / // /_/ // /___   |   /
   |  | /   / /_/ / \\____// /___  /   |
   |____/____/_____/     /_____/ |_| |_|
${colors.reset}`);

  const cmd = process.argv[2];

  if (cmd === "init") {
    await initProject(process.argv[3]);
    // Also create jsconfig.json when initializing a new project
    await ensureJSConfig();
    return;
  }

  config = await loadConfig();
  config.port ||= 3000;

  switch (cmd) {
    case "dev":
      await runDevServer();
      break;

    case "build":
      await buildAll(false);
      break;

    case "serve":
      await buildAll(false);
      await runProdServer();
      break;

    default:
      logger.info(`
Commands:
  dev        Start development server with hot reload
  build      Build for production
  serve      Build and serve production build
  init       Initialize a new VaderJS project

Make sure you have:
  - App.tsx or App.jsx in your project root
  - OR an app/ directory with index.tsx/jsx files
  - vaderjs installed as a dependency
`);
  }
}

main();