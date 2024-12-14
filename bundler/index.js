import {
  Component,
  e,
  useState,
  useEffect,
  useFetch,
  useAsyncState,
  Fragment,
} from "vaderjs";
import { document } from "vaderjs/document";
import fs from "fs";
import ansiColors from "ansi-colors";
import path from "path";
let path2 = require("path");
globalThis.Fragment = Fragment;
globalThis.window = {
  location: {
    hash: "",
    host: "",
  },
};
globalThis.Component = Component;
globalThis.e = e;
globalThis.useFetch = useFetch;
globalThis.useEffect = useEffect;
globalThis.useAsyncState = useAsyncState;
globalThis.useState = useState;
globalThis.genKey = () => {
  return crypto.randomUUID();
};
globalThis.document = {
  createElement: (tag) => {},
  getElementById: (id) => {},
  querySelector: (query) => {},
};

try {
    await Bun.build({
        entrypoints: [process.env.ENTRYPOINT],
        minify: false,
        root: process.cwd() + "/dist/",
        outdir: process.cwd() + "/dist/",
        
        format: "esm",
        ...(process.env.DEV ? { sourcemap: "inline" } : {}),
        external:['*.jsx', '*.js', '*.ts']
    });
} catch (error) {
    console.error(error)
}

let builtCode = fs.readFileSync(
  path.join(process.cwd(), "dist", process.env.filePath),
  "utf-8",
);

function handleReplacements(code) {
  let lines = code.split("\n");
  let newLines = [];
  for (let line of lines) {
    let hasImport = line.includes("import");
    if (hasImport && line.includes("from") && !newLines.includes(line)) {
      try {
        let url = line.includes("'") ? line.split("'")[1] : line.split('"')[1];
        line = line.replace(
          url,
          url.replace(".jsx", ".js").replace(".tsx", ".js"),
        );
        line = line.replace(
          url,
          url.replace(".ts", ".js").replace(".tsx", ".js"),
        );
        newLines.push(line);
      } catch (error) {
        continue;
      }
    } else {
      newLines.push(line);
    }
  }
  return newLines.join("\n");
}
builtCode = handleReplacements(builtCode);
fs.writeFileSync(
  path.join(process.cwd(), "dist", process.env.filePath),
  builtCode,
);

let isClass = function (element) {
  return element.toString().startsWith("class");
};
const generatePage = async (
  data = { path: process.env.INPUT, route: process.env.OUT },
) => {
  const { path, route } = data;
  if (path.includes("root.js")) return;
  let html = await import(path).then((m) => m.default);
  let { head } = await import(path).then((m) => m);
  let isFunction = false;
  globalThis.isServer = true;
  if (isClass(html)) {
    html = new html();
    html.Mounted = true;
    html = html.render();
  } else {
    isFunction = true;
    let instance = new Component();
    html = html.bind(instance);
    instance.render = html;
    html = instance.render();
  }

  let h = document(html);
  if (!fs.existsSync(process.cwd() + "/dist" + path2.dirname(route))) {
    fs.mkdirSync(process.cwd() + "/dist" + path2.dirname(route), {
      recursive: true,
    });
  }
  let headHtml = "";
  if (head) {
    headHtml = document(head());
  }

  await Bun.write(
    process.cwd() + "/dist/" + route + "/index.html",
    `<!DOCTYPE html>
        <head>
               ${headHtml}
               ${process.env.bindes}
               <meta charset="UTF-8">
               <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        ${h}
        <script type="module">
          import c from '${process.env.filePath}'
          import {render, e} from '/src/vader/index.js'
          window.e = e
          render(c, document.body.firstChild)
        </script>
              `,
  );
  console.log(
    ansiColors.blue(
      `${process.env.filePath.replace(".ts", ".js")} - ${parseInt(
        process.env.size,
      ).toFixed(2)}kb`,
    ),
  );
  process.exit(0);
};
try {
  if (process.env.isTs == undefined && process.env.isImport) {
    generatePage({ path: process.env.INPUT, route: process.env.OUT });
  } else if (process.env.isTs == undefined) {
    generatePage({ path: process.env.INPUT, route: process.env.OUT });
  }
} catch (error) {
  console.log(ansiColors.red(error));
}
