import { Glob } from "bun";

import fs from "fs";

import * as Bun from "bun";
 

let config = await import(process.cwd() + "/vader.config.js")
  .then((m) => (m ? m.default : {}))
  .catch((e) => { 
    return {};
  });

async function checkIFUptodate() {
  let lts = await fetch("https://registry.npmjs.org/vaderjs").then((res) =>
    res.json()
  );
  let latest = lts["dist-tags"].latest;
  let current = JSON.parse(
    fs.readFileSync(process.cwd() + "/node_modules/vaderjs/package.json")
  ).version;
  return {
    latest,
    current,
  };
}

import IPCServer from "vaderjs/binaries/IPC/index.js";

const IPC = IPCServer;

globalThis.isVader = true;

/**

          * @description - Call functions when the integration is triggered

          * @param {function} fn 

          * @param {args} args 

          */

globalThis.call = async (fn, args) => {
  return (await fn(args)) || void 0;
};

/**@description - Used to store hmr websocket clients */

globalThis.clients = [];

/**@description - Used to keep track of routes */

globalThis.routes = [];

/**

 * @description - Used to keep track of the mode

 */

globalThis.mode = "";

/**@usedby @transForm */

globalThis.isBuilding = false;

globalThis.hasGenerated = [];

let currentState = "";

/**

 * @description - Used to keep track of the bundle size

 */

let bundleSize = 0;

/**

 * @description - variables used to generate arrays of paths recursively

 */

const glob = new Glob("/pages/**/**/*.{,tsx,js,jsx,md}", {
  absolute: true,
});

const vaderGlob = new Glob("/node_modules/vaderjs/runtime/**/**/*.{,tsx,js}", {
  absolute: true,
});

const srcGlob = new Glob("/src/**/**/*.{jsx,ts,tsx,js}", {
  absolute: true,
});

const publicGlob = new Glob(
  "/public/**/**/*.{css,js,html,jpg,png,gif,svg,ico,video,webm,mp4,jpeg}",
  {
    absolute: true,
  }
);

const distPages = new Glob("/dist/pages/**/**/*.{tsx,js,jsx}", {
  absolute: true,
});

const distSrc = new Glob("/dist/src/**/**/*.{tsx,js,jsx}", {
  absolute: true,
});

const distPublic = new Glob(
  "/dist/public/**/**/*.{css,js,html,jpg,png,gif,svg,ico,video,webm,mp4,jpeg}",
  {
    absolute: true,
  }
);

const router = new Bun.FileSystemRouter({
  style: "nextjs",

  dir: process.cwd() + "/pages",

  origin: process.env.ORIGIN || "http://localhost:3000",

  assetPrefix: "_next/static/",
});

/**

 * @function handleReplaceMents 

 * @description - replaces data to be compatible with Vader.js

 * @param {*} data 

 * @returns 

 */
const cssToObj = (css) => {
  let styles = {};
  let currentSelector = "";

  css.split("\n").forEach((line) => {
    line = line.trim();

    if (line.endsWith("{")) {
      // Start of a block, extract the selector
      currentSelector = line.slice(0, -1).trim();
      styles[currentSelector] = {};
    } else if (line.endsWith("}")) {
      // End of a block
      currentSelector = "";
    } else if (line.includes(":") && currentSelector) {
      // Inside a block and contains key-value pair
      let [key, value] = line.split(":").map((part) => part.trim());
      styles[currentSelector][key] = value;
    }
  });

  return styles;
};

function handleReplaceMents(data) {
  data.split("\n").forEach(async (line, index) => {
    switch (true) {
      case line.includes("import") && line.includes("module.css"):
        let path = line.split("from")[1].trim().split(";")[0].trim();
        let name = line.split("import")[1].split("from")[0].trim();
        path = path.replace(";", "");
        path = path.replace(/'/g, "").trim().replace(/"/g, "").trim();
        path = path.replaceAll(".jsx", ".js");
        path = path.replaceAll("../", "");
        let css = fs.readFileSync(process.cwd() + "/" + path, "utf8");
        css = css.replaceAll(".", "");
        let styles = cssToObj(css);
        let style = JSON.stringify(styles);
        let newLine = `let ${name} = ${style}`;
        data = data.replace(line, newLine);

        break;

      case line.includes("useReducer") && !line.includes("import"):
        line = line.replaceAll(/\s+/g, " ");

        let varTypereducer = line.split("=")[0].trim().split("[")[0].trim();

        let keyreducer = line
          .split("=")[0]
          .trim()
          .split("[")[1]
          .trim()
          .split(",")[0]
          .trim();

        let setKeyreducer = line
          .split("=")[0]
          .trim()
          .split(",")[1]
          .trim()
          .replace("]", "");

        let reducer = line.split("=")[1].split("useReducer(")[1];

        let newStatereducer = `${varTypereducer} [${keyreducer}, ${setKeyreducer}] = this.useReducer('${keyreducer}', ${
          line.includes("=>") ? reducer + "=>{" : reducer
        }`;

        data = data.replace(line, newStatereducer);

        break;

      case line.includes("useState") && !line.includes("import"):
        let varType = line.split("[")[0];

        if (!line.split("=")[0].split(",")[1]) {
          throw new Error(
            "You forgot to value selector  (useState) " +
              " at " +
              `${file}:${string.split(line)[0].split("\n").length}`
          );
        }

        let key = line.split("=")[0].split(",")[0].trim().split("[")[1];

        if (!line.split("=")[0].split(",")[1]) {
          throw new Error(
            "You forgot to add a setter (useState) " +
              " at " +
              `${file}:${string.split(line)[0].split("\n").length}`
          );
        }

        let setKey = line.split("=")[0].split(",")[1].trim().replace("]", "");

        key = key.replace("[", "").replace(",", "");

        let valuestate = line.split("=")[1].split("useState(")[1];

        let regex = /useState\((.*)\)/gs;

        valuestate = valuestate.match(regex)
          ? valuestate
              .match(regex)[0]
              .split("useState(")[1]
              .split(")")[0]
              .trim()
          : valuestate;

        let newState = `${varType} [${key}, ${setKey}] = this.useState('${key}', ${valuestate}`;

        data = data.replace(line, newState);

        break;

      case line.includes("useRef") && !line.includes("import"):
        line = line.trim();

        let typeref = line.split(" ")[0];

        let keyref = line
          .split(typeref)[1]
          .split("=")[0]
          .trim()
          .replace("[", "")
          .replace(",", "");

        let valueref = line.split("=")[1].split("useRef(")[1];

        let newStateref = `${typeref} ${keyref} = this.useRef('${keyref}', ${valueref}`;

        data = data.replace(line, newStateref);

      case (line.includes(".jsx") && line.includes("import")) ||
        (line.includes(".tsx") && line.includes("import")):
        let old = line;

        line = line.replace(".jsx", ".js");

        line = line.replace(".tsx", ".js");

        data = data.replace(old, line);

        break;
    }
  });

  data = data.replaceAll("jsxDEV", "Vader.createElement");

  data = data.replaceAll("jsx", "Vader.createElement");

  data = data.replaceAll("vaderjs/client", "/vader.js");

  data = data.replaceAll(".tsx", ".js");

  let reactImportMatch = data.match(/import React/g);

  if (reactImportMatch) {
    let fullmatch = data.match(/import React from "react"/g);

    if (fullmatch) {
      data = data.replaceAll('import React from "react"', "");
    }
  }

  data = data.replaceAll(".ts", ".js");

  // check if Vader is imported

  let vaderImport = data.match(/import Vader/g);

  if (!vaderImport) {
    data = `import Vader from "/vader.js";\n` + data;
  }

  return data;
}

/**

 * @function ContentType    

 * @description - returns the content type based on the file extension

 * @param {*} url 

 * @returns 

 */

const ContentType = (url) => {
  switch (url.split(".").pop()) {
    case "css":
      return "text/css";

    case "js":
      return "text/javascript";

    case "json":
      return "application/json";

    case "html":
      return "text/html";

    case "jpg":
      return "image/jpg";

    case "png":
      return "image/png";

    case "gif":
      return "image/gif";

    case "svg":
      return "image/svg+xml";

    case "webp":
      return "image/webp";
    case "ico":
      return "image/x-icon";

    default:
      return "text/html";
  }
};

/**

 * @function Server

 * @description - Creates a hmr development server

 * @param {Number} port 

 */

function Server(port) {
  Bun.serve({
    port: port,

    async fetch(req, res) {
      const url = new URL(req.url);

      const success = res.upgrade(req);

      if (success) {
        return new Response("Connected", {
          headers: {
            "Content-Type": "text/html",
          },
        });
      }

      if (req.url.includes(".")) {
        if (!fs.existsSync(process.cwd() + "/dist" + url.pathname)) {
          return new Response("Not Found", {
            status: 404,

            headers: {
              "Content-Type": "text/html",
            },
          });
        }

        console.log(`HTTP GET: ${url.pathname} -> ${ContentType(req.url)}`);
        return new Response(
          fs.readFileSync(process.cwd() + "/dist" + url.pathname),
          {
            headers: {
              "Content-Type": ContentType(req.url),
            },
          }
        );
      }

      let matchedRoute =
        router.match(url.pathname) ||
        fs.existsSync(process.cwd() + "/dist" + url.pathname)
          ? {
              filePath: process.cwd() + "/dist" + url.pathname,
              isAbsolute: true,
            }
          : null;

      if (matchedRoute) {
        let { filePath, kind, name, params, pathname, query, isAbsolute } =
          matchedRoute;

        let folder = filePath.split("pages/").pop().split("index.js").shift();
        folder = folder
          .split("/")
          .filter((f) => f !== "dist")
          .join("/");
        let jsFile = filePath.split("pages/").pop().split(".").shift() + ".js";

        let pageContent = isAbsolute
          ? fs.readFileSync(filePath + "/index.html")
          : fs.readFileSync(
              process.cwd() + "/dist/" + folder + "/index.html",
              "utf8"
            );

        globalThis.mode === "dev"
          ? (pageContent += `

                <script type="module">

                    let ws = new WebSocket('ws://localhost:${port}');

                    ws.onmessage = async (e) => {

                        if(e.data === 'reload'){

                            window.location.reload()

                            console.log('Reloading...')

                        }

                    }

                </script>

                `)
          : void 0;

        return new Response(pageContent, {
          headers: {
            "Content-Type": "text/html",

            "X-Powered-By": "Vader.js v1.3.3",
          },
        });
      }

      return new Response("Not Found", {
        status: 404,

        headers: {
          "Content-Type": "text/html",
        },
      });
    },

    websocket: {
      open(ws) {
        clients.push(ws);
      },
    },
  });
}

/**

 * @function write

 * @description - Writes data to a file

 * @returns {void} 0

 * @param {string} file 

 * @param {any} data 

 * @returns 

 */

const write = (file, data) => {
  try {
    if (!fs.existsSync("./dist")) {
      fs.mkdirSync("./dist");
    }

    Bun.write(file, data);
  } catch (error) {
    console.error(error);
  }
};

/**

 * @function read

 * @param {path} file 

 * @returns  {Promise<string>}

 */

const read = async (file) => {
  return await Bun.file(file).text();
};

/**

 * @object integrationStates

 * @description - Used to store integration states

 */

globalThis.integrationStates = [];

/**

 * @description a boolean value that checks if vader is being used - useful for running toplevel code at integration start

 */

globalThis.context = {
  vader: true,
};

/**

 * @function handleIntegrations

 * @description - Handles module integrations that add more functionality to Vader.js

 * @returns {void} 0

 */

function handleIntegrations() {
  if (config?.integrations) {
    config.integrations.forEach((integration) => {
      let int = integration;

      globalThis.integrationStates.push(int);
    });
  }

  return void 0;
}

handleIntegrations();

/**

 * @function generateProviderRoutes

 * @description - Generates routes for hosting provders ie: vercel, cloudflare

 * @returns {void} 0

 */

async function generateProviderRoutes() {
  if (!config?.host?.provider) {
    console.warn(
      "No provider found in vader.config.js ignoring route generation..."
    );

    return void 0;
  }

  let providerType = [
    {
      provider: "vercel",

      file: "vercel.json",

      out: process.cwd() + "/vercel.json",

      obj: {
        rewrites: [],
      },
    },
    {
      provider: "cloudflare",

      file: "_redirects",

      out: "dist/_redirects",
    },
  ];

  let provider = providerType.find((p) => p.provider === config.host.provider);

  if (provider) {
    let prev = null;

    switch (provider.provider) {
      case "vercel":
        if (!fs.existsSync(provider.out)) {
          fs.writeFileSync(
            provider.out,
            JSON.stringify({
              rewrites: [],
            })
          );
        }

        prev = await read(provider.out);

        if (!prev) {
          prev = [];
        } else {
          prev = JSON.parse(prev).rewrites;
        }

        routes.forEach((r) => {
          let previous = prev.find((p) => p.source.includes(r.path));

          if (previous) {
            return void 0;
          }

          prev.push({
            source: "/" + r.path,

            destination: "/" + r.path + "/index.html",
          });

          if (r.params.length > 0) {
            r.params.forEach((param) => {
              if (!param.paramData) {
                return void 0;
              }

              let parampath = Object.keys(param.paramData)
                .map((p) => `:${p}`)
                .join("/");

              prev.push({
                source: "/" + r.path + "/" + parampath,

                destination: "/" + r.path + "/index.html",
              });
            });
          }

          fs.writeFileSync(
            provider.out,
            JSON.stringify(
              {
                rewrites: prev,
              },
              null,
              2
            )
          );
        });

        provider.obj.rewrites = prev;

        write(provider.out, JSON.stringify(provider.obj, null, 2));

        break;

      case "cloudflare":
        console.warn(
          "Cloudflare is not supported yet refer to their documentation for more information:https://developers.cloudflare.com/pages/configuration/redirects/"
        );

        break;
    }
  }

  return void 0;
}

/**

 * @function transform

 * @description - Transforms the jsx files to js files based on file paths

 */

async function transForm() {
  return new Promise(async (resolve, reject) => {
    globalThis.isBuilding = true;

    router.reload();

    for await (var file of glob.scan(".")) {
      file = file.replace(/\\/g, "/");

      let isBasePath = file.split("pages/")?.[1]?.split("/").length === 1;

      let folder =
        file.split("pages/")?.[1]?.split("/").slice(0, -1).join("/") || null;

      if (isBasePath) {
        folder = "/";
      }

      if (file.endsWith(".md")) {
        let data = await read(file);
        if (
          integrationStates.find((int) => int?._df && int?._df === "i18mdf")
        ) {
          console.log(
            `Using markdown parser ${
              integrationStates.find((int) => int?._df && int?._df === "i18mdf")
                .name
            } v${
              integrationStates.find((int) => int?._df && int?._df === "i18mdf")
                .version
            }`
          );
          let parser = integrationStates.find(
            (int) => int?._df && int?._df === "i18mdf"
          );

          parser.parse(data);
          parser._class.stylesheets.forEach((sheet) => {
            parser._class.output =
              `<link rel="stylesheet" href="${sheet}">` + parser._class.output;
          });
          let output = `./dist/${
            isBasePath ? "index.html" : folder + "/index.html"
          }`;
          write(output, parser._class.output);
        }
        continue;
      }

      let route = isBasePath ? router.match("/") : router.match("/" + folder);

      if (route) {
        let { filePath, kind, name, params, pathname, query } = route;

        let data = await read(filePath);

        try {
          data = new Bun.Transpiler({
            loader: "tsx",
            target: "browser",
          }).transformSync(data);
        } catch (e) {
          console.error(e);
        }

        let out = `./dist/${isBasePath ? "index.js" : folder + "/index.js"}`;

        isBasePath ? (folder = "/") : null;

        data = handleReplaceMents(data);

        let isAparam = null;

        if (folder === "") {
          return;
        }

        switch (true) {
          case kind === "dynamic":
            isAparam = true;

            break;

          case kind === "catch-all":
            isAparam = true;

            break;

          case kind === "optional-catch-all":
            isAparam = true;

            break;
        }

        routes.push({
          path: folder,
          file: out,
          isParam: isAparam,
          params: params,
          query,
          pathname,
        });

        write(out, data);

        bundleSize += data.length;
      }
    }

    for await (var file of srcGlob.scan(".")) {
      if (!fs.existsSync(process.cwd() + "/dist/src/")) {
        fs.mkdirSync(process.cwd() + "/dist/src/");
      }

      file = file.replace(/\\/g, "/");

      switch (file.split(".").pop()) {
        case "ts":
          let transpiler = new Bun.Transpiler({
            loader: "ts",
            target: "browser",
          });

          let data = await read(file);

          try {
            data = transpiler.transformSync(data);
          } catch (error) {
            console.error(error);
          }

          file = file.replace(".ts", ".js");

          let path = process.cwd() + "/dist/src/" + file.split("src/").pop();

          write(path, data);

          bundleSize += data.length;

          break;

        case "tsx":
          let transpilerx = new Bun.Transpiler({
            loader: "tsx",
            target: "browser",
          });

          let datax = await read(file);

          try {
            datax = transpilerx.transformSync(datax);
          } catch (error) {
            console.error(error);
          }

          datax = handleReplaceMents(datax);

          file = file.replace(".tsx", ".js");

          let pathx = process.cwd() + "/dist/src/" + file.split("src/").pop();

          write(pathx, datax);

          break;

        case "jsx":
          let transpilerjx = new Bun.Transpiler({
            loader: "jsx",
            target: "browser",
          });

          let datajx = await read(file);

          let source = transpilerjx.scan(datajx);

          try {
            datajx = transpilerjx.transformSync(datajx);
          } catch (error) {
            console.error(error);
          }

          datajx = handleReplaceMents(datajx);

          file = file.replace(".jsx", ".js");

          let pathjx = process.cwd() + "/dist/src/" + file.split("src/").pop();

          write(pathjx, datajx);

          bundleSize += datajx.length;

          break;
        default:
          break;
      }
    }

    for await (var file of publicGlob.scan(".")) {
      // works

      let data = null;
      let isBuff = false;
      file = file.replace(/\\/g, "/");
      if (
        file.endsWith(".png") ||
        file.endsWith(".jpg") ||
        file.endsWith(".jpeg") ||
        file.endsWith(".gif") ||
        file.endsWith(".svg") ||
        file.endsWith(".webp") ||
        file.endsWith(".ico") ||
        file.endsWith(".mp4") ||
        file.endsWith(".webm")
      ) {
        data = Buffer.from(fs.readFileSync(file)).toString("base64");
        isBuff = true;
      }
      data = data || (await read(file));

      let path = process.cwd() + "/dist/public/" + file.split("public/").pop();
      fs.writeFileSync(path, data, isBuff ? "base64" : "utf8");

      bundleSize += data.length;
    }

    for await (var file of vaderGlob.scan(".")) {
      file = file.replace(/\\/g, "/");
      if (
        fs.existsSync(
          process.cwd() +
            "/dist/" +
            file.split("node_modules/vaderjs/runtime/").pop()
        )
      ) {
        return;
      }
      let data = await read(file);

      file = file.replace(/\\/g, "/");

      write(
        process.cwd() +
          "/dist/" +
          file.split("node_modules/vaderjs/runtime/").pop(),
        data
      );

      bundleSize += fs.statSync(
        process.cwd() +
          "/dist/" +
          file.split("node_modules/vaderjs/runtime/").pop()
      ).size;
    }

    // clean dist folder

    for await (var file of distPages.scan(".")) {
      file = file.replace(/\\/g, "/");

      let path = process.cwd() + "/pages/" + file.split("dist/pages/").pop();

      path = path.replace(".js", config?.files?.mimeType || ".jsx");

      if (!fs.existsSync(path)) {
        fs.unlinkSync(file);
      }
    }

    /**

         * @function organizeRoutes

         * @description - Organizes routes that have param  paths

         */

    const organizeRoutes = () => {
      // if path starts with the same path and is dynamic then they are the same route and push params to the same route

      let newRoutes = [];

      routes.forEach((route) => {
        let exists = routes.find((r) => {
          if (r.path.includes("[")) {
            r.path = r.path.split("[").shift();
          }

          r.path = r.path
            .split("/")
            .filter((p) => p !== "")
            .join("/");

          if (r.isParam) {
            return r.path === route.path && r.isParam;
          }
        });

        if (exists) {
          let b4Params = route.params;

          route.params = [];

          route.params.push(b4Params);

          route.params.push({
            jsFile: "/" + exists.path + "/index.js",

            folder: "/" + exists.path,

            paramData: exists.params,
          });

          route.query = exists.query;

          newRoutes.push(route);
        } else if (!exists && !route.isParam) {
          newRoutes.push(route);
        }

        //remove param route that matched

        routes = routes.filter((r) => (exists ? r.path !== exists.path : true));
      });

      globalThis.routes = newRoutes;
    };

    organizeRoutes();

    generateProviderRoutes();

    globalThis.isBuilding = false;

    if (!fs.existsSync(process.cwd() + "/_dev/meta")) {
      fs.mkdirSync(process.cwd() + "/_dev/meta");
    }

    fs.writeFileSync(
      process.cwd() + "/_dev/meta/routes.json",
      JSON.stringify(routes, null, 2)
    );

    console.log(`Finished building ${Math.round(bundleSize / 1000)}kb`);

    bundleSize = 0;

    resolve();
  });
}

let port = 3000;
let hasRan = [];

switch (true) {
  case process.argv.includes("dev") &&
    !process.argv.includes("build") &&
    !process.argv.includes("start"):
    port = process.argv.includes("-p")
      ? process.argv[process.argv.indexOf("-p") + 1]
      : config?.dev?.port || 3000;

    globalThis.oneAndDone = false;
    let v = await checkIFUptodate();

    console.log(`

    ${
      v.current !== v.latest
        ? `Update available: ${v.latest} (current: ${v.current})`
        : `Vader.js v${v.current}`
    }
  - Watching for changes in ./pages
  - Watching for changes in ./src
  - Watching for changes in ./public
  - Serving on port http://localhost:${port}

  `);

    globalThis.mode = "dev";

    Server(port);
    for (var ints in integrationStates) {
      if (
        integrationStates &&
        integrationStates[ints]?.on &&
        integrationStates[ints].on.includes("dev") &&
        !hasRan.includes(integrationStates[ints].name)
      ) {
        console.log("Starting integration...");

        let int = integrationStates[ints];

        let { name, version, useRuntime, entryPoint, onAction, doOn } = int;

        globalThis[`isRunning${name}`] = true;
        console.log(`Using integration: ${name} v${version}`);

        Bun.spawn({
          cwd: process.cwd(),

          isVader: true,

          env: {
            PWD: process.cwd(),

            isVader: true,

            FOLDERS: "pages,src,public",

            onExit: (code) => {
              globalThis.isBuilding = false;

              globalThis[`isRunning${name}`] = false;
            },
          },

          cmd: [useRuntime || "node", entryPoint],
        });

        hasRan.push(integrationStates[ints].name);
      }
    }

    transForm();

    Bun.spawn({
      cwd: process.cwd() + "/node_modules/vaderjs/binaries/",

      env: {
        PWD: process.cwd(),

        IPC: IPC,

        FOLDERS: "pages,src,public",

        onExit: (code) => {
          globalThis.isBuilding = false;

          globalThis.oneAndDone = true;
        },
      },

      cmd: ["node", "watcher.js"],
    });

    async function runOnChange() {
      for (var ints in integrationStates) {
        if (
          integrationStates &&
          integrationStates[ints].on &&
          integrationStates[ints]?.on.includes("dev:change")
        ) {
          let int = integrationStates[ints];

          let { name, version, useRuntime, entryPoint, onAction, doOn } = int;

          if (globalThis[`isRunning${name}`]) {
            setTimeout(() => {
              globalThis[`isRunning${name}`] = false;
            }, 1000);
            return void 0;
          }

          globalThis[`isRunning${name}`] = true;
          console.log(`Using integration: ${name} v${version}`);

          Bun.spawn({
            cwd: process.cwd(),

            isVader: true,

            env: {
              PWD: process.cwd(),

              isVader: true,

              FOLDERS: "pages,src,public",

              onExit: (code) => {
                globalThis.isBuilding = false;

                globalThis[`isRunning${name}`] = false;
              },
            },

            cmd: [useRuntime || "node", entryPoint],
          });

          console.log(`Using integration: ${name} v${version}`);
        }
      }
    }

    IPC.client({
      use: IPCServer.typeEnums.WATCHER,

      port: 3434,
    }).Console.read(async (message) => {
      message = message.msg;

      switch (true) {
        case message.data?.type === "change":
          console.log("File changed:", message.data.filename);

          transForm();

          clients.forEach((client) => {
            client.send("reload");
          });

          // reload config
          config = await import(process.cwd() + "/vader.config.js").then((m) =>
            m ? m.default : {}
          );

          runOnChange();

          break;

        case message.data?.type === "add":
          console.log("File added:", message.data.filename);

          transForm();

          break;
      }
    });

    break;

  case process.argv.includes("build") &&
    !process.argv.includes("dev") &&
    !process.argv.includes("start"):
    globalThis.devMode = false;

    globalThis.mode = "prod";

    globalThis.isProduction = true;

    globalThis.routeStates = [];

    console.log(`
  Vader.js v1.3.3 
  Building to ./dist
  `);

    transForm();

    for (var ints in integrationStates) {
      if (
        integrationStates &&
        integrationStates[ints].on &&
        integrationStates[ints]?.on.includes("build")
      ) {
        console.log("Starting integration...");

        let int = integrationStates[ints];

        let { name, version, useRuntime, entryPoint, onAction, doOn } = int;

        console.log(`Using integration: ${name} v${version}`);

        Bun.spawn({
          cwd: process.cwd(),

          isVader: true,

          env: {
            PWD: process.cwd(),

            isVader: true,

            FOLDERS: "pages,src,public",

            onExit: (code) => {
              globalThis.isBuilding = false;
            },
          },

          cmd: ["node", entryPoint],
        });
      }
    }

    break;

  case process.argv.includes("start") &&
    !process.argv.includes("dev") &&
    !process.argv.includes("build"):
    port = process.argv.includes("-p")
      ? process.argv[process.argv.indexOf("-p") + 1]
      : config?.host?.prod?.port || 3000;

    console.log(`

Vader.js v1.3.3 

Serving ./dist on port ${port}

url: ${config?.host?.prod?.hostname || "http://localhost"}:${port}

            `);

    globalThis.devMode = false;

    globalThis.isProduction = true;

    Server(port);

    break;

  default:
    break;
}
