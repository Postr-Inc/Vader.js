#!/usr/bin/env node
import fs from "fs";
import { glob, globSync, globStream, globStreamSync, Glob, } from 'glob'
let bundleSize = 0;
let errorCodes = {
  "SyntaxError: Unexpected token '<'": "You forgot to enclose tags in a fragment <></>",
}
/**
 * define directories
 */
let dirs = {
  ...fs.existsSync(process.cwd() + '/pages') ? { pages: true } : { pages: false },
  ...fs.existsSync(process.cwd() + '/src') ? { components: true } : { components: false },
  ...fs.existsSync(process.cwd() + '/public') ? { public: true } : { public: false },
  ...fs.existsSync(process.cwd() + '/dist') ? { dist: true } : { dist: false },
  ...fs.existsSync(process.cwd() + '/dist/pages') ? { distpages: true } : { distpages: false },
  ...fs.existsSync(process.cwd() + '/dist/src') ? { distcomponents: true } : { distcomponents: false },
  ...fs.existsSync(process.cwd() + '/dist/public') ? { distpublic: true } : { distpublic: false },
}


Object.keys(dirs).map((key, index) => {
  if (!dirs[key]) {
    fs.mkdirSync(process.cwd() + '/' + key)
  }
}).filter(Boolean)[0]

if(process.env.isCloudflare){
  let htmlFile = fs.readFileSync(process.cwd() + "/node_modules/vaderjs/runtime/index.html", 'utf8')
  fs.writeFileSync(process.cwd() + "/dist/index.html", htmlFile)
}

function Compiler(func, file) {
  let string = func;
  // Remove block comments 
 
  let returns = []
  let comments = string.match(/\{\s*\/\*.*\*\/\s*}/gs)?.map((comment) => comment.trim());

  let savedfuncnames = [];
  let functions = string.match(
    /(?:const|let)\s*([a-zA-Z0-9_-]+)\s*=\s*function\s*\(([^)]*)\)|function\s*([a-zA-Z0-9_-]+)\s*\(([^)]*)\)/gs
  )
    ?.map((match) => match.trim());

  let functionNames = [];


  functions && functions.forEach((func) => {
    if (
      !func.match(
        /(?:const|let)\s*([a-zA-Z0-9_-]+)\s*=\s*function\s*\(([^)]*)\)|function\s*([a-zA-Z0-9_-]+)\s*\(([^)]*)\)/gs
      )
    ) {
      return;
    }

    let name = func.split(" ")[1].split("(")[0].trim();

    let lines = string.match(/return\s*\<>.*\<\/>/gs);

    if (lines) {
      for (let i = 0; i < lines.length; i++) {
        let line = lines[i];

        if (!functionNames.includes(name)) {
          functionNames.push(name);
        }
      }
    }
  });

  // get all Obj({}) and parse to JSON.stringify

  let objects = string.match(/Obj\({.*}\)/gs);

  objects && objects.forEach((obj) => {
    let key = obj.split("Obj")[1].split("(")[1].split(")")[0].trim();
    let newobj = obj.replaceAll(`Obj(${key})`, `${key}`);
    // let newobj = obj.replaceAll(`Obj(${key})`, `JSON.parse('${key}')`)
    string = string.replaceAll(obj, `this.handleObject('${newobj}')`);
  });


  let childs = [];



  function extractAttributes(code) {
    // Match elements with opening tags
    const elementRegex = /<([a-zA-Z0-9_-]+)([^>]*)>/gs;

    // Match attributes in an opening tag, including those with ={}
    // Match attributes in an opening tag, including those with ={...}
    const attributeRegex =
      /\s*([a-zA-Z0-9_-]+)(\s*=\s*("([^"\\]*(\\.[^"\\]*)*)"|'([^'\\]*(\\.[^'\\]*)*)'|\{(?:[^{}]|(?:\{(?:[^{}]|(?:\{[^{}]*\})*)*\})*)*\}|(?:\([^)]*\)|\{[^}]*\}|()=>\s*(?:\{[^}]*\})?)|\[[^\]]*\]))?/gs;

    // only return elements with attribute {()=>{}} or if it also has parameters ex: onclick={(event)=>{console.log(event)}} also get muti line functions
    const functionAttributeRegex =
      /\s*([a-zA-Z0-9_-]+)(\s*=\s*{(?:[^{}]|(?:\{(?:[^{}]|(?:\{[^{}]*\})*)*\})*)*})/gs;

    let attributesList = [];

    // handle functions
    let functionAttributes = [];
    let functionMatch;
    while ((functionMatch = functionAttributeRegex.exec(code)) !== null) {
      let [, attributeName, attributeValue] = functionMatch;
      let attribute = {};

      if (attributeValue && attributeValue.includes("=>") || attributeValue && attributeValue.includes("function")) {
        let functionparams = [];
        // ref with no numbers
        let ref = Math.random().toString(36).substring(2).split('').filter((e) => !Number(e)).join('')
        let old = `${attributeName}${attributeValue}`
        functionNames.forEach((name) => {
          string.split("\n").forEach((line) => {
            if (line.includes(name) && line.includes("function")) {
              line = line.trim();
              line = line.replace(/\s+/g, " ");

              let ps = line.split("(").slice(1).join("(").split(")")[0].trim();

              // remove comments
              ps = ps.match(/\/\*.*\*\//gs)
                ? ps.replace(ps.match(/\/\*.*\*\//gs)[0], "")
                : ps; 
              functionparams.push({ ref: ref, name: name, params: ps });
               
            }
          });
        });
        let elementMatch = string.match(/<([a-zA-Z0-9_-]+)([^>]*)>/gs);
        let isJSXComponent = false;
        elementMatch.forEach((element) => {
          element = element.trim().replace(/\s+/g, " ");
          if (element.includes(attributeName)) {
            let elementTag = element
              .split("<")[1]
              .split(">")[0]
              .split(" ")[0];
            isJSXComponent = elementTag.match(/^[A-Z]/) ? true : false;
          }
        });   
        let newvalue = attributeValue.includes('=>') ? attributeValue.split("=>").slice(1).join("=>").trim() : attributeValue.split("function").slice(1).join("function").trim()
  

        newvalue = newvalue.trim();

        //remove starting {
        newvalue = newvalue.replace("{", "");

       
        let params = attributeValue
          .split("=>")[0]
          .split("(")[1]
          .split(")")[0]
          .trim();

        // remove comments 
        params = params.match(/\/\*.*\*\//gs)
          ? params.replace(params.match(/\/\*.*\*\//gs)[0], "")
          : params; 
        // split first {}
        newvalue = newvalue.trim();

        if (newvalue.startsWith("{")) {
          newvalue = newvalue.split("{")[1];
        }

        switch (true) {
          case newvalue.endsWith("}}"):
            newvalue = newvalue.replace("}}", "");
            break;
          case newvalue.endsWith("}"):
            newvalue = newvalue.replace("}", "");
            break;
        } 
        // replace trailing }
        newvalue = newvalue.trim();
        if (newvalue.endsWith("}")) {
          newvalue = newvalue.replace("}", "");
        } 
        functionparams.length > 0 ? params = params + ',' + functionparams.map((e) => e.name).join(',') : null  
        newvalue = newvalue.split('\n').map(line => line.trim() ? line.trim() + ';' : line).join('\n');
        newvalue = newvalue.replaceAll(',,', ',')
        let paramnames = params ? params.split(',').map((e) => e.trim())  : null
        paramnames = paramnames ? paramnames.filter((e) => e.length > 0) : null
        // remove comments
        paramnames = paramnames ? paramnames.map((e) => e.match(/\/\*.*\*\//gs) ? e.replace(e.match(/\/\*.*\*\//gs)[0], "") : e) : null
        
        let bind =  isJSXComponent ? `${attributeName}=function(${params}){${newvalue}}.bind(this)` :  `${attributeName} = "\$\{this.bind("${newvalue.replace(/\s+g/, " ")}", ${isJSXComponent}, "${ref}",   "${paramnames ?   paramnames.map((e, index)=> {
          if(e.length < 1) return  ''
          if(e.length > 0){
            index == 0 ?  e : ',' + e
         }
          return e
        }) : ''}" ${params ? params.split(',').map((e) => e.trim()).filter(Boolean).map((e) => `,${e}`).join('') : ''})}"`
        bind = bind.replaceAll(/\s+/g, " "); 
        string = string.replace(old, bind);
      }
    }

    let match;
    while ((match = elementRegex.exec(code)) !== null) {
      let [, element, attributes] = match;

      let attributesMatch;
      let elementAttributes = {};

      while ((attributesMatch = attributeRegex.exec(attributes)) !== null) {
        let [, attributeName, attributeValue] = attributesMatch;

        elementAttributes[attributeName] = attributeValue || null;
      }

      attributesList.push({ element, attributes: elementAttributes });
    }

    return attributesList;
  }

  function extractOuterReturn(code) {
    // match return [...]
    let returns = code.match(/return\s*\<>.*\<\/>/gs)

    return returns || [];
  }
  // throw error if return is not wrapped in <></> if return is found and not wrapped in <></> or <div></div> and not <><div></div></>
  if (string.match(/return\s*\<>/gs) && !string.match(/return\s*\<>.*\<\/>/gs)
    || string.match(/return\s*\<[a-zA-Z0-9_-]+.*>/gs)
  ) {
    throw new SyntaxError("You forgot to enclose jsx in a fragment <></> at line " + string.split(/return\s*\<[a-zA-Z0-9_-]+.*>/gs)[0].split('\n').length + ' in file ' + file)
  }

  let outerReturn = extractOuterReturn(string);
  let contents = "";
  let updatedContents = "";
  outerReturn.forEach((returnStatement) => {

    let lines = returnStatement.split("\n");

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      if (line.match(/return\s*\<>/gs)) {
        continue;
      }
      contents += line + "\n";
    }

    // Remove trailing ']'
    contents = contents.trim().replace(/\]$/, "");
    updatedContents = contents;
    let attributes = extractAttributes(contents);

    let newAttributes = [];
    let oldAttributes = [];
    attributes.forEach((attribute) => {
      const { element, attributes } = attribute;
      if (Object.keys(attributes).length === 0) return;


      newAttributes.push(attribute);
      for (let key in attributes) {

        let value = attributes[key];
        let oldvalue = value;
        if (value && !value.new) {
          if (value && value.includes("={")) {
            value = value.replace("=", "");
            value == "undefined" ? (value = '"') : (value = value);

            key == 'style'
              && value.includes("{{")
              ? value = `{this.parseStyle({${value.split('{{')[1].split('}}')[0]}})}` : null


            value = `="\$${value}",`;
            string = string.replace(oldvalue, value);

          } else if (value && value.includes("={`")) {
            value = value.replace("=", "");

            value = `"\$${value}",`;
            string = string.replace(oldvalue, value);

          }
        } else if (value && value.new) {
          string = string.replace(value.old, value.new);
        }
      }
    });
  });

  let retursnString = [];
  let outerReturnString = extractOuterReturn(string);

  outerReturnString.forEach((returnStatement) => {
    let lines = returnStatement.split("\n");
    let code = "";
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];

      code += line + "\n";
    }

    code = code.trim().replace(/\<\/\>$/, "");
    retursnString.push(code);
  });

  retursnString.forEach((returnStatement, index) => {
    let old = outerReturnString[index];

    let newReturn = `${returnStatement}</>`;
    string = string.replace(old, newReturn);
  });

  if (comments) {
    comments.forEach((comment) => {
      let before = comment.trim();

      comment = comment.replaceAll(/\s+/g, " ");
      comment = comment.trim();
      string = string.replace(before, comment);
      let to_remove = comment.split("{")[1].split("}")[0].trim();
      let beforeComment = comment;
      comment = comment.replaceAll(`{ ${to_remove} }`, "");

      string = string.replace(beforeComment, comment);
    });
  }
  let lines = string.split("\n");
  lines.forEach((line) => {

    if (
      line.includes("let") ||
      line.includes("const") ||
      line.includes("var")
    ) {
      switch (true) {
        case line.includes("useState") && !line.includes("import"):
          let varType = line.split("[")[0]
          let key = line.split("=")[0].split(",")[0].trim().split('[')[1];

          let setKey = line.split("=")[0].trim().split(",")[1].trim().replace("]", "");
          key = key.replace("[", "").replace(",", "");
          let valuestate = line.split("=")[1].split("useState(")[1];

          let regex = /useState\((.*)\)/gs;
          valuestate = valuestate.match(regex) ? valuestate.match(regex)[0].split("useState(")[1].split(")")[0].trim() : valuestate


          let newState = `${varType} [${key}, ${setKey}] = this.useState('${key}', ${valuestate}
           
            `;
          string = string.replace(line, newState);
          break;
        case line.includes("useRef") && !line.includes("import"):
          line = line.trim();
          let typeref = line.split(" ")[0]

          let keyref = line.split(typeref)[1].split("=")[0].trim().replace("[", "").replace(",", "");


          let valueref = line.split("=")[1].split("useRef(")[1];

          let newStateref = `${typeref} ${keyref} = this.useRef('${keyref}', ${valueref}`;
          string = string.replace(line, newStateref);
          break;
        case line.includes("useReducer") && !line.includes("import"):
          line = line.trim();
          line = line.replaceAll(/\s+/g, " ");

          let varTypereducer = line.split(" ")[0];
          let keyreducer = line
            .split("=")[0]
            .split(" ")[1]
            .trim()
            .replace("[", "")
            .replace(",", "");
          let setKeyreducer = line.split("=")[0].trim().split(",")[1].trim().replace("]", "");

          let reducer = line.split("=")[1].split("useReducer(")[1];

          let newStatereducer = `${varTypereducer} [${keyreducer}, ${setKeyreducer}] = this.useReducer('${keyreducer}', ${line.includes('=>') ? reducer + '=>{' : reducer}`;

          string = string.replace(line, newStatereducer);
          break;
      }

    }
  });


  string = string.replaceAll(/\$\{\/\*.*\*\/\}/gs, "");

  string = string.replaceAll('../src', './src')

  function parseComponents(body, isChild) {
    let componentRegex =
      /<([A-Z][a-zA-Z0-9_-]+)([^>]*)\/>|<([A-Z][a-zA-Z0-9_-]+)([^>]*)>(.*?)<\/\3>/gs;

    let componentMatch = body.match(componentRegex);
    let topComponent = "";
    componentMatch?.forEach(async (component) => {
      let [, element, attributes] = component;

      !isChild ? (topComponent = component) : null;
      let before = component;
      component = component.trim().replace(/\s+/g, " ");

      let myChildrens = [];

      let name = component.split("<")[1].split(">")[0].split(" ")[0].replace("/", "");
      let props = component.split(`<${name}`)[1].split(">")[0].trim()


      let savedname = name;
      let children = props
        ? component
          .split(`<${name}`)[1]
          .split(`${props}`)[1]
          .split(`</${name}>`)[0]
          .trim()
          .replace(">", "")
        : component.split(`<${name}`)[1].split(`</${name}>`)[0].trim().replace(">", "");
      name = name + Math.random().toString(36).substring(2);
      if (children && children.match(componentRegex)) {
        children = parseComponents(children, true);
        childs.push({ parent: name, children: children });
      } else {

        children = `\`${children}\`,`;
        children ? childs.push({ parent: name, children: children }) : null;
      }

      childs.forEach((child) => {
        if (child.parent == name) {
          let html = child.children.match(
            /<([a-zA-Z0-9_-]+)([^>]*)>(.*?)<\/\1>/gs
          );
          if (html) {
            html = html.map((h) => h.trim().replace(/\s+/g, " ")).join(" ");
            let before = child.children;
            child.children = child.children.replaceAll(html, `${html}`);
            // remove duplicate quotes 
          }

          myChildrens.push(child.children);
        }
      });



      /**
       * @prop {string} props
       * @description replace any given possible value in props and parse the string to a valid JSON object
       */
      props = props
        .replaceAll('"', "'")


        .replaceAll(",,", ',')
        .replaceAll("className", "class")
        .replaceAll("classname", "class")
        .replaceAll("'${", "")
        .replaceAll("}'", "")
        .split("$:")
        .join("")
        // replace / with '' at the end of the string
        .replace(/\/\s*$/, "")

        .replace(/,\s*$/, "")
        .replaceAll('="', ':"')
        .replaceAll("='", ":'")
        .replaceAll('=`', ':`')
        .replaceAll(`={\``, ':`')
        .replaceAll('`}', '`')
        .replaceAll(",,", ',')
        .replaceAll(/=(?=(?:(?:[^"']*["'][^"']*['"])*[^"']*$))/g, ':');

      props = props.replace(/:('[^']*'|"[^"]*")/g, ':$1,');
      // ANY VALUE NUMBER BOOLEAN OR STRING
      props = props.replace(/=(\d+)/g, ':$1,');
      props = props.replaceAll(',,', ',')


      /**
       * @memoize - memoize a component to be remembered on each render and replace the old jsx
       */

      let replace = "";
      replace = isChild
        ? `this.memoize(this.createComponent(${savedname.replaceAll('/', '')}, ${props}, [${myChildrens.length > 0 ? myChildrens.join(",") : ""
        }])),`
        : `\${this.memoize(this.createComponent(${savedname.replaceAll('/', '')}, {${props}}, [${myChildrens.length > 0 ? myChildrens.join(",") : ""
        }]))}`;

      body = body.replace(before, replace);
    });

    return body;
  }



  // replace all comments
 
  string = string.replaceAll('vaderjs/client', '/vader.js')
  // replace ${... with ${
    
  string = string.replaceAll(/\$\{[^{]*\.{3}/gs, (match) => {
    if (match.includes('...')) {
      // Your logic for replacement goes here
      // For example, you can replace '...' with some other string
      return match.replace('...', '');
    }
  
    return match;
  });
  
  string = string.replaceAll(/\$\{\/\*.*\*\/\}/gs, "");
  string = string.replaceAll("<>", "`").replaceAll("</>", "`");
  string = parseComponents(string);

  string = string
    .replaceAll("className", "class")
    .replaceAll("classname", "class"); 

  string = string.replaceAll('../src', './src')
  string += `\n\n //wascompiled`;
  

  string = string.replaceAll("undefined", "");
  const parse = (css) => {
    let styles = {};
    let currentSelector = '';

    css.split('\n').forEach(line => {
      line = line.trim();

      if (line.endsWith('{')) {
        // Start of a block, extract the selector
        currentSelector = line.slice(0, -1).trim();
        styles[currentSelector] = {};
      } else if (line.endsWith('}')) {
        // End of a block
        currentSelector = '';
      } else if (line.includes(':') && currentSelector) {
        // Inside a block and contains key-value pair
        let [key, value] = line.split(':').map(part => part.trim());
        styles[currentSelector][key] = value;
      }
    });

    return styles;
  };
  string.split('\n').forEach(line => {
    if (line.includes('import')) {
      // Regular expression for matching import() statements
      let asyncimportMatch = line.match(/import\s*\((.*)\)/gs);
      // handle named imports and unnamed import 'path'
      let regularimportMatch = line.match(/import\s*([a-zA-Z0-9_-]+)?\s*from\s*('(.*)'|"(.*)")|import\s*('(.*)'|"(.*)")/gs);
    

      if (asyncimportMatch) {
        asyncimportMatch.forEach(async (match) => {
          let beforeimport = match
          let path = match.split('(')[1].split(')')[0].trim()
          let newImport = ''
          let name = match.split('import')[1].split('from')[0].trim()
          switch (true) {
            case path && path.includes('json'):
              path = path.replace(';', '')
              newImport = `let ${name} = await fetch('${path}').then(res => res.json())`

              break;
            case path && path.includes('module.css'):
              let css = await fs.readFileSync(process.cwd() + path, 'utf8')
              css = css.replaceAll('.', '')
           
              if (!name) {
                throw new Error('Could not find name for css module ' + path + ' at' + beforeimport + ' file' + file)
              }
              newImport = `let ${name} = ${JSON.stringify(parse(css.replaceAll('.', '').replace(/\s+/g, " ")))}`
            
              break;
            default:
              let deep = path.split('/').length - 1
              for (let i = 0; i < deep; i++) {
                path = path.split('../').join('')
                path = path.split('./').join('')
              }
              path = path.replace(/'/g, '').trim().replace(/"/g, '').trim()
              // remove double / from path
              path = path.split('//').join('/')
              if (!path.startsWith('./') && !path.includes('/vader.js') && !path.startsWith('src')
              && !path.startsWith('/public')
              ) { 
                path = '/src/' + path
              }

              path = path.replaceAll('.jsx', '.js');
              newImport = `await import(${path})`
          }
          if (newImport) {
            string = string.replace(beforeimport, newImport)
          }
        })
      }

      if (regularimportMatch) {
        for (let match of regularimportMatch) {
          let beforeimport = match 
          // import {name} from 'path' or import 'path'
          let path = match.split('from')[1] ? match.split('from')[1].trim() : match.split('import')[1].trim()
          let newImport = ''
          let name = match.split('import')[1].split('from')[0].trim()
  
          path = path.replace(/'/g, '').trim().replace(/"/g, '').trim()
          switch (true) {
            case path && path.includes('json'):
              path = path.replace(';', '')
              newImport = `let ${name} = await fetch('${path}').then(res => res.json())`

              break;
            case path && path.includes('module.css'):
            
            path = path.replace(';', '')
            path = path.replace(/'/g, '').trim().replace(/"/g, '').trim()
            path = path.replaceAll('.jsx', '.js');
            path = path.replaceAll('../', '');
            
            let css = fs.readFileSync(process.cwd() + '/' + path, 'utf8')
 
            css = css.replaceAll('.', '') 
            newImport = `let ${name} = ${JSON.stringify(parse(css))}`
            string = string.replace(beforeimport, newImport)
              break;
            case path && path.endsWith('.css'): 
               console.log(path)
              string = string.replace(beforeimport, '')
              newImport = ``
              break;
            default:
              let beforePath = path
              let deep = path.split('/').length - 1
              for (let i = 0; i < deep; i++) {
                path = path.split('../').join('')
                path = path.split('./').join('')
              }
              path = path.replace(/'/g, '').trim().replace(/"/g, '').trim()
              // remove double / from path
              path = path.split('//').join('/') 
              if (!path.startsWith('./') && !path.includes('/vader.js') && !path.startsWith('src') && !path.startsWith('public')) {
                path.includes('src') ? path.split('src')[1] : null
                path = '/src/' + path
              } else if (path.startsWith('src') || path.startsWith('public')) {
                path = '/' + path
              } 
              path = path.replaceAll('.jsx', '.js');
  
  
              string = string.replace(beforePath, path)
              break;
              
          }
           
          let html = fs.existsSync(process.cwd() + '/dist/index.html') ? fs.readFileSync(process.cwd() + '/dist/index.html', 'utf8') : ''
          if (!html.includes(`<link rel="preload" href="${path.replace(/'/g, '').trim()}" as="${path.replace(/'/g, '').trim().includes('.css') ? 'style' : 'script'}">`)
           && !path.includes('.module.css') 
          ) { 
            let preload = `
            ${
              path.trim().includes('.css') ? `<link rel="stylesheet" href="${path.trim()}">` : ''
            }
            ${!path.trim().includes('.css') ? `<link rel="modulepreload" href="${path.trim()}">` : ''}<link rel="preload" href="${path.trim()}" as="${path.trim().includes('.css') ? 'style' : 'script'}">`
            html = html.replace('</head>', `${preload}\n</head>`)

            fs.writeFileSync(process.cwd() + '/dist/index.html', html)
          }
          if (newImport) {
            string = string.replace(beforeimport, newImport)
          }

        }


      }
    }


  })

  return string
}
 
globalThis.isBuilding = false
globalThis.isWriting =  null
async function Build() {
  globalThis.isBuilding = true
  console.log('Compiling......')
  let reader = async (file) => {
    let text = await fs.readFileSync(file, "utf8");
    return text;
  };

  let writer = async (file, data) => {
    globalThis.isWriting =  file
    switch (true) {
      case !fs.existsSync(file):
        fs.mkdirSync(file.split('/').slice(0, -1).join('/'), { recursive: true })
        break;
    }
    if(globalThis.isWriting !== file){
      return
    }
    await  fs.writeFileSync(file, data);

    globalThis.isWriting = null
    return { _written: true };
  };


  const glb = await glob("**/**/**/**.{jsx,js}", {
    ignore: ["node_modules/**/*", "dist/**/*"],
    cwd: process.cwd() + '/pages/',
    absolute: true,
    recursive: true
  });

  // Process files in the 'pages' directory
  let appjs = '';
  let hasWritten = []
  const writejs = () => {

    writer(process.cwd() + '/dist/app.js', appjs)
  }



  for await (let file of glb) {
    // Normalize file paths
    let origin = file.replace(/\\/g, '/');
    let fileName = origin.split('/pages/')[1].split('.jsx')[0].replace('.jsx', '') + '.jsx';
    let isBasePath = fileName === 'index.jsx';

    // Extract all dynamic parameters from the file path [param1]/[param2]/[param3
    let aburl = origin.split('/pages')[1].split('.jsx')[0].replace('.jsx', '').split('[').join(':').split(']').join('');

    if (aburl.includes('...')) {
      // this is a catch all route
      // it should be /pages/[...]/index.jsx or /pages/[...].jsx  
      aburl = aburl.split('...').join('*').split(':*').join('*')
      aburl = aburl.replaceAll('./index', '')

    }
    // Create an object with URL and pathname properties
    let obj = {
      url: isBasePath ? '/' : aburl.replaceAll('/index', ''),
      pathname: `/pages/${origin.split('pages/')[1].split('.jsx')[0].replace('.jsx', '')}.jsx`,
      fullpath: origin,
    };



    let data = await fs.readFileSync(origin, "utf8");
    data = Compiler(data, origin);



    await writer(process.cwd() + "/dist/pages/" + fileName.replace('.jsx', '.js'), data).then(async () => {

      let { minify } = await import('terser')
      
      try {
        let minified = await minify(data, {
          toplevel: true,
          ecma:2016,
          enclose:false,
          module: true,
          compress: true,
          keep_fnames: true,

        })
         
        await writer(process.cwd() + "/dist/pages/" + fileName.replace('.jsx', '.js'), minified.code)
      } catch (error) {
        console.log(error)
      }
    })


    obj.compiledPath = process.cwd() + "/dist/pages/" + fileName.replace('.jsx', '.js')


    // Generate routing logic
    let js = `
      router.get('${obj.url}', async (req, res) => {
        res.render(await import('./pages/${fileName.replace('.jsx', '.js')}'), req, res)
      }) 
      //@desc ${obj.pathname}
    ` + '\n';
    appjs += js

    writejs()




  }



  const scannedSourceFiles = await glob("**/**.{jsx,js,json}", {
    ignore: ["node_modules/**/*", "dist/**/*"],
    cwd: process.cwd() + '/src/',
    absolute: true,
  });
  const scannedVaderFiles = await glob("**/**.{html,js}", {
    cwd: process.cwd() + '/node_modules/vaderjs/runtime',
    absolute: true,
  });

  scannedVaderFiles.forEach(async (file) => {
    file = file.replace(/\\/g, '/');


    let name = file.split('/node_modules/vaderjs/runtime/')[1]
    if (file.includes('index.html') && fs.existsSync(process.cwd() + "/dist/" + name)) {
      return
    }
    let data = await reader(file)
    bundleSize += fs.statSync(file).size;
    await writer(process.cwd() + "/dist/" + name, data);
  })
  scannedSourceFiles.forEach(async (file) => {
    file = file.replace(/\\/g, '/');
    let name = file.split('/src/')[1]
    //parse jsx 

    let data = await reader(process.cwd() + "/src/" + name)
    if (name.includes('.jsx')) {
      data = Compiler(data, process.cwd() + "/src/" + name);

      await writer(process.cwd() + "/dist/src/" + name.split('.jsx').join('.js'), data).then(async () => {
        let { minify } = await import('terser')
        try {
          let minified = await minify(data, {
            ecma: " 2016",
            module: true,
            compress: true,
            keep_fnames: true,
          })
          await writer(process.cwd() + "/dist/src/" + name.replace('.jsx', '.js'), minified.code)
        } catch (error) {
          console.log(error)
        }

      })
      return
    }
    bundleSize += fs.statSync(process.cwd() + "/src/" + name).size;
    await writer(process.cwd() + "/dist/src/" + name, data);
  })

  const scannedPublicFiles = await glob("**/**.{css,js,html}", {
    ignore: ["node_modules/**/*", "dist/**/*"],
    cwd: process.cwd() + '/public/',
    absolute: true,
  });
  scannedPublicFiles.forEach(async (file) => {
    file = file.replace(/\\/g, '/');
    file = file.split('/public/')[1]
    let data = await reader(process.cwd() + "/public/" + file)
    bundleSize += fs.statSync(process.cwd() + "/public/" + file).size;
    await writer(process.cwd() + "/dist/public/" + file, data);
  })
  const scannedFiles = await glob("**/**.{css,js,html}", {
    ignore: ["node_modules/**/*", "dist/**/*"],
    cwd: process.cwd() + "/runtime/",
    absolute: true,
  })


  if (!fs.existsSync(process.cwd() + "/dist/index.html")) {

    scannedFiles.forEach(async (file) => {
      file = file.split(process.cwd() + '/runtime/')[1]
 
      let objCase = {
        ...file == "app.js" ? { exit: true } : null,
        ...file.includes("index.html") && fs.existsSync(process.cwd() + "/runtime/" + file) ? { exit: true } : null,

      }
      if (objCase.exit) {
        console.log('exiting')
        return
      }
      bundleSize += fs.statSync(process.cwd() + "/runtime/" + file).size;
      let data = await reader(process.cwd() + "/runtime/" + file) 
      await writer(process.cwd() + "/dist/" + file, data);
    });

  } 

  globalThis.isBuilding = false
  console.log(`Build complete! ${Math.round(bundleSize / 1000)}${bundleSize > 1000 ? 'kb' : 'bytes'} written to ./dist`)
  bundleSize = 0;
  return true
}
import { watch } from "fs";

switch (true) {
  case process.argv.includes('--watch'):

    globalThis.devMode = true
    console.log(`
Vader.js v1.3.3
- Watching for changes in ./pages
- Watching for changes in ./src
- Watching for changes in ./public
`)
    !globalThis.isBuilding ? Build() : null


    Array.from(Array(3).keys()).forEach((i) => {
      let p = `${process.cwd()}${i == 0 ? '/pages/' : i == 1 ? '/src/' : '/public/'}` 
      watch(p
        , { recursive: true }, (event, filename) => {
          if (event == 'change'
            && !globalThis.isBuilding
          ) {
             
            Build()
          }
        }).on('error', (err) => console.log(err))
    })


    break;
  case process.argv.includes('--build'):
    globalThis.devMode = false
    console.log(`
Vader.js v1.3.3 
Building to ./dist
`)
    Build()
    break;
  default:
    console.log(`
Vader.js is a reactive framework for building interactive applications for the web built ontop of bun.js!

Usage: vader <command> 

Commands:
  --watch     Watch the pages folder for changes and recompile 

  --build     Build the project
Learn more about vader:           https://vader-js.pages.dev/
    
`)
    break;

}
