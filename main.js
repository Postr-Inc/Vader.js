#!/usr/bin/env bun

import { build, serve } from "bun";
import fs from "fs/promises";
import fsSync from "fs";
import path from "path";

const PROJECT_ROOT = process.cwd();
const APP_DIR = path.join(PROJECT_ROOT, "app");
const PUBLIC_DIR = path.join(PROJECT_ROOT, "public");
const DIST_DIR = path.join(PROJECT_ROOT, "dist");
const VADER_SRC = path.join(PROJECT_ROOT, "node_modules", "vaderjs", "index.js");
const VADER_DIST_DIR = path.join(DIST_DIR, "src", "vader");
const VADER_DIST_FILE = path.join(VADER_DIST_DIR, "index.js");
const SRC_DIR = path.join(PROJECT_ROOT, "src");

// Helper to debounce rebuilds
function debounce(fn, delay) {
  let timeoutId;
  return () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(fn, delay);
  };
}

// Load config with fallback
async function loadConfig() {
  let config;
  try {
    config = await import(path.join(PROJECT_ROOT, "vader.config.js"));
  } catch {
    config = {};
  }
  return config.default || config;
}

// defineConfig helper
export function defineConfig(config) {
  return config;
}

// Plugin system state
let htmlInjections = [];
const vaderAPI = {
  runCommand: async (cmd) => {
    if (typeof cmd === "string") cmd = cmd.split(" ");
    const p = Bun.spawn(cmd);
    await p.exited;
  },
  injectHTML: (content) => {
    htmlInjections.push(content);
  },
  log: (msg) => console.log(`[Vader Plugin] ${msg}`),
  getProjectRoot: () => PROJECT_ROOT,
  getDistDir: () => DIST_DIR,
  getPublicDir: () => PUBLIC_DIR,
};

// Run plugin hooks safely
async function runPluginHook(hookName) {
  if (!config.plugins) return;
  for (const plugin of config.plugins) {
    if (typeof plugin[hookName] === "function") {
      try {
        await plugin[hookName](vaderAPI);
      } catch (e) {
        console.error(`Plugin hook error (${hookName}):`, e);
      }
    }
  }
}

// Step 1: Transpile vaderjs index.ts
 async function transpileAndBundleVaderJS() {
  if (!fsSync.existsSync(VADER_SRC)) {
    console.error("vaderjs source not found:", VADER_SRC);
    process.exit(1);
  }

  // Step 1: Transpile vaderjs source from TypeScript/TSX to JavaScript (ESNext)
  const source = await fs.readFile(VADER_SRC, "utf8");
  const transpiler = new Bun.Transpiler({ loader: "tsx", target: "esnext" });
  const transpiledCode = transpiler.transformSync(source);

  // Step 2: Write the transpiled code to a temporary file
  const tempVaderFile = path.join(DIST_DIR, "vader-temp.js");
  await fs.mkdir(path.dirname(tempVaderFile), { recursive: true });
  await fs.writeFile(tempVaderFile, transpiledCode);

  console.log(`✅ Transpiled vaderjs to temporary file: ${tempVaderFile}`);

  // Step 3: Bundle the transpiled code using Bun's bundler or another bundler like esbuild
  await bundleVaderJS(tempVaderFile);

  // Clean up temporary file
  await fs.rm(tempVaderFile);
  console.log("✅ Cleaned up temporary files.");
}

// Function to bundle the transpiled vaderjs code
async function bundleVaderJS(inputFile) {
  await build({
    entrypoints: [inputFile],  // Input file is the transpiled code
    outdir: path.join(DIST_DIR, "src", "vader"),  // Output directory
    target: "browser",  // Bundling for the browser
    minify: false,  // You can change this to `true` for minification
    sourcemap: "external",  // Optional, for debugging
    external: [],  // Add any external dependencies here, if needed
    jsxFactory: "e",  // Set the JSX factory if using JSX (Vader's custom JSX)
    jsxFragment: "Fragment",
    jsxImportSource: "vaderjs",  // Set to "vaderjs" for JSX-related imports
  });

  console.log(`✅ Bundled vaderjs to ${DIST_DIR}/src/vader`);
}


// Step 2: Patch hooks usage in code
 function patchHooksUsage(code) {
  // Remove import of hooks from vaderjs
  code = code.replace(/import\s+{[^}]*use(State|Effect|Memo|Navigation)[^}]*}\s+from\s+['"]vaderjs['"];?\n?/g, "");

  

  return code;
}



// Step 3: Preprocess source files to patch hooks usage (recursively)
async function preprocessSources(srcDir, tempDir) {
  for (const entry of await fs.readdir(srcDir, { withFileTypes: true })) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(tempDir, entry.name);

    if (entry.isDirectory()) {
      await preprocessSources(srcPath, destPath);
    } else if (/\.(tsx|jsx|ts|js)$/.test(entry.name)) {
      try {
        let content = await fs.readFile(srcPath, "utf8");
        if (entry.name.endsWith(".tsx") || entry.name.endsWith(".jsx")) {
          content = patchHooksUsage(content);
        }
        await fs.mkdir(path.dirname(destPath), { recursive: true });
        await fs.writeFile(destPath, content);
      } catch (err) {
        console.warn(`Warning: Failed to process ${srcPath}:`, err.message);
      }
    } else {
      try {
        await fs.mkdir(path.dirname(destPath), { recursive: true });
        await fs.copyFile(srcPath, destPath);
      } catch (err) {
        console.warn(`Warning: Failed to copy ${srcPath}:`, err.message);
      }
    }
  }
}

// Step 4: Build source files from preprocessed directory
async function buildSrc() {
  const TEMP_SRC_DIR = path.join(PROJECT_ROOT, ".temp_src");

  // Clean previous temp directory
  if (fsSync.existsSync(TEMP_SRC_DIR)) {
    await fs.rm(TEMP_SRC_DIR, { recursive: true, force: true });
  }

  // Preprocess source to temp dir with hooks patched
  await preprocessSources(SRC_DIR, TEMP_SRC_DIR);

  // Gather all entrypoints from temp source dir
  function gatherEntryPoints(dir) {
    const entries = [];
    function walk(currentDir) {
      for (const entry of fsSync.readdirSync(currentDir, { withFileTypes: true })) {
        const fullPath = path.join(currentDir, entry.name);
        if (entry.isDirectory()) {
          walk(fullPath);
        } else if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) {
          entries.push(fullPath);
        }
      }
    }
    walk(dir);
    return entries;
  }
  const entrypoints = gatherEntryPoints(TEMP_SRC_DIR);

  if (entrypoints.length === 0) {
    console.log("No source files found to build.");
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

  console.log(`✅ Built ${entrypoints.length} source files preserving folder structure.`);
}

// Step 5: Copy public assets
async function copyPublicAssets() {
  if (!fsSync.existsSync(PUBLIC_DIR)) return;
  async function copyRecursive(src, dest) {
    await fs.mkdir(dest, { recursive: true });
    for (const item of await fs.readdir(src, { withFileTypes: true })) {
      const srcPath = path.join(src, item.name);
      const destPath = path.join(dest, item.name);
      if (item.isDirectory()) {
        await copyRecursive(srcPath, destPath);
      } else {
        await fs.copyFile(srcPath, destPath);
      }
    }
  }
  await copyRecursive(PUBLIC_DIR, path.join(DIST_DIR, "public"));
  console.log("✅ Copied public assets");
}

// Step 6: Build app entrypoints + generate index.html
function scanEntryPoints(dir) {
  const entries = [];
  function scan(dirPath, relative = "") {
    for (const file of fsSync.readdirSync(dirPath, { withFileTypes: true })) {
      if (file.isDirectory()) {
        scan(path.join(dirPath, file.name), path.join(relative, file.name));
      } else if (/index\.(jsx|tsx)$/.test(file.name)) {
        entries.push({
          name: relative ? relative.replace(/\\/g, "/") : "index",
          path: path.join(dirPath, file.name),
        });
      }
    }
  }
  scan(dir);
  return entries;
}

// Dev client reload script injection
const devClientScript = process.argv.includes("dev") ? `
  <script>
    const socket = new WebSocket("ws://" + location.host + "/__hmr");
    socket.onmessage = (msg) => {
      if (msg.data === "reload") location.reload();
    };
  </script>` : "";

 async function buildAppEntrypoints() {
  const entries = scanEntryPoints(APP_DIR);

  await Promise.all(
    entries.map(async ({ name, path: entryPath }) => {
      const outDir = path.join(DIST_DIR, path.dirname(name));
      const outJs = path.join(DIST_DIR, `${name}.js`);
      await fs.mkdir(outDir, { recursive: true });

      // Generate index.html next to JS bundle with plugin HTML injections
      const htmlPath = path.join(outDir, "index.html");
      
      // Collect CSS files
      const cssFiles = await collectCSSFiles(entryPath);
      const cssLinks = cssFiles.map(cssFile => `<link rel="stylesheet" href="${cssFile}">`).join("\n");

      const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>VaderJS App - ${name}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  ${cssLinks} <!-- Injected CSS files -->
  <script type="module">
    import App from '/index.js';
    import * as Vader from '/src/vader/index.js';
    var container = document.getElementById("app");
    Vader.render(Vader.createElement(App, null), container); 
  </script>
  ${htmlInjections.join("\n")}
  ${devClientScript}
</head>
<body>
  <div id="app"></div>
</body>
</html>`;
      
      await fs.writeFile(htmlPath, htmlContent);

      // Build app entrypoint (no hooks patch needed here)
      await build({
        entrypoints: [entryPath],
        outdir: DIST_DIR,
        target: "browser",
        minify: false,
        sourcemap: "external",
        external: ["vaderjs"],
      });

      // Replace imports from 'vaderjs' to '/src/vader/index.js' in output JS
      try {
        let jsContent = await fs.readFile(outJs, "utf8");
        jsContent = jsContent.replace(/from\s+['"]vaderjs['"]/g, `from '/src/vader/index.js'`);
        jsContent = patchHooksUsage(jsContent);
        await fs.writeFile(outJs, jsContent);
      } catch (err) {
        console.warn(`Warning: Failed to patch app entrypoint JS for ${name}:`, err.message);
      }

      console.log(`✅ Built app entrypoint: ${name}`);
    })
  );
}

// Step 7: Collect CSS Files for Injection
async function collectCSSFiles(entryPath) {
  const cssFiles = [];
  // Check if the entrypoint or its dependencies import CSS
  const content = await fs.readFile(entryPath, "utf8");
  const cssImports = content.match(/import\s+['"](.*\.css)['"]/g) || [];
  for (const cssImport of cssImports) {
    const match = /['"](.*\.css)['"]/.exec(cssImport);
    if (match && match[1]) {
      const cssPath = path.resolve(path.dirname(entryPath), match[1]);
      const distCssPath = path.relative(PROJECT_ROOT, cssPath);
      cssFiles.push(`/${distCssPath}`);
    }
  }
  return cssFiles;
}

 

// Step 7: Build all steps with plugin hooks and html injection reset
async function buildAll() {
  htmlInjections = []; // reset on each build

  await runPluginHook("onBuildStart");

  await buildSrc();
  await transpileVaderJS();
  await buildAppEntrypoints();

  await runPluginHook("onBuildFinish");

  await copyPublicAssets();

  console.log("✅ Build finished");
}

const clients = new Set();

async function main() {
  config = await loadConfig();

  if (!config.port) config.port = 3000;

  console.log("Starting build...");
  await buildAll();

  if (process.argv.includes("dev") || process.env.NODE_ENV === "development") {
    console.log(`Starting dev server at http://localhost:${config.port}`);

    const server = serve({
      port: config.port,
      fetch(req, server) {
        const url = new URL(req.url);

        if (url.pathname === "/__hmr" && server.upgrade) {
          const success = server.upgrade(req, { data: {} });
          return success ? undefined : new Response("WebSocket upgrade failed", { status: 400 });
        }

        let filePath = path.join(DIST_DIR, url.pathname);
        if (!path.extname(filePath) || filePath.endsWith("/")) {
          filePath = path.join(filePath, "index.html");
        }

        try {
          const file = Bun.file(filePath);
          return file.exists() ? new Response(file) : new Response("Not Found", { status: 404 });
        } catch {
          return new Response("Error", { status: 500 });
        }
      },
      websocket: {
        open(ws) {
          clients.add(ws);
        },
        close(ws) {
          clients.delete(ws);
        },
        message(ws, message) {
          console.log("WS message:", message);
        },
      },
    });

    // Watch files and rebuild with debounce + broadcast reload
    const watcherDirs = [APP_DIR, SRC_DIR, PUBLIC_DIR];
    for (const dir of watcherDirs) {
      if (fsSync.existsSync(dir)) {
        const debouncedBuild = debounce(async () => {
          try {
            await buildAll();
            for (const client of clients) {
              client.send("reload");
            }
          } catch (e) {
            console.error("Build error:", e);
          }
        }, 200);

        fsSync.watch(dir, { recursive: true }, () => {
          debouncedBuild();
        });
      }
    }
  }
}

let config = {};
main();
