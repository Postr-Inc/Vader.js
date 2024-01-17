#!/usr/bin/env node
import fs from "fs";
import { glob, globSync, globStream, globStreamSync, Glob } from 'glob'
 
let bundleSize = 0; 
if(!fs.existsSync(process.cwd() + '/dist')){
  fs.mkdirSync(process.cwd() + '/dist')
  fs.mkdirSync(process.cwd() + '/dist/public')
  fs.mkdirSync(process.cwd() + '/dist/src')
  fs.mkdirSync(process.cwd() + '/dist/pages')
}else if(!fs.existsSync(process.cwd() + '/dist/public')){
  fs.mkdirSync(process.cwd() + '/dist/public')
}else if(!fs.existsSync(process.cwd() + '/src') && !fs.existsSync(process.cwd() + '/dist/src')){
  fs.mkdirSync(process.cwd()  + '/dist/src')
  fs.mkdirSync(process.cwd()  + '/src')
}
 
function Compiler(func) {
  let string = func;
  let comments = string

    .match(/\{\s*\/\*.*\*\/\s*}/gs)
    ?.map((comment) => comment.trim());

  let savedfuncnames = [];
  let functions = string
    .match(
      /(?:const|let)\s*([a-zA-Z0-9_-]+)\s*=\s*function\s*\(([^)]*)\)|function\s*([a-zA-Z0-9_-]+)\s*\(([^)]*)\)/gs
    )
    ?.map((match) => match.trim());

  let functionNames = [];

  if (functions) {
    functions.forEach((func) => {
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
  }
  // get all Obj({}) and parse to JSON.stringify

  let objects = string.match(/Obj\({.*}\)/gs);
  if (objects) {
    objects.forEach((obj) => {
      let key = obj.split("Obj")[1].split("(")[1].split(")")[0].trim();
      let newobj = obj.replaceAll(`Obj(${key})`, `${key}`);
      // let newobj = obj.replaceAll(`Obj(${key})`, `JSON.parse('${key}')`)
      string = string.replaceAll(obj, `this.handleObject('${newobj}')`);
    });
  }

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

      if (attributeValue && attributeValue.includes("=>")) {
        let ref = Math.random().toString(36).substring(2);
        let old = `${attributeName}${attributeValue}`;

        let newvalue =
          attributeValue.split("=>")[1] || attributeValue.split("=>")[1].trim();

        newvalue = newvalue.trim();

        //remove starting {
        newvalue = newvalue.replace("{", "");

        let params = attributeValue
          .split("=>")[0]
          .split("(")[1]
          .split(")")[0]
          .trim();
        let functionparams = [];
        // split first {}
        newvalue = newvalue.trim();

        if (newvalue.startsWith("{")) {
          newvalue = newvalue.split("{")[1];
        }

        switch(true){
          case newvalue.endsWith("}}"):
            newvalue = newvalue.replace("}}", "");
            break;
          case newvalue.endsWith("}"):
            newvalue = newvalue.replace("}", "");
            break;
        }

        

        if (functionNames.length > 0) {
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
            newvalue = newvalue.trim();
            let lines = newvalue.split("\n");

            for (let i = 0; i < lines.length; i++) {
              let line = lines[i];

              if (line.includes(name) && !line.includes("useFunction")) {
                let hasParams = line.includes("(") && line.includes(")");
                let params = hasParams
                  ? line.split("(")[1].split(")")[0].trim()
                  : null;
 
                if (
                  functionparams.length > 0 &&
                  functionparams.find((p) => p.name == name)
                ) {
                  let params = functionparams.find((p) => p.name == name).params;
                  line.includes(params) ? (params = params) : (params = null);
                }

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

                if(isJSXComponent){
                   continue
                }
                let replacement = `this.useFunction(${name},
                  } ${params || null}${isJSXComponent ? "" : ","} true ${isJSXComponent ? "" : ","
                  } '${ref}')`;

                newvalue = newvalue.replace(
                  hasParams ? `${name}(${params})` : name,
                  `this.callFunction(\${${replacement}}, ${isJSXComponent ? true : false
                  }, event, \${JSON.stringify(${params || null})})`
                );
              }
            }

            params = params.match(/\/\*.*\*\//gs)
              ? params.replace(params.match(/\/\*.*\*\//gs)[0], "")
              : params;

            // get full element with function from string
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



            let otherdata = {};
           
            params ? (otherdata["params"] = params) : null;
            otherdata["jsx"] = isJSXComponent;
            otherdata["ref"] = ref;
 
            newvalue = newvalue.split('\n').map(line => line.trim() ? line.trim() + ';' : line).join('\n');
            
            // turn params into param1, param2, param3

            
            let paramString = params ? params.split(' ').map(param => param + ',').join('') : "";
 
            paramString = paramString.replaceAll(',,', ',')
            let jsxAttribute = `${attributeName}=function(${paramString}){${newvalue}}.bind(this),`
            let newatribute =  `${attributeName}="\${this.bind(\`${newvalue}\`, ${isJSXComponent ? true : false}, '${ref}', "${paramString}", ${params || null})}",`

            attribute[attributeName] = {
              old: old,
              new: isJSXComponent ? jsxAttribute : newatribute,
              attribute: attributeName,
            };
            attributesList.push({
              element: attributeName,
              attributes: attribute,
            });
          });
        }
        else {
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


          let otherdata = {};
          params ? (otherdata["params"] = params) : null;
          otherdata["jsx"] = isJSXComponent;
          otherdata["ref"] = ref; 
          // since js is all in one line split it
          newvalue = newvalue.split('\n').map(line => line.trim() ? line.trim() + ';' : line).join('\n'); 
          let paramString = params ? params.split(' ').map(param => param + ',').join('') : "";
          paramString = paramString.replaceAll(',,', ',')
          let jsxAttribute = `${attributeName}=function(${paramString}){${newvalue}}.bind(this),`
          let newattribute = `${attributeName}="\${this.bind(\`${newvalue}\`, ${isJSXComponent ? true : false}, '${ref}', "${paramString}", ${params || null})}",`
          newattribute = newattribute.replace(/\s+/g, " ")
          string = string.replace(old,  isJSXComponent ? jsxAttribute : newattribute);
        }
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
    let returns = code.match(/return\s*\<>.*\<\/>/gs);

    return returns || [];
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
            
            key == 'style' ? value = `{this.parseStyle({${value.split('{{')[1].split('}}')[0]}})}` : null

             
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
      if (line.match(/return\s*\<>/gs)) {
      }
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
      if (line.includes("useState") && !line.includes("import")) {
        line = line.trim();
        // derive [key, value] from line
        let type = line.split(" ")[0];
        let key = line
          .split("=")[0]
          .split(" ")[1]
          .trim()
          .replace("[", "")
          .replace(",", "");
        let setKey = line.split("=")[0].split(",")[1].trim().replace("]", "");

        key = key.replace("[", "").replace(",", "");
        let value = line.split("=")[1].split("useState(")[1] 
        let regex = /useState\((.*)\)/gs
        value = value.match(regex) ? value.match(regex)[0].split("useState(")[1].split(")")[0].trim() : value
          
          
        let newState = `${type} [${key}, ${setKey}] = this.useState('${key}', ${value}
         
          `;
       

        // get setkey calls and replace with this.setKey
        string.split("\n").forEach((line) => {
          if (line.includes(setKey) && !line.includes("useState")) {
            string = string.replace(line, line);
          }

          if (line.includes(key)) {
            line = line.replace(key, `this.states['${key}']`);

            string = string.replace(line, line);
          }
        });
        string = string.replace(line, newState);
      } else if (line.includes("useRef") && !line.includes("import")) {
        line = line.trim();
        // let ref = useRef(null)
        let type = line.split(" ")[0];
        let key = line.split("=")[0].split(" ")[1].trim();
        let value = line.split("=")[1].split("useRef(")[1] 
         
        let regex = /useState\((.*)\)/gs
        value = value.match(regex) ? value.match(regex)[0].split("useRef(")[1].split(")")[0].trim() : value
        let newState = `${type} ${key} = this.useRef('${key}', ${value}`;

        string = string.replace(line, newState);
      }
    }
  });

  // create a polyfill for Array.prototype.filter

  /**
   * @method Delete
   * @param {*} item
   * @returns  {Array} array
   * @description  Delete an item from an array
   */
  Array.prototype.delete = function (item) {
    let array = this;
    array.forEach((i, index) => {
      switch (true) {
        case typeof i === "object":
          if (JSON.stringify(i) === JSON.stringify(item)) {
            array.splice(index, 1);
          }
          break;
        default:
          if (i === item) {
            array.splice(index, 1);
          }
          break;
      }
    });

    return array;
  };

  // replaceall comments ${/* */} with ''
  string = string.replaceAll(/\$\{\/\*.*\*\/\}/gs, "");

  string = string.replaceAll('../src', './src')
 

  // capture <Component />, <Component></Component>, and <Component>content</Component>

  // Example usage
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
      
      .replaceAll(/=([A-z])/g, ":$1")
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



  string = string.replaceAll('vaderjs/client', './vader.js')
  string = string.replaceAll("<>", "`").replaceAll("</>", "`");
  string = parseComponents(string);
 
  string = string
    .replaceAll("className", "class")
    .replaceAll("classname", "class");

  string += `\n\n //wascompiled`;

  string = string.replaceAll("undefined", "");

  return string;
}
let bindings = []
globalThis.isBuilding = false
async function Build() {
  globalThis.isBuilding = true
  console.log('Compiling......')
  let reader = async (file) => {
    let text = await fs.readFileSync(file, "utf8");
    return text;
  };
  let writer = async (file, data) => {
    switch (true) {
      case !fs.existsSync(file):
        fs.mkdirSync(file.split('/').slice(0, -1).join('/'), { recursive: true })
        break;
    }
    await  fs.writeFileSync(file, data);

    return { _written: true };
  };


  const glb = await glob("**/**/**/**.{jsx,js}", {
    ignore: ["node_modules/**/*", "dist/**/*"],
    cwd: process.cwd() + '/pages/',
    absolute: true,
    recursive: true
  });
  
  // Process files in the 'pages' directory
  for await (let file of glb) {
    // Normalize file paths
    let origin = file.replace(/\\/g, '/');
    let fileName =  origin.split('/pages/')[1].split('.jsx')[0].replace('.jsx', '') + '.jsx';
    let isBasePath = fileName === 'index.jsx';
  
    // Extract URL-related information from the file path
    let aburl = origin.split('pages')[1].split('.jsx')[0].replace('.jsx', '').replace('/index', '').replace('/_', '/:').replace('/[', '/:').replace(']', '');
    aburl.includes('[') ? aburl = '/' + aburl.split('[')[0].replace('/', '') : null;
  
    // Create an object with URL and pathname properties
    let obj = {
      url: isBasePath ? '/' : aburl,
      pathname: `/pages/${origin.split('pages/')[1].split('.jsx')[0].replace('.jsx', '')}.jsx`,
      fullpath: origin,
    };
  
    // Read and compile file content
    let data = await fs.readFileSync(origin, "utf8");
    data = Compiler(data) 
   
    await writer(process.cwd() + "/dist/pages/" + fileName, data);
  
    // Generate routing logic
    let js = `
      router.get('${obj.url}', async (req, res) => {
        res.render(await require('.${obj.pathname}'), req, res)
      }) 
      //@desc ${obj.pathname}
    ` + '\n';
  
    // Update 'app.js' file with routing logic
    let before = fs.existsSync(process.cwd() + "/dist/app.js") ? await reader(process.cwd() + "/dist/app.js") : '';
    let newfile = before + '\n' + js;
    if (!before.includes(`//@desc ${obj.pathname}`)) {
      await writer(process.cwd() + "/dist/app.js", newfile);
    }

    let beforeHTML = fs.existsSync(process.cwd() + "/dist/index.html") ? await reader(process.cwd() + "/dist/index.html") : '';
    if(!beforeHTML.includes(`<link rel="prefetch" href="/pages/${origin.split('pages/')[1] }" as="fetch">`)){
      let newHTML = beforeHTML + `\n<link rel="prefetch" href="/pages/${origin.split('pages/')[1] }" as="fetch">`
      await writer(process.cwd() + "/dist/index.html", newHTML);
    }
  }
   
 
  const scannedSourceFiles = await glob("**/**.{jsx,js}", {
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
   
    
    let name = file.split( '/node_modules/vaderjs/runtime/')[1]
    if(file.includes('index.html') && fs.existsSync(process.cwd() + "/dist/" + name)){
        return
   }
    let data = await reader(file)
    bundleSize += fs.statSync(file).size;
    await writer(process.cwd() + "/dist/" + name, data);
  })
  scannedSourceFiles.forEach(async (file) => { 
     file = file.replace(/\\/g, '/');
    let name = file.split('/src/')[1]
    console.log(`Compiling ${name} to /src/${name}`)
    //parse jsx 
   
    let data = await reader(process.cwd() + "/src/" + name)
    if (name.includes('.jsx')) {
      data = Compiler(data)  
    }
    bundleSize += fs.statSync(process.cwd() + "/src/" + name).size;
    await writer(process.cwd() + "/dist/src/" + name, data);
  })
 
  const scannedPublicFiles =  await glob("**/**.{css,js,html}", {
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
    cwd: process.cwd()  + "/runtime/",
    absolute: true,
  }) 

  if (!fs.existsSync(process.cwd() + "/dist/index.html")) {
     
    scannedFiles.forEach(async (file) => {
      file = file.split(process.cwd() + '/runtime/')[1]

      if (file === "app.js") {
        return
      }
      console.log(`Compiling ${file} to /dist/${file}`)
      if(file.includes('index.html') && fs.existsSync(process.cwd() + "/runtime/" + file)){
        console.log(`Compiling ${file} to /dist/${file}`)
          return
      }
      bundleSize += fs.statSync(process.cwd() +  "/runtime/" + file).size;
      let data = await reader(process.cwd() + "/runtime/" + file)
      await writer(process.cwd() + "/dist/" + file, data);
    });
    
  }
 
  globalThis.isBuilding = false
}
import { watch } from "fs"; 

switch (true) {
  case process.argv.includes('--watch'):

    console.log(`
Vader.js v1.3.3
- Watching for changes in ./pages
- Watching for changes in ./src
`)
    Build()
 
      const watcher = watch(
        process.cwd() + '/pages',
        { recursive: true },
        (event, filename) => {
          if (event == 'change'
          && !globalThis.isBuilding
          ) {
            Build()
          }
        },
      );
      const watcher2 = watch(
        process.cwd() + '/src',
        { recursive: true },
        (event, filename) => {
          if (event == 'change'
          && !globalThis.isBuilding
          ) {
            Build()
          }
        },
      );
      watcher2.on('error', (err) => console.log(err))
      watcher.on('error', (err) => console.log(err))
  
    break;
  case process.argv.includes('--build'):

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
