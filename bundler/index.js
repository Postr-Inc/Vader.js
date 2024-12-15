import {
  Component,
  e,
  useState,
  useEffect,
  useFetch,
  useAsyncState,
  Fragment,
} from "vaderjs";
import { document } from "vaderjs/document/index.ts";
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
  createElement: (tag) => { },
  getElementById: (id) => { },
  querySelector: (query) => { },
};
try {
  await Bun.build({
    entrypoints: [process.env.ENTRYPOINT],
    minify: false,
    root: process.cwd() + "/dist/",
    outdir: process.cwd() + "/dist/",
    format: "esm",
    ...(process.env.DEV ? { sourcemap: "inline" } : {}),
    packages: "bundle",
    external: ["vaderjs"]
  });
} catch (error) {
  console.error(error)
}


let builtCode = fs.readFileSync(path.join(process.cwd(), 'dist', process.env.filePath), 'utf-8')

const handleReplacements = (code) => {
  let lines = code.split('\n')
  let newLines = []
  for (let line of lines) {
    let hasImport = line.includes('import')
    if (hasImport && line.includes('vaderjs')) {
      line = line.replace('vaderjs', '/src/vader/index.js')
    }
    if (hasImport && line.includes('.css')) {
      try {
        let isSmallColon = line.includes("'")
        let url = isSmallColon ? line.split("'")[1] : line.split('"')[1]
        // start from "/" not "/app"
        // remvoe all ./ and ../
        url = url.replaceAll('./', '/').replaceAll('../', '/')

        let p = path.join(process.cwd(), '/', url)
        line = '';
        url = url.replace(process.cwd() + '/app', '')
        url = url.replace(/\\/g, '/')
        if (!bindes.includes(`<link rel="stylesheet" href="${url}">`)) {
          bindes.push(`
                  <style>
                    ${fs.readFileSync(p, 'utf-8')}
                  </style>
                  `)
        }
      } catch (error) {
        console.error(error)
      }
    }
    if (line.toLowerCase().includes('genkey()')) {
      line = line.toLowerCase().replace('genkey()', `this.key = "${crypto.randomUUID()}"`)
    }
    if (!hasImport && line.includes('useFetch')) {
      line = line.replace('useFetch', 'this.useFetch')
    }
    if (!hasImport && line.match(/\buseState\d*\(/) && line.includes('[') && !line.includes("this")) {
     

      let key = line.split(',')[0].split('[')[1].replace(' ', '');

      let updatedLine = line.replace(/\buseState\d*\(/, `this.useState('${key}',`);

      line = updatedLine; 
    }

    if (!hasImport && line.match(/\buseAsyncState\d*\(/) && line.includes('[') && !line.includes("this")) {
       

      let key = line.split(',')[0].split('[')[1].replace(' ', '');

      let updatedLine = line.replace(/\buseAsyncState\d*\(/, `this.useAsyncState('${key}',`);

      line = updatedLine; 
    }

    if (!hasImport && line.match(/\buseEffect\d*\(/) && !line.includes("this")) {
   

      let updatedLine = line.replace(/\buseEffect\d*\(/, `this.useEffect(`);

      line = updatedLine; 
    }

    if (!hasImport && line.match(/\buseRef\d*\(/) && !line.includes("this")) {
     

      let key = line.split(' ')[1].split('=')[0];

      let updatedLine = line.replace(/\buseRef\d*\(/, `this.useRef('${key}',`);

      line = updatedLine; 
    }


    newLines.push(line)
  }
  let c = newLines.join('\n')
  return c
}
builtCode = handleReplacements(builtCode)

fs.writeFileSync(path.join(process.cwd(), 'dist', process.env.filePath), builtCode)

let isClass = function (element) {
  return element && element.toString().startsWith("class");
};
const generatePage = async (
  data = { path: process.env.INPUT, route: process.env.OUT }
) => {
  const { path, route } = data;
  if (path.includes("root.js")) return;
  let html = await import(path).then((m) => m.default);

  let { head } = await import(path).then((m) => m);
  let isFunction = false;
  globalThis.isServer = true;
  if (!html) {
    return
  }
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



  if (h.includes("<head>")) {
    h = h.replace("<head>", `<head>${process.env.bindes}`)
  } else {
    h += process.env.bindes
  }

  await Bun.write(
    process.cwd() + "/dist/" + route + "/index.html",
    `<!DOCTYPE html>
      ${h} 
      <script type="module"> 
        import c from '${process.env.filePath}'
        import {render, e} from '/src/vader/index.js'
        window.e = e
        render(c, document.body.firstChild)
      </script> 
            `
  );
  console.log(
    ansiColors.blue(
      `${process.env.filePath.replace(".js", ".jsx")} - ${parseInt(
        process.env.size
      ).toFixed(2)}kb`
    )
  );
  process.exit(0);
};
 
try {
  if (process.env.isJsx == "true" && process.env.isAppFile == "true") {
    generatePage({ path: process.env.INPUT, route: process.env.OUT })
  }
} catch (error) {
  console.log(ansiColors.red(error))
}
