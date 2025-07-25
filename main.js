#!/usr/bin/env bun
/**
 * VaderJS Build & Development Script
 *
 * This script handles building the VaderJS framework, your application code,
 * and serving it in a local development environment with live reloading.
 *
 * Commands:
 * bun run vaderjs build   -  Builds the project for production.
 * bun run vaderjs dev     -  Starts the dev server with HMR and file watching.
 * bun run vaderjs serve   -  Builds and serves the production output.
 */

import { build, serve } from "bun";
import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import { init } from "./cli";

// --- UTILITIES for a Sleek CLI ---

const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

function safeWatch(dir, cb) {
  try {
    const watcher = fsSync.watch(dir, { recursive: true }, cb);
    watcher.on("error", (err) => logger.warn(`Watcher error on ${dir}:`, err));
    return watcher;
  } catch (err) {
    logger.warn(`Failed to watch ${dir}:`, err);
  }
}


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
const APP_DIR = path.join(PROJECT_ROOT, "app");
const PUBLIC_DIR = path.join(PROJECT_ROOT, "public");
const DIST_DIR = path.join(PROJECT_ROOT, "dist");
const SRC_DIR = path.join(PROJECT_ROOT, "src");
const VADER_SRC_PATH = path.join(PROJECT_ROOT, "node_modules", "vaderjs", "index.ts");
const TEMP_SRC_DIR = path.join(PROJECT_ROOT, ".vader_temp_src");


// --- CONFIG & PLUGIN SYSTEM ---

let config = {};
let htmlInjections = [];

const vaderAPI = {
  runCommand: async (cmd) => {
    if (typeof cmd === "string") cmd = cmd.split(" ");
    const p = Bun.spawn(cmd);
    await p.exited;
  },
  injectHTML: (content) => htmlInjections.push(content),
  log: (msg) => logger.info(`[Plugin] ${msg}`),
  getProjectRoot: () => PROJECT_ROOT,
  getDistDir: () => DIST_DIR,
  getPublicDir: () => PUBLIC_DIR,
};

async function loadConfig() {
  try {
    const configModule = await import(path.join(PROJECT_ROOT, "vaderjs.config.js"));
    return configModule.default || configModule;
  } catch {
    logger.warn("No 'vader.config.js' found, using defaults.");
    return {};
  }
}

export function defineConfig(config) {
  return config;
}

async function runPluginHook(hookName) {
  if (!config.plugins) return;
  for (const plugin of config.plugins) {
    if (typeof plugin[hookName] === "function") {
      try {
        await plugin[hookName](vaderAPI);
      } catch (e) {
        logger.error(`Plugin hook error (${hookName} in ${plugin.name || 'anonymous'}):`, e);
      }
    }
  }
}



// --- BUILD LOGIC ---

/**
 * Step 1: Transpile and bundle the core vaderjs library.
 */
async function buildVaderCore() {
  if (!fsSync.existsSync(VADER_SRC_PATH)) {
    logger.error("VaderJS source not found:", VADER_SRC_PATH);
    throw new Error("Missing vaderjs dependency.");
  }

  await build({
    entrypoints: [VADER_SRC_PATH],
    outdir: path.join(DIST_DIR, "src", "vader"),
    target: "browser",
    minify: false,
    sourcemap: "external",
    jsxFactory: "e",
    jsxFragment: "Fragment",
    jsxImportSource: "vaderjs",
  });
}

/**
 * Step 2: Patches source code to remove server-side hook imports.
 */
function patchHooksUsage(code) {
  return code.replace(/import\s+{[^}]*use(State|Effect|Memo|Navigation)[^}]*}\s+from\s+['"]vaderjs['"];?\n?/g, "");
}

/**
 * Step 3: Pre-processes all files in `/src` into a temporary directory.
 */
async function preprocessSources(srcDir, tempDir) {
  await fs.mkdir(tempDir, { recursive: true });
  for (const entry of await fs.readdir(srcDir, { withFileTypes: true })) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(tempDir, entry.name);

    if (entry.isDirectory()) {
      await preprocessSources(srcPath, destPath);
    } else if (/\.(tsx|jsx|ts|js)$/.test(entry.name)) {
      let content = await fs.readFile(srcPath, "utf8");
      content = patchHooksUsage(content);
      await fs.writeFile(destPath, content);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

/**
 * Step 4: Build the application's source code from the preprocessed temp directory.
 */
async function buildSrc() {
  if (!fsSync.existsSync(SRC_DIR)) return;

  if (fsSync.existsSync(TEMP_SRC_DIR)) {
    await fs.rm(TEMP_SRC_DIR, { recursive: true, force: true });
  }
  await preprocessSources(SRC_DIR, TEMP_SRC_DIR);

  const entrypoints = fsSync.readdirSync(TEMP_SRC_DIR, { recursive: true })
    .map(file => path.join(TEMP_SRC_DIR, file))
    .filter(file => /\.(ts|tsx|js|jsx)$/.test(file));

  if (entrypoints.length === 0) {
    logger.info("No source files found in /src to build.");
    return;
  }

  await build({
    entrypoints,
    outdir: path.join(DIST_DIR, "src"),
    root: TEMP_SRC_DIR,
    naming: { entry: "[dir]/[name].js" },
    jsxFactory: "e",
    jsxFragment: "Fragment",
    jsxImportSource: "vaderjs",
    target: "browser",
    minify: false,
    external: ["vaderjs"],
  });
}

/**
 * Step 5: Copy all assets from the `/public` directory to `/dist`.
 */
async function copyPublicAssets() {
  if (!fsSync.existsSync(PUBLIC_DIR)) return;
  // Copy contents of public into dist, not the public folder itself
  for (const item of await fs.readdir(PUBLIC_DIR)) {
    await fs.cp(path.join(PUBLIC_DIR, item), path.join(DIST_DIR, item), { recursive: true });
  }
}

 async function buildAppEntrypoints(isDev = false) {
  if (!fsSync.existsSync(APP_DIR)) {
    logger.warn("No '/app' directory found, skipping app entrypoint build.");
    return;
  }

  // Ensure the dist directory exists
  if (!fsSync.existsSync(DIST_DIR)) {
    await fs.mkdir(DIST_DIR, { recursive: true });
  }

  const devClientScript = isDev ? ` 
  <script>
    new WebSocket("ws://" + location.host + "/__hmr").onmessage = (msg) => {
      if (msg.data === "reload") location.reload();
    };
  </script>` : "";

  const entries = fsSync.readdirSync(APP_DIR, { recursive: true })
    .filter(file => /index\.(jsx|tsx)$/.test(file))
    .map(file => ({
        name: path.dirname(file) === '.' ? 'index' : path.dirname(file).replace(/\\/g, '/'),
        path: path.join(APP_DIR, file)
    }));

  for (const { name, path: entryPath } of entries) {
    // Check for the specific case where 'name' could be 'index.js' and prevent duplication
    const outDir = path.join(DIST_DIR, name === 'index' ? '' : name);
    const outJsPath = path.join(outDir, 'index.js');  // Output JavaScript file path

    // Ensure the output directory exists
    await fs.mkdir(outDir, { recursive: true });

    // **FIXED CSS HANDLING**: Find, copy, and correctly link CSS files
    const cssLinks = [];
    const cssContent = await fs.readFile(entryPath, "utf8");
    const cssImports = [...cssContent.matchAll(/import\s+['"](.*\.css)['"]/g)];

    for (const match of cssImports) {
        const cssImportPath = match[1]; // e.g., './styles.css'
        const sourceCssPath = path.resolve(path.dirname(entryPath), cssImportPath);
        if (fsSync.existsSync(sourceCssPath)) {
            const relativeCssPath = path.relative(APP_DIR, sourceCssPath);
            const destCssPath = path.join(DIST_DIR, relativeCssPath);

            await fs.mkdir(path.dirname(destCssPath), { recursive: true });
            await fs.copyFile(sourceCssPath, destCssPath);

            const htmlRelativePath = path.relative(outDir, destCssPath).replace(/\\/g, '/');
            cssLinks.push(`<link rel="stylesheet" href="${htmlRelativePath}">`);
        } else {
            logger.warn(`CSS file not found: ${sourceCssPath}`);
        }
    }

    // Update the script tag to use relative paths for index.js
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>VaderJS App - ${name}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  ${cssLinks.join("\n  ")}
  ${htmlInjections.join("\n  ")}
</head>
<body>
  <div id="app"></div>
  <script type="module">
    import App from '${name !== 'index' ? "/" + name : ''}/index.js'; 
    import * as Vader from '/src/vader/index.js';
    window.Vader = Vader
    Vader.render(Vader.createElement(App, null), document.getElementById("app"));
  </script>
  ${devClientScript}
</body>
</html>`;

    await fs.writeFile(path.join(outDir, "index.html"), htmlContent);

    // Log for debugging 

    // Build the JavaScript file and ensure it uses the correct paths
    await build({
      entrypoints: [entryPath],
      outdir: outDir,  // Pass the directory path to outdir 
      target: "browser",
      minify: false,
      sourcemap: "external",
      external: ["vaderjs"],
      jsxFactory: "e",
      jsxFragment: "Fragment",
      jsxImportSource: "vaderjs",
    });

    // After build, replace the 'vaderjs' import to the correct path
    let jsContent = await fs.readFile(outJsPath, "utf8");
    jsContent = jsContent.replace(/from\s+['"]vaderjs['"]/g, `from '/src/vader/index.js'`);
    await fs.writeFile(outJsPath, jsContent);
  }
}

 

 async function buildAll(isDev = false) {
  logger.info(`Starting VaderJS ${isDev ? 'development' : 'production'} build...`);
  const totalTime = performance.now();

  htmlInjections = [];

  // Ensure dist directory exists before cleaning
  if (fsSync.existsSync(DIST_DIR)) {
    await fs.rm(DIST_DIR, { recursive: true, force: true });
  }

  // Create the dist directory if it doesn't exist
  await fs.mkdir(DIST_DIR, { recursive: true });

  await runPluginHook("onBuildStart");

  // Build the components in steps and handle errors properly
  await timedStep("Building VaderJS Core", buildVaderCore);
  await timedStep("Building App Source (/src)", buildSrc);
  await timedStep("Copying Public Assets", copyPublicAssets);
  await timedStep("Building App Entrypoints (/app)", () => buildAppEntrypoints(isDev));

  await runPluginHook("onBuildFinish");

  // Calculate the total duration and log it
  const duration = (performance.now() - totalTime).toFixed(2);
  logger.success(`Total build finished in ${duration}ms. Output is in /dist.`);
}

async function runDevServer() {
  await buildAll(true);
  
  const clients = new Set();
  const port = config.port || 3000;

  logger.info(`Starting dev server at http://localhost:${port}`);

  serve({
    port,
    fetch(req, server) {
      const url = new URL(req.url);
      if (url.pathname === "/__hmr" && server.upgrade(req)) {
        return;
      }
      let filePath = path.join(DIST_DIR, url.pathname);
      if (!path.extname(filePath)) {
        filePath = path.join(filePath, "index.html");
      }
      const file = Bun.file(filePath);
      return file.exists().then(exists => 
        exists ? new Response(file) : new Response("Not Found", { status: 404 })
      );
    },
    websocket: {
      open: (ws) => clients.add(ws),
      close: (ws) => clients.delete(ws),
    },
  });

  const debouncedBuild = debounce(async () => {
    try {
      await buildAll(true);
      for (const client of clients) {
        client.send("reload");
      }
    } catch (e) {
      logger.error("Rebuild failed:", e);
    }
  }, 200);

  const watchDirs = [APP_DIR, SRC_DIR, PUBLIC_DIR].filter(fsSync.existsSync);
  for (const dir of watchDirs) {
    safeWatch(dir, debouncedBuild);
  }
}

async function runProdServer() {
  const port = config.port || 3000;
  logger.info(`Serving production build from /dist on http://localhost:${port}`);
  serve({
    port,
    fetch(req) {
      const url = new URL(req.url);
      let filePath = path.join(DIST_DIR, url.pathname);
      if (!path.extname(filePath)) {
        filePath = path.join(filePath, "index.html");
      }
      const file = Bun.file(filePath);
      return file.exists().then(exists => 
        exists ? new Response(file) : new Response("Not Found", { status: 404 })
      );
    },
  });
}

function debounce(fn, delay) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

// --- SCRIPT ENTRYPOINT ---

async function main() {
  const banner = `${colors.magenta}
    __     __  ____   ____   _______  __
   |  |   /  |/ __ \ / __ \ / ____/ |/ /
   |  |  /   / / / // /_/ // /___   |   / 
   |  | /   / /_/ / \____// /___  /   |  
   |____/____/_____/     /_____/ |_| |_|
  ${colors.reset}`;

console.log(banner);

  
  config = await loadConfig();
  config.port = config.port || 3000;

  const command = process.argv[2];

  if (command === "dev") {
    await runDevServer();
  } else if (command === "build") {
    await buildAll(false);
  } else if (command === "serve") {
    await buildAll(false);
    await runProdServer();
  }
  else if(command === "init"){
    init().catch((e) => {
  console.error("Initialization failed:", e);
  process.exit(1);
});

  } else {
    logger.error(`Unknown command: '${command}'.`);
    logger.info("Available commands: 'dev', 'build', 'serve'");
    process.exit(1);
  }
}

main().catch(err => {
  logger.error("An unexpected error occurred:", err);
  process.exit(1);
});
process.on("unhandledRejection", (err) => {
  logger.error("Unhandled Promise rejection:", err);
});
process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception:", err);
});
