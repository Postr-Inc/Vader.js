#!/usr/bin/env node
import fs from "fs";
import { glob, globSync, globStream, globStreamSync, Glob, } from 'glob'
import puppeteer from 'puppeteer';
import http from 'http'
import { WebSocketServer } from 'ws'
import { watch } from "fs";
import path from 'path'
let config = await import('file://' + process.cwd() + '/vader.config.js').then((e) => e.default || e)


let start = Date.now()
let bundleSize = 0;
let errorCodes = {
  "SyntaxError: Unexpected token '<'": "You forgot to enclose tags in a fragment <></>",
}
/**
 * define directories
 */


if (!fs.existsSync(process.cwd() + '/dist')) {
  fs.mkdirSync(process.cwd() + '/dist')
}




if (typeof process.env.isCloudflare !== "undefined" || !fs.existsSync(process.cwd() + '/dist/index.html')) {
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
    const functionAttributeRegex = /\s*([a-zA-Z0-9_-]+)(\s*=\s*{((?:[^{}]|(?:\{(?:[^{}]|(?:\{[^{}]*\})*)*\})*)*)})/gs;

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
        // add ; after newlines  


        let newvalue = attributeValue.includes('=>') ? attributeValue.split("=>").slice(1).join("=>").trim() : attributeValue.split("function").slice(1).join("function").trim()



        newvalue = newvalue.trim();

        //remove starting {
        newvalue = newvalue.replace("{", "")



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



        newvalue = newvalue.replace(/}\s*$/, '');



        newvalue = newvalue.trim();

        // remmove trailing }

        newvalue = newvalue.trim();
        newvalue = newvalue.replace(/}\s*$/, '');



        functionparams.length > 0 ? params = params + ',' + functionparams.map((e) => e.name).join(',') : null

        newvalue = newvalue.replaceAll(',,', ',')
        let paramnames = params ? params.split(',').map((e) => e.trim()) : null
        paramnames = paramnames ? paramnames.filter((e) => e.length > 0) : null
        // remove comments
        paramnames = paramnames ? paramnames.map((e) => e.match(/\/\*.*\*\//gs) ? e.replace(e.match(/\/\*.*\*\//gs)[0], "") : e) : null

        // add ; after newlines
        newvalue = newvalue.replaceAll(/\n/g, ";\n")

        let bind = isJSXComponent ? `${attributeName}='function(${params}){${newvalue}}'` : `${attributeName}="\$\{this.bind(function(){${newvalue}}.bind(this), ${isJSXComponent}, "${ref}",   "${paramnames ? paramnames.map((e, index) => {
          if (e.length < 1) return ''
          if (e.length > 0) {
            index == 0 ? e : ',' + e
          }
          return e
        }) : ''}" ${params ? params.split(',').map((e) => e.trim()).filter(Boolean).map((e) => `,${e}`).join('') : ''})}"`

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
    let returns = code.match(/return\s*\<>.*\<\/>|return\s*\(.*\)/gs);

    return returns || [];
  }
  // throw error if return is not wrapped in <></> or
  if (string.match(/return\s*\<>|return\s*\(.*\)/gs) && !string.match(/return\s*\<>.*\<\/>|return\s*\(.*\)/gs)
    || string.match(/return\s*\<[a-zA-Z0-9_-]+.*>/gs)
  ) {

    try {
      throw new SyntaxError("You forgot to enclose jsx in a fragment return <> jsx html </> or  return (<> jsx html </>) at line " + string.split(/return\s*\<[a-zA-Z0-9_-]+.*>/gs)[0].split('\n').length + ' in file ' + file)
    } catch (error) {
      console.error(error)
      process.exit(1)
    }
  }

  let outerReturn = extractOuterReturn(string);
  let contents = "";
  let updatedContents = "";
  outerReturn.forEach((returnStatement) => {

    let lines = returnStatement.split("\n");

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      if (line.match(/return\s*\<>|return\s*\(/gs)) {
        continue;
      }
      contents += line + "\n";
    }
    let usesBraces = returnStatement.match(/return\s*\(/gs) ? true : false;

    let attributes = extractAttributes(contents);
    // Remove trailing ']' or trailing )
    contents = contents.trim().replace(/\]$/, "")
    contents = contents.replace(/\)$/, "");
    usesBraces ? !contents.includes('<>') ? contents = `<>${contents}</>` : null : null
    updatedContents = contents;


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
          string = string.replace(oldvalue, value.new);
        }
      }
    });
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
    let componentRegex = /<([A-Z][A-Za-z0-9_-]+)([^>]*)>(.*?)<\/\1>|<([A-Z][A-Za-z0-9_-]+)([^]*?)\/>/gs;

    let componentMatch = body.match(componentRegex);
    let topComponent = "";
    componentMatch?.forEach(async (component) => {

      let [, element, attributes] = component;


      !isChild ? (topComponent = component) : null;
      let before = component;

      let myChildrens = [];

      let name = component.split("<")[1].split(">")[0].split(" ")[0].replace("/", "");
      // some components will have props that have html inside of them we need to only get the props ex: <Header title={<h1>hello</h1>}></Header> -> title={<h1>hello</h1>}  // also spread props ex: <Header {...props}></Header> -> {...props} or {...props, title: 'hello'} or {...props, color:{color: 'red'}}
      // grab ...( spread props ) 
      const dynamicAttributesRegex = /(\w+)(?:="([^"]*)")?(?:='([^']*)')?(?:=\{([^}]*)\})?(?:=\{(.*?)\})?(?:={([^}]*)})?(?:{([^}]*)})?|(?:{(?:[^{}]+|\{(?:[^{}]+|\{[^}]*\})*\})*\})|(\.{3}\{(?:[^{}]+|\{(?:[^{}]+|\{[^}]*\})*\})*\})/gs;






      let props = component.match(dynamicAttributesRegex)

      let filteredProps = [];
      let isWithinComponent = false;
      let componentName = name

      for (let prop of props) {

        if (prop.includes(componentName)) {
          // If the component is encountered, start collecting props
          isWithinComponent = true;
          filteredProps.push(prop);
        } else if (isWithinComponent && prop.includes('=')) {

          if (prop.includes('${')) {
            // if it has  an object inside of it then we should just do soemting:object else we should do something: `${object}`

            prop = prop.replace('="', ':').replace('}"', '}')
            if (prop.includes('${')) {
              prop = prop.replace('="', ':')
              prop = prop.replace('${', '')
              prop = prop.replace('}', '')

            }
            if (prop.includes('="${{')) {
              prop = prop.replace('${{', '{')
              prop = prop.replace('}}', '}')
              prop = prop.replace('="', ':')
              prop = prop.replace('}"', '}')
            }

          }
          if (prop.startsWith('={')) {
            prop = prop.replace('={', ':`${')
            prop.replace('} ', '}`')
          }

          if (prop.includes('function')) {
            // parse 'function' to function 
            prop = prop.replace("'", '')

            if (prop.endsWith("}'")) {
              prop = prop.replace("}'", '}')

            }

            prop = prop.replace('=function', ':function')
          }

          filteredProps.push(prop);


        }
        else if (isWithinComponent && prop.includes('...')) {



          // Check if spread props are within curly braces
          if (prop.startsWith('{') && prop.endsWith('}')) {
            const spreadObject = prop
            const hasOtherObjects = spreadObject.split(',').filter((e) => e.includes(':')).length > 0;

            const isValidSpread = spreadObject.includes('...');

            let processedSpreadObject = '';
            if (isValidSpread) {
              // Split the spreadObject by commas and process each part individually
              const parts = spreadObject.split(',').map((part) => {
                if (part.trim().startsWith('{') && part.trim().endsWith('}')) {
                  const nestedParts = part
                    .trim()
                    .slice(1, -1) // Remove outer {}
                    .split(',')
                    .map((nestedPart) => {
                      return nestedPart.includes('...') ? nestedPart.trim().replace(/\.\.\./, '') : `...${nestedPart.trim()}`;
                    });
                  return `{${nestedParts.join(',')}}`;
                } else {
                  return part.includes('...') ? part.trim() : part.trim().startsWith('{') ? `...${part.trim()}` : `${part.trim()}`;
                }
              });
              if (!parts.join(',').includes('{(')) {

                processedSpreadObject = `${parts.join(',')}`

              } else {
                let prop = parts.join(',')
                prop = prop.replaceAll('{(', '(')
                prop = prop.replaceAll(')}', ')')
                processedSpreadObject = prop
              }
              if (prop.includes('{{')) {
                let prop = parts.join(',')
                prop = prop.replaceAll('{{', '{')
                prop = prop.replaceAll('}}', '}')
                processedSpreadObject = prop
              }


            } else {
              // Process nested structures within the object
              processedSpreadObject = `{...${spreadObject}}`;
            }

            const $propsKey = `$props_${Math.random().toString(36).substring(2)}`;
            filteredProps.push(`${$propsKey}:${processedSpreadObject}`);
          }
        }

        else {
          isWithinComponent = false;
        }
      }

      // get inner content of <Component>inner content</Component>
      let children = new RegExp(`<${name}[^>]*>(.*?)<\/${name}>`, "gs").exec(component) ? new RegExp(`<${name}[^>]*>(.*?)<\/${name}>`, "gs").exec(component)[1] : null;

      props = filteredProps.join(',')

      let savedname = name;



      name = name + Math.random().toString(36).substring(2);
      if (children && children.match(componentRegex)) {
        children = parseComponents(children, true);
        childs.push({ parent: name, children: children });
      } else {

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




      props = props.replaceAll(`,${savedname}`, '').replaceAll(savedname, '')
      if (props.startsWith(',')) {
        props = props.replace(',', '')
      }
      props = props.replaceAll("='", ":'")
        .replaceAll('=`', ':`')
        .replaceAll('="', ':"')
        .replaceAll('={', ':')


      /**
       * @memoize - memoize a component to be remembered on each render and replace the old jsx
       */

      let replace = "";
      replace = `\${this.memoize(this.createComponent(${savedname}, {${props}}, [\`${myChildrens.join(" ")}\`]))}`;

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
  string = string.replaceAll(".jsx", ".js");
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
          let path = match.split('from')[1] ? match.split('from')[1].trim() : match.split('import')[1].trim()

          let newImport = ''
          let name = match.split('import')[1].split('from')[0].trim()


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
            case path && path.includes('.css'):
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


              string = string.replace(beforePath, "'" + path + "'")
              break;

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
globalThis.isWriting = null
const glb = await glob("**/**/**/**.{jsx,js}", {
  ignore: ["node_modules/**/*", "dist/**/*"],
  cwd: process.cwd() + '/pages/',
  absolute: true,
  recursive: true
});
async function Build() {
  globalThis.isBuilding = true
  console.log('Compiling......')
  let reader = async (file) => {
    let text = await fs.readFileSync(file, "utf8");
    return text;
  };

  let writer = async (file, data) => {
    globalThis.isWriting = file
    switch (true) {
      case !fs.existsSync(file):
        fs.mkdirSync(file.split('/').slice(0, -1).join('/'), { recursive: true })
        break;
    }
    if (globalThis.isWriting !== file) {
      return
    }
    await fs.writeFileSync(file, data);

    globalThis.isWriting = null
    return { _written: true };
  };




  // Process files in the 'pages' directory
  let appjs = '';
  let hasWritten = []
  function ssg(routes = []) {
    globalThis.isBuilding = true
    console.log(`Generating html files for ${routes.length} routes`)
    routes.forEach(async (route) => {
      if (route.url.includes(':')) {
        console.log('Route ' + route.url + ' is a dynamic route and will not be generated')
        return
      }
      let equalparamroute = routes.map((e) => {
        if (e.url.includes(':')) {
          let url = e.url.split('/:')[0]
          if (url && route.url === url) {
            return e
          } else {
            return null

          }
        }
        return null
      }).filter(Boolean)
      let document = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <script>
          window.routes = JSON.parse('${JSON.stringify(routes)}')
          </script>
          <script id="isServer">
          window.isServer = true
          </script>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width,initial-scale=1.0">
          <script type="module" id="meta">
          window.history.pushState({}, '', '${route.url}')
          window.module = await import('/${route.fileName.replace('.jsx', '.js')}')
          let metadata = await module.$metadata 
          if(metadata && metadata.title){
            document.head.innerHTML += '<title>' + metadata.title + '</title>'
         } 
         if(metadata && metadata.description){
           document.head.innerHTML += '<meta name="description" content="' + metadata.description + '">'
         }
         if(metadata && metadata.keywords){
           document.head.innerHTML += '<meta name="keywords" content="' + metadata.keywords + '">'
         }
         if(metadata && metadata.author){
           document.head.innerHTML += '<meta name="author" content="' + metadata.author + '">'
         }
         if(metadata && metadata.image){
            let image = metadata.image.file
            let type = metadata.image.type
            
            document.head.innerHTML += '<meta property="og:image" content="' + image + '">'
            document.head.innerHTML += '<meta property="og:image:type" content="' + type + '">'
         }
         if(metadata && metadata.url){
           document.head.innerHTML += '<meta property="og:url" content="' + metadata.url + '">'
         } 
          
         if(metadata && metadata.robot){
            document.head.innerHTML += '<meta name="robots" content="' + metadata.robot + '">'
         }
         if(metadata && metadata.manifest){
            document.head.innerHTML += '<link rel="manifest" href="' + metadata.manifest + '">'
         }
         if(metadata && metadata.tags){
            metadata.tags.forEach(tag => {
              document.head.innerHTML += tag
            })
         }

         if(metadata && metadata.styles){
           metadata.styles.forEach(style => {
             style = style.replaceAll('./', '/')
             style = style.replaceAll('../', '/')
             style = style.replace("'", '')
             document.head.innerHTML += '<link rel="stylesheet" href="' + style + '">'
           })
         }
         if(metadata && metadata.icon){
           document.head.innerHTML += '<link rel="icon" href="' + metadata.icon + '">'
         }
         </script>
         <script type="module" id="router">
         import VaderRouter from '/router.js' 
         const router = new VaderRouter('${route.url}', 3000)
         router.get('${route.url}', async (req, res) => {
           let module = await import('/${route.fileName.replace('.jsx', '.js')}')
           if(Object.keys(module).includes('$prerender') && !module.$prerender){
             document.head.setAttribute('prerender', 'false')
           }
           res.render(module, req, res, module.$metadata)
         }) 
         ${equalparamroute.length > 0 ? equalparamroute.map((e) => {



        return `router.get('${e.url}', async (req, res) => {
            let module = await import('/${e.fileName.replace('.jsx', '.js')}')
            res.render(module, req, res, module.$metadata)
         })\n`
      }) : ''}
         router.listen(3000)
          
     </script> 
      </head>
      <body>
          <div id="root"></div>
      </body>  
      
      
      </html>
    `;

      // generate random but common ports
      let port = Math.floor(Math.random() * (65535 - 49152 + 1) + 49152)

      const server = http.createServer((req, res) => {

        if (req.url === '/') {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(document);
        } else {
          // Serve static files (adjust the file paths based on your project structure)
          const filePath = process.cwd() + '/dist/' + req.url

          fs.readFile(filePath, (err, data) => {
            if (err) {
              res.writeHead(404, { 'Content-Type': filePath.includes('js') ? 'text/javascript' : 'text/html' });
              res.end('File not found');
            } else {
              res.writeHead(200, { 'Content-Type': filePath.includes('js') ? 'text/javascript' : 'text/html' });
              res.end(data);
            }
          });
        }
      });

      server.listen(port)
      server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          console.log(`Port ${port} is in use, trying another port...`);
          setTimeout(() => {
            server.close();
            server.listen(++port);
          }, 1000);
        }
      })

      globalThis.listen = true;

      const browser = await puppeteer.launch({
        headless: "new", args: ['--no-sandbox', '--disable-setuid-sandbox'],
        warning: false,
      })

      try {

        route.url = route.url.replaceAll(/\/:[a-zA-Z0-9_-]+/gs, '')
        let page = await browser.newPage();
        await page.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle2' });
        await page.waitForSelector('#root');
        await page.evaluate(() => {
          document.getElementById('meta').remove()
          document.querySelector('#isServer').innerHTML = 'window.isServer = false'
          if (document.head.getAttribute('prerender') === 'false') {
            document.querySelector('#root').innerHTML = ''
          }
        })
        const html = await page.content();

        await page.close();
        await writer(process.cwd() + '/dist/' + (route.url === '/' ? 'index.html' : `${route.url}/` + 'index.html'), html)
        await browser.close();
      } catch (error) {
        console.log(error)
        await browser.close();
      }
      finally {
        await browser.close();
        server.close()
      }


    })

    let timeout = setTimeout(() => {
      globalThis.isBuilding = false
      clearTimeout(timeout)
    }, 1000)
    console.log(`Generated ${routes.length} html files for ${routes.length} routes`)
  }

  globalThis.routes = []

  for await (let file of glb) {
    // Normalize file paths
    let origin = file.replace(/\\/g, '/');
    let fileName = origin.split('/pages/')[1].split('.jsx')[0].replace('.jsx', '') + '.jsx';
    let isBasePath = fileName === 'index.jsx';
    let isParamRoute = fileName.includes('[') && fileName.includes(']') ? true : false

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



    await writer(process.cwd() + "/dist/" + fileName.replace('.jsx', '.js'), data).then(async () => {



      await writer(process.cwd() + "/dist/" + fileName.replace('.jsx', '.js'), data)

    })

    // configure routing for each page

    obj.compiledPath = process.cwd() + "/dist/pages/" + fileName.replace('.jsx', '.js')
    let providerRedirects = { cloudflare: '_redirects', vercel: 'vercel.json', netlify: '_redirects' }
    switch (true) {
      case config && config.host && !config.host['_redirect']:
        let host = config.host.provider

        let provider = providerRedirects[host]
        if (provider) {

          let redirectFile = null
          switch (true) {
            case provider === '_redirects':
              redirectFile = fs.existsSync(process.cwd() + '/dist/' + provider) ? fs.readFileSync(process.cwd() + '/dist/' + provider, 'utf8') : ''
              break;
            case provider === 'vercel.json':
              redirectFile = fs.existsSync(process.cwd() + '/' + provider) ? fs.readFileSync(process.cwd() + '/' + provider, 'utf8') : ''
              break;
            default:
              break;
          }
          let type = provider === '_redirects' ? 'text/plain' : 'application/json'

          let root = obj.url.includes(':') ? obj.url.split('/:')[0] : obj.url
          switch (true) {
            case root === '/':
              break;
            case type === 'text/plain' && !redirectFile.includes(obj.url) && obj.url.includes(':'):
              let page = obj.pathname.split('/pages/')[1].replace('.jsx', '.js')
              redirectFile += `\n/${page} /${page} 200\n${obj.url} ${root} 200\n`
              !redirectFile.includes('/404') ? redirectFile += `\n/404 /404 404` : null
              fs.writeFileSync(process.cwd() + '/dist/' + provider, redirectFile)
              console.log(`Added ${obj.url} ${obj.url} 200 to ${provider}`)
              break;
            case type === 'application/json' && !redirectFile?.includes(`${obj.url}`):
              let json = redirectFile ? JSON.parse(redirectFile) : {}
              let isVercel = provider === 'vercel.json' ? true : false
              if (isVercel) {
                json['rewrites'] = json['rewrites'] || []
                json['rewrites'].push({ "source": obj.url, "destination": `${root}/index.html` })
                fs.writeFileSync(process.cwd() + '/' + provider, JSON.stringify(json, null, 2))
                console.log(`Added ${obj.url} ${root}/index.html to ${provider}`)
              }

          }
        }
        break;
      case config && config.host && config.host['_redirect']:
        let file = config.host['_redirect']
        file = file.split('./').join('')
        let redirectFile = fs.existsSync(process.cwd() + '/' + file) ? fs.readFileSync(process.cwd() + '/' + file, 'utf8') : ''
        fs.writeFileSync(process.cwd() + '/dist/' + file, redirectFile)
        console.log(`Using ${file} for redirects`)
      default:
        break;

    }


    globalThis.routes.push({ fileName: fileName, url: obj.url, html: '/' + (isBasePath ? 'index.html' : `${obj.url}/` + 'index.html') })



  }

  ssg(globalThis.routes)


  const scannedSourceFiles = await glob("**/**.{jsx,js,json}", {
    ignore: ["node_modules/**/*", "dist/**/*"],
    cwd: process.cwd() + '/src/',
    absolute: true,
  });
  const scannedVaderFiles = await glob("**/**.{html,js,json}", {
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
        await writer(process.cwd() + "/dist/src/" + name.replace('.jsx', '.js'), data)

      })
      return
    }
    bundleSize += fs.statSync(process.cwd() + "/src/" + name).size;
    await writer(process.cwd() + "/dist/src/" + name, data);
  })

  const scannedPublicFiles = await glob("**/**.{css,js,html,mjs,cjs}", {
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
        ...file.includes("index.html") && fs.existsSync(process.cwd() + "/dist/" + file) ? { exit: true } : null,

      }
      if (objCase.exit) {
        console.log('exiting')
        return true
      }
      bundleSize += fs.statSync(process.cwd() + "/node_modules/vaderjs/runtime/" + file).size;
      let data = await reader(process.cwd() + "/node_modules/vaderjs/runtime/" + file)
      await writer(process.cwd() + "/dist/" + file, data);
    });

  }

  globalThis.isBuilding = false
  console.log(`📦 Build completed: Build Size -> ${Math.round(bundleSize / 1000)}kb`)

  bundleSize = 0;
  return true
}
const s = () => {

  const server = http.createServer((req, res) => {

    const validExtensions = ['.js', '.css', '.mjs', '.cjs', '.html', '.json', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.mp4', '.webm', '.ogg'];

    if (!validExtensions.some(ext => req.url.endsWith(ext))) {
      req.url = req.url !== '/' ? req.url.split('/')[1] : req.url;
      req.url = path.join(process.cwd(), 'dist', req.url, 'index.html');
    } else {
      req.url = path.join(process.cwd(), 'dist', req.url);
    }

    const filePath = req.url

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end(fs.existsSync(process.cwd() + '/dist/404') ? fs.readFileSync(process.cwd() + '/dist/404/index.html') : '404');
      } else {
        const contentType = getContentType(filePath);
        switch (true) {
          case contentType === 'text/html' && globalThis.devMode:
            data = data.toString() + `<script type="module">
               let ws = new WebSocket('ws://localhost:${process.env.PORT || 3000}')
                ws.onmessage = (e) => {
                  if(e.data === 'reload'){ 
                    window.location.reload()
                  }
                }
              </script>
              `
        }
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
      }
    });
  });


  const ws = new WebSocketServer({ server });
  ws.on('connection', (socket) => {
    console.log('WebSocket Hydration Client connected');
    socket.on('close', () => console.log('WebSocket Hydration Client disconnected'));
  });


  function getContentType(filePath) {
    let ext = ['.js', '.css', '.mjs', '.cjs', '.html', '.json', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.mp4', '.webm', '.ogg'].includes(path.extname(filePath)) ? path.extname(filePath) : '.html'
    switch (ext) {
      case '.js':
        return 'text/javascript';
      case '.css':
        return 'text/css';
      case '.mjs':
        return 'text/javascript';
      case '.cjs':
        return 'text/javascript';
      case '.html':
        return 'text/html';
      case '.json':
        return 'application/json';
      case '.png':
        return 'image/png';
      case '.jpg':
        return 'image/jpg';
      case '.jpeg':
        return 'image/jpeg';
      case '.gif':
        return 'image/gif';
      case '.svg':
        return 'image/svg+xml';
      case '.mp4':
        return 'video/mp4';
      case '.webm':
        return 'video/webm';
      case '.ogg':
        return 'video/ogg';
      default:
        return 'application/octet-stream';
    }
  }

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
  let i =
    setInterval(() => {
      if (globalThis.isBuilding && globalThis.devMode) {

        ws.clients.forEach((client) => {
          client.send('reload')
        })
      } else {
        clearInterval(i)
      }
    }, 120)

}


switch (true) {
  case process.argv.includes('--watch') && !process.argv.includes('--build') && !process.argv.includes('--serve'):

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

    s()

    globalThis.listen = true;

    break;
  case process.argv.includes('--build') && !process.argv.includes('--watch') && !process.argv.includes('--serve'):
    globalThis.devMode = false
    console.log(`
Vader.js v1.3.3 
Building to ./dist
`)
    Build()

    break;
  case process.argv.includes('--serve') && !process.argv.includes('--watch') && !process.argv.includes('--build'):
    let port = process.argv[process.argv.indexOf('--serve') + 1] || 3000
    process.env.PORT = port
    globalThis.devMode = false
    console.log(`
Vader.js v1.3.3 
Serving ./dist on port ${port}
url: http://localhost:${port}
    `)
    s()
    break;
  default:
    console.log(`
Vader.js is a reactive framework for building interactive applications for the web built ontop of bun.js!

Usage: vader <command> 

Commands:
  --watch     Watch the pages folder for changes with hot reloading

  --build     Build the project to ./dist

  --serve     Serve the project on a port (default 3000)
  
Learn more about vader:           https://vader-js.pages.dev/
    
`)
    break;

}
