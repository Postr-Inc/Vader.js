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
  querySelector: (query) => {
    return Object.create({
      addEventListener: (event, cb) => { },
      removeEventListener: (event, cb) => { },
      innerHTML: "",
      appendChild: (child) => { },
      removeChild: (child) => { },
      src: "",
      style: {},
    });
   },
  querySelectorAll: (query) => { 
    return []
  },
};
globalThis.window = {
  addEventListener: (event, cb) => { },
  removeEventListener: (event, cb) => { },
  localStorage: {
    setItem: (key, value) => { },
    getItem: (key) => { },
  },
  sessionStorage: {
    setItem: (key, value) => { },
    getItem: (key) => { },
  },
  location: {
    href: "",
    pathname: "",
  },
} 

globalThis.localStorage = {
  setItem: (key, value) => { },
  getItem: (key) => { },
}
try {
  await Bun.build({
    entrypoints: [process.env.ENTRYPOINT],
    minify: false,
    root: process.cwd() + "/dist/",
    outdir: process.cwd() + "/dist/",
    format: "esm",
    ...(JSON.parse(process.env.DEV) ? { sourcemap: "inline" } : {}),
    packages: "bundle",
    env: "inline", 
    external: ["vaderjs", "*.png", "*.jpg", "*.jpeg", "*.gif", "*.svg", "*.css"],
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
    if (hasImport && line.includes('react')) {
      line = line.replace('react', '/src/vader/index.js')
    }  
    if(hasImport && line.includes('public') && line.includes('.png') ||
hasImport &&     line.includes('.jpg') || hasImport &&   line.includes('.jpeg') || hasImport &&   line.includes('.gif') || hasImport &&   line.includes('.svg')) {
       let url = line.split('"')[1]
       // replace ../../
        var b4 = url
        let filevariable = line.split("import")[1].split("from")[0].replace(" ", "").replace("{", "").replace("}","")
         
        url =   url.replace('../../', '').replace('../', '').replace('./', '')
        line = `var ${filevariable} = "${url}"`
        console.log(line)
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

    if (!hasImport && line.match(/\buseRef\d*\(/) && line.includes('[') && !line.includes("this")) {
      line = line.replace(' ', '')
      let b4 = line
      let key = line.split('=')[0].split(' ').filter(Boolean)[1]
      console.log(key)
      b4 = line.replace('useRef(', `this.useRef('${key}',`)
      line = b4
    }


    newLines.push(line)
  }
  let c = newLines.join('\n')
  return c
}
builtCode = handleReplacements(builtCode)
builtCode =  await new Bun.Transpiler({
  loader: 'tsx',
  tsconfig:{
    "compilerOptions": {
      "jsx": "react",
      "jsxFactory": "e",
      "jsxFragmentFactory": "Fragment"
  }
  }
}).transformSync(builtCode) 
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
  if(process.env.bindes.includes('<link rel="stylesheet" ')){
    // turn stylesheet into inline style
    let links = process.env.bindes.split('<link rel="stylesheet" ')
    let styles = []
    for(let link of links){
      if(link.includes('href')){
        let href = link.split('href=')[1].split('>')[0].replace('"', '').replace('"', '')
        let file = fs.readFileSync(path2.join(process.cwd() + "/dist/", href), 'utf-8')
        styles.push(file)
      }
    } 
    let style = styles.join('\n')
    process.env.bindes = `
    <style>
      ${style}
    </style>
    `
  }

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
      <script  defer type="module"> 
        import c from '${process.env.filePath}'
        import {render, e} from '/src/vader/index.js'
        window.e = e
        render(c, document.body)
        console.log(e)
      </script> 
      
       ${process.env.bindes}
      </head> 
      ${h} 
       
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
