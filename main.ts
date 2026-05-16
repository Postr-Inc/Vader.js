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
    if (!globalThis.isDev) process.exit(1);
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

// --- Plugin Support ---

interface Plugin {
  name: string;
  version: string;
  description?: string;
  onBuildStart?: (api: PluginAPI) => Promise<void> | void;
  onBuildFinish?: (api: PluginAPI) => Promise<void> | void;
  onFileChange?: (file: string, api: PluginAPI) => Promise<void> | void;
}

interface PluginAPI {
  injectHTML(html: string, id?: string): void;
  addWatchPath(path: string): void;
  config: any;
  isDev: boolean;
  distDir: string;
  srcDir: string;
  publicDir: string;
  projectRoot: string;
}

let plugins: Plugin[] = [];

// Track HTML injections with IDs to prevent duplicates
class HTMLInjectionManager {
  private injections: Map<string, string> = new Map();
  
  add(html: string, id?: string): void {
    const injectionId = id || this.generateId(html);
    
    if (!this.injections.has(injectionId)) {
      this.injections.set(injectionId, html);
      logger.info(`Added HTML injection: ${injectionId}`);
    } else {
      logger.info(`Skipping duplicate HTML injection: ${injectionId}`);
    }
  }
  
  private generateId(html: string): string {
    const hrefMatch = html.match(/href=["']([^"']+)["']/);
    if (hrefMatch) {
      return `link:${hrefMatch[1]}`;
    }
    
    const srcMatch = html.match(/src=["']([^"']+)["']/);
    if (srcMatch) {
      return `script:${srcMatch[1]}`;
    }
    
    const nameMatch = html.match(/(?:name|property)=["']([^"']+)["']/);
    if (nameMatch) {
      return `meta:${nameMatch[1]}`;
    }
    
    let hash = 0;
    for (let i = 0; i < html.length; i++) {
      hash = ((hash << 5) - hash) + html.charCodeAt(i);
      hash |= 0;
    }
    return `injection:${Math.abs(hash)}`;
  }
  
  getAll(): string[] {
    return Array.from(this.injections.values());
  }
  
  clear(): void {
    this.injections.clear();
  }
}

const htmlInjectionManager = new HTMLInjectionManager();

// Create plugin API helper
function createPluginAPI(): PluginAPI {
  return {
    injectHTML: (html: string, id?: string) => {
      htmlInjectionManager.add(html, id);
    },
    addWatchPath: (watchPath: string) => {
      if (fsSync.existsSync(watchPath)) {
        watcher.watch(watchPath);
      }
    },
    config: config,
    isDev: globalThis.isDev,
    distDir: DIST_DIR,
    srcDir: SRC_DIR,
    publicDir: PUBLIC_DIR,
    projectRoot: PROJECT_ROOT
  };
}

// Run plugin hooks
async function runPluginHook(hookName: 'onBuildStart' | 'onBuildFinish', api: PluginAPI) {
  for (const plugin of plugins) {
    if (plugin[hookName]) {
      try {
        logger.info(`Running plugin hook: ${plugin.name} - ${hookName}`);
        await plugin[hookName]!(api);
      } catch (e) {
        logger.error(`Error in plugin "${plugin.name}" during ${hookName}:`, e);
        if (!globalThis.isDev) process.exit(1);
      }
    }
  }
}

// Load plugins from config
async function loadPluginsFromConfig() {
  if (!config.plugins || !Array.isArray(config.plugins)) {
    logger.info("No plugins defined in config");
    return;
  }

  const loadedPlugins: Plugin[] = [];
  
  for (const pluginConfig of config.plugins) {
    try {
      let plugin;
      
      if (typeof pluginConfig === 'string') {
        const pluginPath = path.isAbsolute(pluginConfig) 
          ? pluginConfig 
          : path.join(PROJECT_ROOT, pluginConfig);
        
        if (fsSync.existsSync(pluginPath)) {
          const pluginModule = await import(pluginPath);
          plugin = pluginModule.default || pluginModule;
        } else {
          plugin = await import(pluginConfig);
        }
      } 
      else if (typeof pluginConfig === 'object' && pluginConfig.resolve) {
        const pluginModule = await import(pluginConfig.resolve);
        plugin = pluginModule.default || pluginModule;
        
        if (typeof plugin === 'function' && pluginConfig.options) {
          plugin = await plugin(pluginConfig.options);
        }
      }
      else if (typeof pluginConfig === 'object' && pluginConfig.name) {
        plugin = pluginConfig;
      }
      
      if (plugin && typeof plugin === 'object' && plugin.name) {
        loadedPlugins.push(plugin);
        logger.success(`Loaded plugin: ${plugin.name} v${plugin.version || 'unknown'}`);
      } else {
        logger.warn(`Invalid plugin: missing name property`);
      }
    } catch (e) {
      logger.error(`Failed to load plugin:`, e);
    }
  }
  
  plugins = loadedPlugins;
}

// Also load from plugins directory
async function loadPluginsFromDirectory() {
  const pluginsDir = path.join(PROJECT_ROOT, "plugins");
  
  if (!fsSync.existsSync(pluginsDir)) {
    return;
  }
  
  const pluginFiles = await fs.readdir(pluginsDir);
  const loadedPlugins: Plugin[] = [];
  
  for (const file of pluginFiles) {
    if (file.endsWith('.js') || file.endsWith('.ts')) {
      try {
        const pluginPath = path.join(pluginsDir, file);
        const pluginModule = await import(pluginPath);
        const plugin = pluginModule.default || pluginModule;
        
        if (plugin && typeof plugin === 'object' && plugin.name) {
          if (!plugins.some(p => p.name === plugin.name)) {
            loadedPlugins.push(plugin);
            logger.info(`Loaded plugin from directory: ${plugin.name} v${plugin.version}`);
          }
        } else {
          logger.warn(`Invalid plugin in ${file}: missing name property`);
        }
      } catch (e) {
        logger.error(`Failed to load plugin ${file}:`, e);
      }
    }
  }
  
  plugins = [...plugins, ...loadedPlugins];
}

// --- JSConfig Setup ---

async function ensureJSConfig() {
  const jsconfigPath = path.join(PROJECT_ROOT, "jsconfig.json");
  
  let existingConfig = {};
  if (fsSync.existsSync(jsconfigPath)) {
    try {
      const content = await fs.readFile(jsconfigPath, "utf8");
      existingConfig = JSON.parse(content);
    } catch (e) {
      logger.warn("Existing jsconfig.json is invalid, will overwrite");
    }
  }
  
  const vaderConfig = {
    compilerOptions: {
      jsx: "react",
      jsxFactory: "Vader.createElement",
      jsxFragmentFactory: "Fragment"
    }
  };
  
  const mergedConfig = {
    ...existingConfig,
    compilerOptions: {
      ...(existingConfig.compilerOptions || {}),
      ...vaderConfig.compilerOptions
    }
  };
  
  await fs.writeFile(jsconfigPath, JSON.stringify(mergedConfig, null, 2));
  logger.success(`jsconfig.json created/updated at ${jsconfigPath}`);
}

// --- FILE WATCHER ---

class FileWatcher {
  watchers = new Map<string, any>();
  callbacks: ((file: string) => void)[] = [];
  private debounceTimer: NodeJS.Timeout | null = null;
  private pendingFiles = new Set<string>();
  private rebuildInProgress = false;

  watch(dir: string) {
    if (!fsSync.existsSync(dir)) return;

    try {
      const watcher = fsSync.watch(dir, { recursive: true }, (event, filename) => {
        if (!filename) return;

        const file = path.join(dir, filename);

        if (
          file.includes("node_modules") ||
          file.includes("dist") ||
          file.includes(".git") ||
          file.includes(".vader_temp_src")
        )
          return;

        this.pendingFiles.add(file);
        
        if (this.debounceTimer) {
          clearTimeout(this.debounceTimer);
        }
        
        this.debounceTimer = setTimeout(() => {
          const files = Array.from(this.pendingFiles);
          this.pendingFiles.clear();
          
          if (!this.rebuildInProgress) {
            this.callbacks.forEach((cb) => {
              files.forEach(file => cb(file));
            });
          }
        }, 100);
      });

      this.watchers.set(dir, watcher);
    } catch (error) {
      logger.warn(`Failed to watch directory ${dir}:`, error);
    }
  }

  onChange(cb: (file: string) => void) {
    this.callbacks.push(cb);
  }
  
  setRebuildStatus(status: boolean) {
    this.rebuildInProgress = status;
  }

  clear() {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    this.watchers.forEach((w) => w.close());
    this.watchers.clear();
  }
}

const watcher = new FileWatcher();

// --- CONFIG ---

export async function loadConfig() {
  try {
    const configPath = path.join(PROJECT_ROOT, "vaderjs.config.ts");
    if (fsSync.existsSync(configPath)) {
      const mod = await import(configPath);
      return mod.default || mod;
    }
    return {};
  } catch (error) {
    logger.warn("Failed to load config, using defaults:", error);
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

function getUniqueInjections(injections: string[]): string[] {
  const seen = new Set<string>();
  const unique: string[] = [];
  
  for (const injection of injections) {
    let key = injection;
    
    const hrefMatch = injection.match(/href=["']([^"']+)["']/);
    if (hrefMatch) {
      key = `link:${hrefMatch[1]}`;
    }
    
    const srcMatch = injection.match(/src=["']([^"']+)["']/);
    if (srcMatch) {
      key = `script:${srcMatch[1]}`;
    }
    
    const nameMatch = injection.match(/(?:name|property)=["']([^"']+)["']/);
    if (nameMatch) {
      key = `meta:${nameMatch[1]}`;
    }
    
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(injection);
    }
  }
  
  return unique;
}

// --- VERCEL CONFIG GENERATION ---

async function generateVercelConfig(routes: { route: string; htmlPath: string }[]) {
  if (config.host_provider !== "vercel") {
    logger.info("Hosting provider is not 'vercel', skipping vercel.json generation");
    return;
  }

  logger.info("🔧 Generating Vercel configuration for deployment...");

  // Build the vercel.json configuration
  const vercelConfig: any = {
    version: 2,
    buildCommand: "bun run build",
    outputDirectory: "dist",
    installCommand: "bun install",
    framework: null,
    rewrites: [],
  };

  // Add specific rewrites for each generated HTML route
  for (const route of routes) {
    if (route.route === "index") {
      // Root route
      vercelConfig.rewrites.push({
        source: "/",
        destination: "/dist/index.html",
      });
    } else {
      // Nested route - exact match
      vercelConfig.rewrites.push({
        source: `/${route.route}`,
        destination: `/dist/${route.route}/index.html`,
      });
      // Also handle subpaths (for client-side routing)
      vercelConfig.rewrites.push({
        source: `/${route.route}/:path*`,
        destination: `/dist/${route.route}/index.html`,
      });
    }
  }

  // Fallback for static assets (CSS, JS, images)
  vercelConfig.rewrites.push({
    source: "/:path*",
    destination: "/dist/:path*",
  });

  // Final fallback for any unmatched routes (SPA behavior)
  vercelConfig.rewrites.push({
    source: "/(.*)",
    destination: "/dist/index.html",
  });

  // Remove duplicate rewrites (keep first occurrence for each source pattern)
  const uniqueRewrites = [];
  const seenSources = new Set();
  for (const rewrite of vercelConfig.rewrites) {
    if (!seenSources.has(rewrite.source)) {
      seenSources.add(rewrite.source);
      uniqueRewrites.push(rewrite);
    }
  }
  vercelConfig.rewrites = uniqueRewrites;

  // Write vercel.json to PROJECT ROOT (not inside dist)
  const vercelPath = path.join(PROJECT_ROOT, "vercel.json");
  await fs.writeFile(vercelPath, JSON.stringify(vercelConfig, null, 2));
  
  logger.success(`✅ vercel.json generated at ${vercelPath}`);
  logger.info(`   Routes configured to serve from ./dist directory`);
  logger.info(`   ${routes.length} route(s) configured`);
}

async function generateVercelProjectConfig() {
  if (config.hosting !== "vercel") return;
  
  const vercelDir = path.join(PROJECT_ROOT, ".vercel");
  await fs.mkdir(vercelDir, { recursive: true });
  
  const projectConfig = {
    projectId: config.vercelProjectId || "",
    orgId: config.vercelOrgId || "",
    settings: {
      framework: null,
      devCommand: "bun run dev",
      installCommand: "bun install",
      buildCommand: "bun run build",
      outputDirectory: "dist",
    },
  };
  
  const vercelProjectPath = path.join(vercelDir, "project.json");
  await fs.writeFile(vercelProjectPath, JSON.stringify(projectConfig, null, 2));
  logger.info(`📁 Generated .vercel/project.json`);
}

// --- BUILD APP ENTRYPOINTS ---

async function buildAppEntrypoints() { 
  
  const allInjections = htmlInjectionManager.getAll();
  const uniqueInjections = getUniqueInjections(allInjections);
  const htmlInjectionsString = uniqueInjections.join('\n    ');
  
  if (uniqueInjections.length > 0) {
    logger.info(`Injecting ${uniqueInjections.length} unique HTML items into page`);
  }
   
  if (!fsSync.existsSync(APP_DIR)) {
    logger.warn("No app directory found");
    return;
  }

  const entrypoints: { route: string; path: string }[] = [];
  const generatedRoutes: { route: string; htmlPath: string }[] = [];
  
  function findIndexFiles(dir: string, baseRoute: string = "") {
    const entries = fsSync.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const routePath = path.join(baseRoute, entry.name);
      
      if (entry.isDirectory()) {
        findIndexFiles(fullPath, routePath);
      } else if (entry.name.match(/^index\.(tsx|jsx)$/)) {
        let route = baseRoute;
        
        if (route === "") {
          route = "index";
        } else {
          // Convert Windows backslashes to forward slashes for URL
          route = route.replace(/\\/g, '/');
        }
        
        entrypoints.push({
          route: route,
          path: fullPath
        });
        
        logger.info(`Found route: ${route} -> ${fullPath}`);
      }
    }
  }
  
  findIndexFiles(APP_DIR);
  
  if (entrypoints.length === 0) {
    logger.warn("No index.tsx/jsx files found in app directory");
    return;
  }
  
  for (const entry of entrypoints) {
    let outDir: string;
    let outputName = "index.js";

    if (entry.route === "index") {
      outDir = DIST_DIR;
    } else {
      outDir = path.join(DIST_DIR, entry.route);
    }
    
    await fs.mkdir(outDir, { recursive: true });
    
    logger.info(`Building route: ${entry.route} -> ${outDir}`);
    
    await build({
      entrypoints: [entry.path],
      outdir: outDir,
      target: "browser",
      jsxFactory: "e",
      jsxFragment: "Fragment",
      jsxImportSource: "vaderjs",
      naming: outputName,
      external: [],
    });
    
    const htmlPath = path.join(outDir, "index.html");
    generatedRoutes.push({
      route: entry.route,
      htmlPath: htmlPath
    });
    
    const pageTitle = entry.route === "index" 
      ? (config.title || 'Vader App') 
      : `${config.title || 'Vader App'} - ${entry.route.charAt(0).toUpperCase() + entry.route.slice(1)}`;
    
    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${pageTitle}</title>
${htmlInjectionsString}
</head>
<body>
<div id="app"></div>
<script type="module" src="/${entry.route === 'index' ? '' : entry.route + '/'}${outputName}"></script>
${
  globalThis.isDev ? `
<script>
  if (typeof window !== 'undefined') {
    const ws = new WebSocket('ws://' + location.host + '/__hmr');
    ws.onmessage = (event) => {
      if (event.data === 'reload') {
        console.log('🔄 Reloading page due to changes...');
        window.location.reload();
      }
    };
  }
</script>
</body>
</html>` : `</body>
</html>`
    }`;
    
    await fs.writeFile(htmlPath, html);
    logger.success(`Generated ${htmlPath}`);
  }
  
  logger.success(`Built ${entrypoints.length} routes: ${entrypoints.map(e => e.route).join(', ')}`);
  
  // Generate Vercel config if hosting is set to vercel 
  if (config.host_provider === "vercel") { 
    await generateVercelConfig(generatedRoutes);
  }
}

// Windows-compatible directory removal
async function removeDirectory(dir: string) {
  try {
    if (fsSync.existsSync(dir)) {
      await fs.rm(dir, { recursive: true, force: true });
    }
  } catch (error) {
    if (fsSync.existsSync(dir)) {
      const files = await fs.readdir(dir);
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = await fs.stat(filePath);
        if (stat.isDirectory()) {
          await removeDirectory(filePath);
        } else {
          await fs.unlink(filePath).catch(() => {});
        }
      }
      await fs.rmdir(dir).catch(() => {});
    }
  }
}

// --- MAIN BUILD ---

async function buildAll(dev = false) {
  const start = performance.now();

  htmlInjectionManager.clear();

  await loadPluginsFromConfig();
  await loadPluginsFromDirectory();
  
  const pluginAPI = createPluginAPI();
  await runPluginHook('onBuildStart', pluginAPI);

  await ensureJSConfig();
  await removeDirectory(DIST_DIR);
  await fs.mkdir(DIST_DIR, { recursive: true });

  await timedStep("Build Vader Core", buildVaderCore);
  await timedStep("Build Src", buildSrc);
  await timedStep("Copy Public", copyPublicAssets);
  await timedStep("Build App", buildAppEntrypoints);
  
  // Generate Vercel project config if needed (optional)
  if (config.hosting === "vercel") {
    await generateVercelProjectConfig();
  }

  await runPluginHook('onBuildFinish', pluginAPI);

  logger.success(
    `Build finished in ${(performance.now() - start).toFixed(1)}ms`
  );
}

// --- DEV SERVER ---

async function runDevServer() {
  let buildPromise: Promise<void> | null = null;
  let reloadTimeout: NodeJS.Timeout | null = null;
  
  const triggerReload = (clients: Set<any>) => {
    if (reloadTimeout) {
      clearTimeout(reloadTimeout);
    }
    
    reloadTimeout = setTimeout(() => {
      logger.info("🔄 Reloading clients...");
      for (const c of clients) {
        try {
          c.send("reload");
        } catch (e) {}
      }
      reloadTimeout = null;
    }, 50);
  };

  await buildAll(true);

  const clients = new Set<any>();
  const port = config.port || 3000;

  const server = serve({
    port,

    fetch(req, server) {
      const url = new URL(req.url);
      
      if (url.pathname === "/__hmr" && server.upgrade(req)) return;

      let requestPath = url.pathname;
      
      if (requestPath.endsWith('/')) {
        requestPath = path.join(requestPath, 'index.html');
      }
      
      let filePath = path.join(DIST_DIR, requestPath);
      
      if (!path.extname(filePath)) {
        const indexPath = path.join(filePath, 'index.html');
        if (fsSync.existsSync(indexPath)) {
          filePath = indexPath;
        } else {
          const htmlPath = filePath + '.html';
          if (fsSync.existsSync(htmlPath)) {
            filePath = htmlPath;
          }
        }
      }
      
      if (url.pathname === "/" || url.pathname === "") {
        filePath = path.join(DIST_DIR, "index.html");
      }
      
      if (fsSync.existsSync(filePath)) {
        const file = Bun.file(filePath);
        const ext = path.extname(filePath);
        const contentType = {
          '.html': 'text/html',
          '.js': 'application/javascript',
          '.css': 'text/css',
          '.json': 'application/json',
          '.png': 'image/png',
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.gif': 'image/gif',
          '.svg': 'image/svg+xml',
          '.ico': 'image/x-icon',
        }[ext] || 'application/octet-stream';
        
        return new Response(file, {
          headers: {
            'Content-Type': contentType,
          },
        });
      }
      
      logger.warn(`404 Not Found: ${requestPath}`);
      return new Response("Not Found", { status: 404 });
    },

    websocket: {
      open(ws) {
        clients.add(ws);
        logger.info(`Client connected (${clients.size} total)`);
      },
      close(ws) {
        clients.delete(ws);
        logger.info(`Client disconnected (${clients.size} total)`);
      },
    },
  });

  watcher.watch(APP_DIR);
  watcher.watch(SRC_DIR);
  watcher.watch(PUBLIC_DIR);
  
  const configPath = path.join(PROJECT_ROOT, "vaderjs.config.ts");
  if (fsSync.existsSync(configPath)) {
    watcher.watch(configPath);
  }
  
  const pluginsDir = path.join(PROJECT_ROOT, "plugins");
  if (fsSync.existsSync(pluginsDir)) {
    watcher.watch(pluginsDir);
  }
  
  const rootAppFile = findAppFile();
  if (rootAppFile) {
    watcher.watch(path.dirname(rootAppFile));
  }

  watcher.onChange(async (file) => {
    if (buildPromise) {
      logger.info("Build already in progress, skipping...");
      return;
    }
    
    logger.info(`Changes detected in: ${path.basename(file)}`);
    watcher.setRebuildStatus(true);
    
    try {
      if (file.includes('vaderjs.config.ts') || file.includes('plugins')) {
        logger.info("Config or plugin changed, reloading...");
        config = await loadConfig();
        plugins = [];
        await loadPluginsFromConfig();
        await loadPluginsFromDirectory();
      }
      
      const pluginAPI = createPluginAPI();
      for (const plugin of plugins) {
        if (plugin.onFileChange) {
          await plugin.onFileChange(file, pluginAPI);
        }
      }
      
      buildPromise = buildAll(true);
      await buildPromise;
      buildPromise = null;
      
      triggerReload(clients);
      
    } catch (error) {
      logger.error("Build failed:", error);
      buildPromise = null;
    } finally {
      watcher.setRebuildStatus(false);
    }
  });

  logger.success(`Dev server running http://localhost:${port}`);
  logger.info("Waiting for changes... (Press Ctrl+C to stop)");
  
  const distFiles = fsSync.readdirSync(DIST_DIR, { recursive: true });
  const htmlFiles = distFiles.filter(f => f.toString().endsWith('index.html'));
  if (htmlFiles.length > 0) {
    logger.info("Available routes:");
    for (const htmlFile of htmlFiles) {
      const route = path.dirname(htmlFile.toString());
      const urlPath = route === '.' ? '/' : `/${route}/`;
      logger.info(`  http://localhost:${port}${urlPath}`);
    }
  }
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
  - For Vercel deployment: set hosting: "vercel" in vaderjs.config.ts
`);
  }
}

main();