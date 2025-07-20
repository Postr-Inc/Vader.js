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
    logger.error(`Error during '${name}':`, e.message);
    process.exit(1);
  }
}

// --- CONSTANTS ---

const PROJECT_ROOT = process.cwd();
const APP_DIR = path.join(PROJECT_ROOT, "app");
const PUBLIC_DIR = path.join(PROJECT_ROOT, "public");
const DIST_DIR = path.join(PROJECT_ROOT, "dist");
const SRC_DIR = path.join(PROJECT_ROOT, "src");
const SERVER_BUILD_DIR = path.join(DIST_DIR, "server");
const VADER_SRC_PATH = path.join(
  PROJECT_ROOT,
  "node_modules",
  "vaderjs",
  "index.ts"
);
const TEMP_SRC_DIR = path.join(PROJECT_ROOT, ".vader_temp_src");

// --- ASSET HANDLING PLUGIN (REVISED WITH HASHING) ---

/**
 * A Bun plugin to handle importing assets like images, fonts, and JSON files.
 */
const vaderAssetsHandler = {
  name: "vader-assets-handler",
  async setup(build) {
    const assetExtensions = /\.(svg|png|jpe?g|gif|webp|ico|mp4|webm|woff2?|ttf|eot|otf)$/;
    const jsonExtension = /\.json$/;
    const ASSETS_DIR = path.join(DIST_DIR, "assets");

    // Loader for static assets (images, fonts, etc.)
    // Copies assets to /dist/assets with a content hash and returns the public URL.
    build.onLoad({ filter: assetExtensions }, async (args) => {
      const fileBuffer = await fs.readFile(args.path);
      const hash = Bun.hash(fileBuffer).toString(16).slice(0, 8);
      const filename = `${path.parse(args.path).name}.${hash}${path.parse(args.path).ext}`;
      const destPath = path.join(ASSETS_DIR, filename);

      await fs.mkdir(ASSETS_DIR, { recursive: true });
      await fs.writeFile(destPath, fileBuffer);

      const publicPath = `/assets/${filename}`;
      return {
        contents: `export default "${publicPath}";`,
        loader: "js",
      };
    });

    // JSON loader remains the same
    build.onLoad({ filter: jsonExtension }, async (args) => {
      const content = await fs.readFile(args.path, "utf8");
      return {
        contents: `export default ${content};`,
        loader: "js",
      };
    });
  },
};

// --- PLUGIN to handle SSR hook issues ---

/**
 * A Bun plugin that removes imports from "vaderjs" for server-side builds.
 * This allows the `renderToString` function to polyfill hooks with server-safe mocks.
 */
const ssrVaderImportRemoverPlugin = {
  name: 'ssr-vader-import-remover',
  async setup(build) {
    build.onLoad({ filter: /\.(jsx|tsx)$/ }, async (args) => {
      let contents = await fs.readFile(args.path, 'utf8');
      // This regex removes default, named, and namespace imports from "vaderjs"
      contents = contents.replace(/import\s+(?:(?:\*\s+as\s+\w+)|(?:\{[^}]+\})|\w+)\s+from\s+['"]vaderjs['"];?/g, '');
      return {
        contents,
        loader: path.extname(args.path).substring(1), // 'jsx' or 'tsx'
      };
    });
  },
};


// --- SERVER-SIDE GENERATION (SSG) & RENDERING (SSR) UTILITIES ---

/**
 * A minimal `createElement` function for server-side rendering.
 */
function ssgCreateElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.flat(),
    },
  };
}

/**
 * Server-safe mock implementations of VaderJS hooks. These do nothing or return
 * initial values, as there is no state or lifecycle on the server.
 */
const serverSideHooks = {
  useState: (initialState) => [typeof initialState === 'function' ? initialState() : initialState, () => { }],
  useEffect: () => { },
  useLayoutEffect: () => { },
  useRef: (initial) => ({ current: initial }),
  useMemo: (factory) => factory(),
  useCallback: (callback) => callback,
  useContext: (context) => context._defaultValue,
  useReducer: (reducer, initialState) => [initialState, () => { }],
  isServer: typeof window === "undefined"
};


/**
 * Renders a VNode to an HTML string.
 */
function renderToString(element) {
  if (typeof element === 'string' || typeof element === 'number') {
    return String(element);
  }
  if (element === null || typeof element !== 'object' || !element.type) {
    return '';
  }

  const { type, props } = element;

  if (typeof type === 'function') {
    // For function components, call the function to get the element it returns.
    // We polyfill `createElement` and server-safe hooks via a global for JSX to work.
    global.Vader = { createElement: ssgCreateElement, ...serverSideHooks };
    const result = type(props);
    delete global.Vader;
    return renderToString(result);
  }

  const children = (props.children || []).map(renderToString).join('');
  const attributes = Object.keys(props)
    .filter(key => key !== 'children' && props[key] != null)
    .map(key => {
      let value = props[key];
      let currentKey = key;

      if (currentKey === 'className') {
        currentKey = 'class';
      }

      if (currentKey === 'style' && typeof value === 'object') {
        const styleString = Object.entries(value)
          .map(([k, v]) => {
            const cssKey = k.replace(/([A-Z])/g, '-$1').toLowerCase();
            return `${cssKey}:${v}`;
          })
          .join(';');
        return `style="${styleString}"`;
      }

      return `${currentKey}="${value}"`;
    })
    .join(' ');

  const tag = type.toLowerCase();
  // Handle self-closing tags
  const selfClosingTags = ['img', 'br', 'hr', 'input', 'link', 'meta'];
  if (selfClosingTags.includes(tag)) {
    return `<${tag}${attributes ? ' ' + attributes : ''} />`;
  }

  return `<${tag}${attributes ? ' ' + attributes : ''}>${children}</${tag}>`;
}


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
    const configModule = await import(
      path.join(PROJECT_ROOT, "vaderjs.config.js")
    );
    const loadedConfig = configModule.default || configModule;
    // Set defaults for ssr and ssg
    loadedConfig.ssr = loadedConfig.ssr || false;
    loadedConfig.ssg = loadedConfig.ssr ? false : (loadedConfig.ssg || false); // SSR overrides SSG
    return loadedConfig;
  } catch {
    logger.warn("No 'vader.config.js' found, using defaults.");
    return { ssr: false, ssg: false };
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
        logger.error(
          `Plugin hook error (${hookName} in ${plugin.name || "anonymous plugin"}):`,
          e
        );
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
  return code.replace(
    /import\s+{[^}]*use(State|Effect|Memo|Navigation)[^}]*}\s+from\s+['"]vaderjs['"];?\n?/g,
    ""
  );
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

  const entrypoints = fsSync
    .readdirSync(TEMP_SRC_DIR, { recursive: true })
    .map((file) => path.join(TEMP_SRC_DIR, file))
    .filter((file) => /\.(ts|tsx|js|jsx)$/.test(file));

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
    plugins: [vaderAssetsHandler], // <-- Use asset handler
  });
}

/**
 * Step 5: Copy all assets from the `/public` directory to `/dist`.
 */
async function copyPublicAssets() {
  if (!fsSync.existsSync(PUBLIC_DIR)) return;
  // Copy contents of public into dist, not the public folder itself
  for (const item of await fs.readdir(PUBLIC_DIR)) {
    await fs.cp(path.join(PUBLIC_DIR, item), path.join(DIST_DIR, item), {
      recursive: true,
    });
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

  const devClientScript = isDev
    ? ` 
 <script>
   new WebSocket("ws://" + location.host + "/__hmr").onmessage = (msg) => {
     if (msg.data === "reload") location.reload();
   };
 </script>`
    : "";

  const entries = fsSync
    .readdirSync(APP_DIR, { recursive: true })
    .filter((file) => /index\.(jsx|tsx)$/.test(file))
    .map((file) => ({
      name:
        path.dirname(file) === "."
          ? "index"
          : path.dirname(file).replace(/\\/g, "/"),
      path: path.join(APP_DIR, file),
    }));

  // Build server-side versions of components if SSR is enabled
  if (config.ssr) {
    await build({
      entrypoints: entries.map(e => e.path),
      outdir: SERVER_BUILD_DIR,
      target: "bun",
      format: "esm",
      plugins: [ssrVaderImportRemoverPlugin, vaderAssetsHandler],
      naming: { entry: "[dir]/[name].js" },
      root: APP_DIR,
    });
  }

  for (const { name, path: entryPath } of entries) {
    const outDir = path.join(DIST_DIR, name === "index" ? "" : name);
    const outJsPath = path.join(outDir, "index.js");

    await fs.mkdir(outDir, { recursive: true });

    let appHtml = '';
    if (config.ssg) { // SSG is mutually exclusive with SSR
      const ssgTempDir = path.join(PROJECT_ROOT, '.vader_ssg_temp');
      try {
        await fs.mkdir(ssgTempDir, { recursive: true });
        const ssgOutFile = path.join(ssgTempDir, `${name.replace(/[\\/]/g, '_')}.js`);

        // Pre-build the component for SSG to handle asset imports correctly.
        const result = await build({
          entrypoints: [entryPath],
          outfile: ssgOutFile,
          target: "bun",
          format: "esm",
          plugins: [vaderAssetsHandler],
          external: ["vaderjs"],
        });

        if (!result.success) {
          throw new Error(`SSG pre-build failed: ${result.logs.join('\n')}`);
        }

        const App = (await import(ssgOutFile)).default;

        if (typeof App === 'function') {
          const appElement = ssgCreateElement(App, null);
          appHtml = renderToString(appElement);
          logger.info(`Pre-rendered SSG content for '${name}'`);
        }
      } catch (e) {
        logger.error(`SSG rendering failed for '${entryPath}':`, e.stack || e);
      } finally {
        if (fsSync.existsSync(ssgTempDir)) {
          await fs.rm(ssgTempDir, { recursive: true, force: true });
        }
      }
    }

    const cssLinks = [];
    const cssContent = await fs.readFile(entryPath, "utf8");
    const cssImports = [...cssContent.matchAll(/import\s+['"](.*\.css)['"]/g)];

    for (const match of cssImports) {
      const cssImportPath = match[1];
      const sourceCssPath = path.resolve(path.dirname(entryPath), cssImportPath);
      if (fsSync.existsSync(sourceCssPath)) {
        const relativeCssPath = path.relative(APP_DIR, sourceCssPath);
        const destCssPath = path.join(DIST_DIR, relativeCssPath);

        await fs.mkdir(path.dirname(destCssPath), { recursive: true });
        await fs.copyFile(sourceCssPath, destCssPath);

        const htmlRelativePath = path
          .relative(outDir, destCssPath)
          .replace(/\\/g, "/");
        cssLinks.push(`<link rel="stylesheet" href="${htmlRelativePath}">`);
      } else {
        logger.warn(`CSS file not found: ${sourceCssPath}`);
      }
    }

    console.log(config)
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
  <div id="app">${appHtml}</div>
  ${!config.ssr ? ` <script type="module">
    import App from '/${name === 'index' ? '' : name + '/'}index.js'; 
    import * as Vader from '/src/vader/index.js';
    window.Vader = Vader
    Vader.render(Vader.createElement(App, null), document.getElementById("app"));
  </script>` : `<script type="module">
    import App from '/${name === 'index' ? '' : name + '/'}index.js';
    import * as Vader from '/src/vader/index.js';
    window.Vader = Vader;

    // Find the props script tag added by the server.
    const propsElement = document.getElementById('__VADER_PROPS__');
    
    // Parse its JSON content into an object. Default to {} if not found.
    const initialProps = propsElement ? JSON.parse(propsElement.textContent) : {};

    // Pass the initialProps to your App during client-side hydration.
    Vader.render(Vader.createElement(App, initialProps), document.getElementById("app"));
  </script>`
      }
   
  ${devClientScript}
</body>
</html>`;

    await fs.writeFile(path.join(outDir, "index.html"), htmlContent);

    await build({
      entrypoints: [entryPath],
      outdir: outDir,
      target: "browser",
      minify: false,
      sourcemap: "external",
      external: ["vaderjs"],
      jsxFactory: "e",
      jsxFragment: "Fragment",
      jsxImportSource: "vaderjs",
      plugins: [vaderAssetsHandler], // <-- Use asset handler
    });

    let jsContent = await fs.readFile(outJsPath, "utf8");
    jsContent = jsContent.replace(
      /from\s+['"]vaderjs['"]/g,
      `from '/src/vader/index.js'`
    );
    await fs.writeFile(outJsPath, jsContent);
  }
}

async function buildAll(isDev = false) {
  logger.info(
    `Starting VaderJS ${isDev ? "development" : "production"} build...`
  );
  const totalTime = performance.now();

  htmlInjections = [];

  if (fsSync.existsSync(DIST_DIR)) {
    await fs.rm(DIST_DIR, { recursive: true, force: true });
  }

  await fs.mkdir(DIST_DIR, { recursive: true });

  await runPluginHook("onBuildStart");

  await timedStep("Building VaderJS Core", buildVaderCore);
  await timedStep("Copying Public Assets", copyPublicAssets);
  await timedStep("Building App Source (/src)", buildSrc);
  await timedStep("Building App Entrypoints (/app)", () =>
    buildAppEntrypoints(isDev)
  );

  await runPluginHook("onBuildFinish");

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
    async fetch(req, server) {
      const url = new URL(req.url);
      if (url.pathname === "/__hmr" && server.upgrade(req)) {
        return;
      }

      // Serve static assets from dist
      const staticFilePath = path.join(DIST_DIR, url.pathname);
      const staticFile = Bun.file(staticFilePath);
      if (await staticFile.exists()) {
        return new Response(staticFile);
      }

      // If SSR is enabled, handle page rendering
      if (config.ssr) {
        try {
          let componentPath = url.pathname;
          if (componentPath.endsWith('/')) {
            componentPath += 'index';
          }
          const serverComponentPath = path.join(SERVER_BUILD_DIR, componentPath, 'index.js');

          if (fsSync.existsSync(serverComponentPath)) {
            // By adding a cache-busting query, we force Bun to re-import the module on each request in dev mode.
            const module = await import(`${serverComponentPath}?t=${Date.now()}`);
            const App = module.default;
            const getServerSideProps = App.getServerSideProps;
            console.log(getServerSideProps)

            let props = {};
            if (typeof getServerSideProps === 'function') {
              // A real implementation would parse dynamic route params here
              const context = { params: {}, query: Object.fromEntries(url.searchParams) };
              const result = await getServerSideProps(context);
              props = result.props || {};
            }

            const appHtml = renderToString(ssgCreateElement(App, props));

            // Use the corresponding index.html as a template
            const htmlTemplatePath = path.join(DIST_DIR, componentPath, 'index.html');
            const htmlTemplate = await fs.readFile(htmlTemplatePath, 'utf8');
            let renderedHtml = htmlTemplate.replace(/<div id="app">.*<\/div>/, `<div id="app">${appHtml}</div>`);

            // Embed the server-side props for client-side hydration
            renderedHtml = renderedHtml.replace(
              '</body>',
              `<script id="__VADER_PROPS__" type="application/json">${JSON.stringify(props)}</script></body>`
            );

            return new Response(renderedHtml, { headers: { 'Content-Type': 'text/html' } });
          }
        } catch (e) {
          logger.error(`SSR Error for ${url.pathname}:`, e);
          return new Response("Server-Side Rendering Error", { status: 500 });
        }
      }

      // Fallback to serving index.html for SPA behavior if not SSR
      const fallbackPath = path.join(DIST_DIR, "index.html");
      const fallbackFile = Bun.file(fallbackPath);
      if (await fallbackFile.exists()) {
        return new Response(fallbackFile);
      }

      return new Response("Not Found", { status: 404 });
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
    fsSync.watch(dir, { recursive: true }, debouncedBuild);
  }
}

async function runProdServer() {
  const port = config.port || 3000;
  logger.info(`Serving production build from /dist on http://localhost:${port}`);

  serve({
    port,
    async fetch(req) {
      const url = new URL(req.url);
      const staticFilePath = path.join(DIST_DIR, url.pathname);
      const staticFile = Bun.file(staticFilePath);

      if (await staticFile.exists()) {
        return new Response(staticFile);
      }

      if (config.ssr) {
        try {
          let componentPath = url.pathname;
          if (componentPath.endsWith('/')) {
            componentPath += 'index';
          }
          const serverComponentPath = path.join(SERVER_BUILD_DIR, componentPath, 'index.js');

          if (fsSync.existsSync(serverComponentPath)) {
            const module = await import(serverComponentPath);
            const App = module.default;
            const getServerSideProps = module.getServerSideProps;

            let props = {};
            if (typeof getServerSideProps === 'function') {
              const context = { params: {}, query: Object.fromEntries(url.searchParams) };
              const result = await getServerSideProps(context);
              props = result.props || {};
            }

            const appHtml = renderToString(ssgCreateElement(App, props));

            const htmlTemplatePath = path.join(DIST_DIR, componentPath, 'index.html');
            const htmlTemplate = await fs.readFile(htmlTemplatePath, 'utf8');
            let renderedHtml = htmlTemplate.replace(/<div id="app">.*<\/div>/, `<div id="app">${appHtml}</div>`);

            renderedHtml = renderedHtml.replace(
              '</body>',
              `<script id="__VADER_PROPS__" type="application/json">${JSON.stringify(props)}</script></body>`
            );

            return new Response(renderedHtml, { headers: { 'Content-Type': 'text/html' } });
          }
        } catch (e) {
          logger.error(`SSR Error for ${url.pathname}:`, e);
          return new Response("Server-Side Rendering Error", { status: 500 });
        }
      }

      const fallbackPath = path.join(DIST_DIR, "index.html");
      const fallbackFile = Bun.file(fallbackPath);
      if (await fallbackFile.exists()) {
        return new Response(fallbackFile);
      }

      return new Response("Not Found", { status: 404 });
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
    __    __  ____  ____  _______  __
   |  |  /  |/ __ \\/ __ \\/ ____/ |/ /
   |  |  /  / / / // /_/ // /___   |   / 
   |  | /  / /_/ / \\____// /___  /   |  
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
    if (config.ssr) {
      await runProdServer();
    } else {
      // If not SSR, we still need to build before serving
      await buildAll(false);
      await runProdServer();
    }
  } else if (command === "init") {
    init().catch((e) => {
      console.error("Initialization failed:", e);
      process.exit(1);
    });
  } else {
    logger.error(`Unknown command: '${command}'.`);
    logger.info("Available commands: 'dev', 'build', 'serve', 'init'");
    process.exit(1);
  }
}

main().catch((err) => {
  logger.error("An unexpected error occurred:", err);
  process.exit(1);
});
