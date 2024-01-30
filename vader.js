#!/usr/bin/env node
import fs, { fstatSync } from "fs";
import { glob, globSync, globStream, globStreamSync, Glob, } from 'glob'
import puppeteer from 'puppeteer';
import http from 'http'
import { SourceMapGenerator } from 'source-map'

import { WebSocketServer } from 'ws'
import prettier from 'prettier'
import { watch } from "fs";
import path from 'path'

globalThis.compiledFiles = []

const sourceMapGen = (data, code) => {
  let { origin, fileName } = data
  const sourceMap = new SourceMapGenerator({ file: '/src/' + fileName.replace('.jsx', '.js') });

  const lines = fs.readFileSync(origin, "utf8").split("\n");
  let line = 1;
  let column = 0;
  for (const l of lines) {
    sourceMap.addMapping({
      source: origin,
      sourceRoot: '/src',
      original: { line: line, column: 0 },
      generated: { line: line, column: 0 },
    });
    line++;
  }

  sourceMap.setSourceContent(origin, fs.readFileSync(origin, "utf8"));

  code = code + `\n//# sourceMappingURL=./src/maps/${fileName.replace('.jsx', '.js')}.map \n //#sourceURL=/src/maps/${fileName.replace('.jsx', '.js')}.map`
  return { code, sourceMap };
}

let config = await import('file://' + process.cwd() + '/vader.config.js').then((e) => e.default || e)
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

let bundleSize = 0;

if (!fs.existsSync(process.cwd() + '/dist')) {
  fs.mkdirSync(process.cwd() + '/dist')
}




if (typeof process.env.isCloudflare !== "undefined" || !fs.existsSync(process.cwd() + '/dist/index.html')) {
  fs.writeFileSync(process.cwd() + "/dist/index.html", '')
}



function Compiler(func, file) {
  let string = func;
  let returns = []
  let comments = string.match(/\{\s*\/\*.*\*\/\s*}/gs)?.map((comment) => comment.trim());






  let childs = [];


  // or : value boolean variable etc
  const spreadAttributeRegex = /\s*([a-zA-Z0-9_-]+)\s*(\$\s*=\s*\{\s*\{(?:[^{}]|(?:\{(?:[^{}]|(?:\{[^{}]*\})*)*\})*)*\}\s*\})/gs;




  function extractAttributes(code) {
    // grab $={...} and ={...}
    const elementRegex = /<([a-zA-Z0-9_-]+)([^>]*)>/gs;

    // Match attributes in an opening tag, including those with ={}
    // Match attributes in an opening tag, including those with ={...}
    const attributeRegex =
      /\s*([a-zA-Z0-9_-]+)(\s*=\s*("(?:[^"\\]*(?:\\.[^"\\]*)*)"|'(?:[^'\\]*(?:\\.[^'\\]*)*)'|\{(?:[^{}]|(?:\{(?:[^{}]|(?:\{[^{}]*\})*)*\})*)*\}|(?:\([^)]*\)|\{[^}]*\}|()=>\s*(?:\{[^}]*\})?)|\[[^\]]*\]))?/gs;



    const functionAttributeRegex = /\s*([a-zA-Z0-9_-]+)\s*(=\s*{((?:[^{}]|(?:\{(?:[^{}]|(?:\{[^{}]*\})*)*\})*)*)})/gs;

    let attributesList = [];

    let spreadAttributes = [];

    /**
     * @search - handle spread for html elements
     * @keywords - spread, spread attributes, spread props, spread html attributes
     */


    /**
     * @search - handle function parsing for html elements
     * @keywords - function, function attributes, function props, function html attributes
     * 
     */
    let functionAttributes = [];
    let spreadFunctions = [];
    let functionMatch;
    while ((functionMatch = functionAttributeRegex.exec(code)) !== null) {

      let [, attributeName, attributeValue] = functionMatch;
      let attribute = {};

      if (attributeValue && attributeValue.includes("=>")
        && !attributeValue.includes("this.bind")
        || attributeValue && attributeValue.includes("function")
        && !spreadFunctions.includes(attributeValue)
      ) {

        let ref = Math.random().toString(36).substring(2).split('').filter((e) => !Number(e)).join('')
        let old = `${attributeName}${attributeValue}`

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

        // add ; after newlines 


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




        newvalue = newvalue.replaceAll(',,', ',')
        let paramnames = params ? params.split(',').map((e) => e.trim()) : null
        paramnames = paramnames ? paramnames.filter((e) => e.length > 0) : null
        // remove comments
        paramnames = paramnames ? paramnames.map((e) => e.match(/\/\*.*\*\//gs) ? e.replace(e.match(/\/\*.*\*\//gs)[0], "") : e) : null

        // add ; after newlines
        newvalue = newvalue.replaceAll(/\n/g, ";\n")
        // remove () from newvalue
        newvalue = newvalue.replace(/\(\s*=>/gs, '=>').replace(/\function\s*\([^\)]*\)\s*\{/gs, '{')

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

    /**
     * @search - handle attributes for html elements
     * @keywords - attributes, props, html attributes
     */
    let match;
    while ((match = elementRegex.exec(string)) !== null) {
      let [, element, attributes] = match;


      let attributesMatch;
      let elementAttributes = {};

      while ((attributesMatch = attributeRegex.exec(attributes)) !== null) {
        let [, attributeName, attributeValue] = attributesMatch;

        elementAttributes[attributeName] = attributeValue || null;
      }

      attributesList.push({ element, attributes: elementAttributes });
    }

    let spreadMatch;
    while ((spreadMatch = spreadAttributeRegex.exec(code)) !== null) {
      let [, element, spread] = spreadMatch;
      let isJSXComponent = element.match(/^[A-Z]/) ? true : false;
      if (isJSXComponent) {
        continue;
      }
      let old = spread;
      spread = spread.trim().replace(/\s+/g, " "); 
      // re,pve $={ and }
      spread = spread.replace(/\s*\$\s*=\s*{\s*{/gs, '')
      
      // replace trailing }
      spread = spread.replace(/}}\s*$/, '').replace(/}\s*}$/, '') 
      let splitByCommas =  spread.split(/,(?![^{}]*})/gs) 
      // remove empty strings
      splitByCommas = splitByCommas.filter((e) => e.split(':')[0].trim().length > 0)
      splitByCommas = splitByCommas.map((e, index) => { 
        let key = e.split(':')[0].trim()
        switch (true) {
          case e.includes('function') && !e.includes('this.bind') || e && e.includes('=>') && !e.includes('this.bind'):
            let value = e.split(':')[1].trim()
            let ref = Math.random().toString(36).substring(2).split('').filter((e) => !Number(e)).join(''); 
            value = `this.bind(${value}, false, "${ref}", "")`
            e = `${key}="\${${value}}"`
            break;
          case  e.includes('style:'):
            let v2 = e.split('style:')[1].trim().replace(/,$/, '') 
            v2 = v2.replace(/,$/, '') 
            e = `${key}="\${this.parseStyle(${v2})}"`
           break;
           
          default:  
            let v = e.split(':') 
            key = v[0].trim()
             // remove key from v
            v.shift()
            v = v.join(' ')
            e = `${key}="\${${v}}"`

            break;
        }


        return e;
      });
 

      let newSpread = splitByCommas.join(' ').trim().replace(/,$/, '');

      // remove trailing } 
      string = string.replace(old, newSpread);
    }

    return attributesList;
  }

  function extractOuterReturn(code) {
    // match return [...]
    let returns = code.match(/return\s*\<>.*\<\/>|return\s*\(.*\)/gs);

    return returns || [];
  }
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
  /**
   * @search - handle return [...]
   * @keywords - return, return jsx, return html, return [...]
   */
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

    let attributes = extractAttributes(string);
    contents = contents.trim().replace(/\]$/, "")
    contents = contents.replace(/\)$/, "");
    usesBraces ? !contents.includes('<>') ? contents = `<>${contents}</>` : null : null
    updatedContents = contents;


    let newAttributes = [];
    let oldAttributes = [];
    attributes.forEach((attribute) => {
      const { element, attributes } = attribute;
      // make sure it isnt a jsx component
      let isJSXComponent = element.match(/[A-Z]/) ? true : false;
      if (isJSXComponent) {
        return;
      }
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


          let newState = `${varType} [${key}, ${setKey}] = this.useState('${key}', ${valuestate}`;
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
    let componentRegex = /<([A-Z][A-Za-z0-9_-]+)\s*([^>]*)>\s*([\s\S]*?)\s*<\/\1>|<([A-Z][A-Za-z0-9_-]+)([^]*?)\/>/gs;

    let componentMatch = body.match(componentRegex);
    let topComponent = "";
    componentMatch?.forEach(async (component) => {

      let [, element, attributes] = component;
      let before = component;
      component = component.trim().replace(/\s+/g, " ");

      !isChild ? (topComponent = component) : null;


      let myChildrens = [];

      let name = component.split("<")[1].split(">")[0].split(" ")[0].replace("/", "");
      let componentAttributes = component.split("<")[1].split(">")[0].split(" ").join(" ").replace(name, "").trim();
      const dynamicAttributesRegex = /(\w+)(?:="([^"]*?)"|='([^']*?)'|(?:=\{([^}]*?)\})?|(?:=\{(.*?)*\})?|(?:={([^}]*?)})?|(?:{([^}]*?)})?|(?:}))?|\$=\s*\{\s*\{\s*([^]*?)\s*\}\s*\}/gs;



      let props = component.match(dynamicAttributesRegex)

      let filteredProps = [];
      let isWithinComponent = false;
      let componentName = name
      let currentProps = []

      let $_ternaryprops = []

      for (let prop of props) {

        if (prop === componentName) {

          isWithinComponent = true;
          filteredProps.push(prop);
        } else if (isWithinComponent && prop.includes('=')) {

          if (prop.startsWith('$=')) {
            let old = prop 
            prop = prop.replace(/\$\s*=\s*\{\s*\{\s*([^]*?)\s*\}\s*\}/gs, '$1') 
            component = component.replace(old, '')
            componentAttributes = componentAttributes.replace(prop, '') 
            $_ternaryprops.push(prop)

          }
          else if (prop.includes('${')) {


            prop = prop.replace('="', ':')
            if (prop.includes('${')) {
              prop = prop.replace('="', ':')
              prop = prop.replace('${', '')
            }
            if (prop.includes('="${{')) {
              prop = prop.replace('${{', '{')
              prop = prop.replace('}}', '}')
              prop = prop.replace('="', ':')
              prop = prop.replace('}"', '}')
            }

          }
          if (prop.includes('={')) {
            let value = prop.split('={')
            let isObj = value[1].match(/^{.*}$/gs) ? true : false
            if (!isObj) {
              // remove trailing }
              value[1] = value[1].replace(/}\s*$/, '')
            }

            if (value[0] == 'style' && isObj) {
              value[1] = `this.parseStyle(${value[1]})`
            }
            prop = `${value[0]}:${value[1]}`
          }

          if (prop.includes('function') || prop.includes('=>')) {
            // parse 'function' to function 
            prop = prop.replace("'", '')

            if (prop.endsWith("}'")) {
              prop = prop.replace("}'", '}')

            }

            prop = prop.replace('=function', ':function')
          }

          filteredProps.push(prop);



        } else if (isWithinComponent && prop.includes('}')) {

        }


        else {
          isWithinComponent = false;
        }
      }
      component = component.replaceAll(/\s+/g, " ");

      component = component.replace(componentAttributes, '')
      $_ternaryprops.forEach((prop) => {
        component = component.replace(prop, '')
      })

      let children = new RegExp(`<${name}[^>]*>([^]*)<\/${name}>`, 'gs').exec(component)?.[1] || null;

      props = filteredProps.join(',').replace(/\s+/g, " ").trim().replace(/,$/, '')

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
            /<([A-Z][A-Za-z0-9_-]+)([^>]*)>(.*?)<\/\1>|<([A-Z][A-Za-z0-9_-]+)([^]*?)\/>/gs
          );
          if (html) {
            html = html.map((h) => h.trim().replace(/\s+/g, " ")).join(" ");
            child.children = child.children.replaceAll(html, `${html}`);
            // remove duplicate quotes 
          }

          myChildrens.push(child.children);
          childs = childs.filter((e) => e.parent !== name);
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
      replace = `\${this.memoize(this.createComponent(${savedname}, {${props}}, [\`${myChildrens.join('')}\`]))}`;


      body = body.replace(before, replace);
    });

    return body;
  }

  string = string.replaceAll('vaderjs/client', '/vader.js')

  const importRegex = /import\s*([^\s,]+|\{[^}]+\})\s*from\s*(['"])(.*?)\2/g;
  const imports = string.match(importRegex);
  let replaceMents = [];


  for (let match of imports) {
    let path = match.split('from')[1].trim().replace(/'/g, '').replace(/"/g, '').trim()
    switch (true) {
      case path && !path.includes('./') && !path.includes('/vader.js') && !path.includes('/vaderjs/client') && !path.startsWith('src') && !path.startsWith('public') && !path.includes('http') && !path.includes('https'):
        let componentFolder = fs.existsSync(process.cwd() + '/node_modules/' + path) ? process.cwd() + '/node_modules/' + path : process.cwd() + '/node_modules/' + path.split('/')[0]
        componentFolder = componentFolder.split(process.cwd())[1]
        if (!fs.existsSync(process.cwd() + componentFolder)) {
          throw new Error('Could not find ' + path + ' at ' + match + ' in file ' + file)
        }

        if (!fs.existsSync(process.cwd() + '/dist/src/' + componentFolder.split('/').slice(2).join('/'))) {
          fs.mkdirSync(process.cwd() + '/dist/src/' + componentFolder.split('/').slice(2).join('/'), { recursive: true })
        }

        let baseFolder = componentFolder.split('node_modules')[1].split('/')[1]
        let glp = globSync('**/**/**/**.{jsx,js}', {
          cwd: process.cwd() + '/node_modules/' + baseFolder + '/',
          absolute: true,
          recursive: true
        })
        for (let file of glp) {
          let text = fs.readFileSync(file, "utf8");
          if (!file.endsWith('.js') && file.endsWith('.jsx')) {
            text = Compiler(text, file);

          }
          let dest = file.split('node_modules')[1]
          dest = dest.split(baseFolder)[1]
          writer(process.cwd() + '/dist/src/' + baseFolder + dest, text)
          let importname = match.split('import')[1].split('from')[0].trim()
          let oldImportstring = match.split('from')[1].trim().replace(/'/g, '').replace(/"/g, '').trim()
          let newImport = `/src/${baseFolder + dest}`
          newImport = newImport.replaceAll('.jsx', '.js').replaceAll('\\', '/')
          replaceMents.push({ match: oldImportstring, replace: newImport })
          console.log(`📦 imported Node Package  ${baseFolder} `)
        }


        break;
      default:
        break;
    }
  }

  for (let replace of replaceMents) {
    string = string.replaceAll(replace.match, replace.replace)
  }

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
      // handle import { Component } from 'vaderjs/runtime/vader.js'
      let regularimportMatch = line.match(/import\s*([A-Za-z0-9_-]+)\s*from\s*([A-Za-z0-9_-]+)|import\s*([A-Za-z0-9_-]+)\s*from\s*(".*")|import\s*([A-Za-z0-9_-]+)\s*from\s*('.*')|import\s*([A-Za-z0-9_-]+)\s*from\s*(\{.*\})/gs);

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
            case path && !path.startsWith('./') && !path.includes('/vader.js') && !path.startsWith('src') && !path.startsWith('public') &&
              path.match(/^[A-Za-z0-9_-]+$/gs) && !path.includes('http') && !path.includes('https'):

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
  console.log(globalThis.isProduction ? 'Creating Optimized Production Build\n' : '')
  let str = `Page \t\t\t\t Size\n`
  globalThis.isProduction ? console.log('\x1b[32m%s\x1b[0m', str) : null
  let reader = async (file) => {
    let text = await fs.readFileSync(file, "utf8");
    return text;
  };



  function ssg(routes = []) {
    globalThis.isBuilding = true
    routes.forEach(async (route) => {
      if (route.url.includes(':')) {
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
          
         </script>
         <script type="module" id="router">
         import VaderRouter from '/router.js' 
         const router = new VaderRouter('${route.url}', 3000)
         router.get('${route.url}', async (req, res) => {
           try{
            let module = await import('/${route.fileName.replace('.jsx', '.js')}')
            if(Object.keys(module).includes('$prerender') && !module.$prerender){
              document.head.setAttribute('prerender', 'false')
            }
            res.render(module, req, res, module.$metadata)
           }
           catch(error){
            let errorMessage = {
              message: error.message,
              name: error.name,
              stack: error.stack,
              path: window.location.pathname
            };
          
            
            document.documentElement.setAttribute('error', JSON.stringify(errorMessage));
            throw new Error(error)
           }
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
        // Handle browser errors
        page.on('error', (err) => {
          console.error('BROWSER ERROR:', JSON.parse(err));
        });
      
        try {
          page.on('pageerror', async err => { 
            let errorObj =  JSON.parse(await page.evaluate(() => document.documentElement.getAttribute('error')) || '{}') 
            console.log('\x1b[31m%s\x1b[0m', 'Compiler Error:',  errorObj)

          });
        } catch (error) {
          browser.close()
        }
        // Handle page crashes
        page.on('crash', () => {
          console.error('PAGE CRASHED');
        });
        page.on('requestfailed', request => {
          console.error('REQUEST FAILED:', request.url(), request.failure().errorText);
        });
        await page.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle2' });







        await page.evaluate(() => {
          document.getElementById('meta').remove()
          document.querySelector('#isServer').innerHTML = 'window.isServer = false'
          if (document.head.getAttribute('prerender') === 'false') {
            document.querySelector('#root').innerHTML = ''
            console.log(`Disabled prerendering for ${window.location.pathname}`)
          }
        })
        let html = await page.content();

        html = await prettier.format(html, { parser: "html" })


        await writer(process.cwd() + '/dist/' + (route.url === '/' ? 'index.html' : `${route.url}/` + 'index.html'), html)


      } catch (error) {
        console.log(error)
      }

      finally {
        browser.close()
        server.close()
      }
    })

    let timeout = setTimeout(() => {
      globalThis.isBuilding = false
      clearTimeout(timeout)
    }, 1000)
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

    // gen sourcemap if not production
    let size = fs.statSync(origin).size;
    if (!globalThis.isProduction) {
      let { sourceMap } = sourceMapGen({ origin: origin, fileName: fileName }, await Compiler(data, origin))
      data = data + `\n//# sourceMappingURL=/src/maps/${fileName.replace('.jsx', '.js.map')}\n //#sourceURL=${origin}`
      await writer(process.cwd() + "/dist/src/maps/" + fileName.replace('.jsx', '.js.map'), JSON.stringify(sourceMap, null, 2))
    }
    await writer(process.cwd() + "/dist/" + fileName.replace('.jsx', '.js'), await Compiler(data, origin))

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


    let stats = {
      route: obj.url.padEnd(30),
      size: Math.round(size / 1000) + 'kb',
      letParentFolder: obj.url.split('/').slice(0, -1).join('/'),
      isChildRoute: obj.url.split('/').slice(0, -1).join('/').includes(':') ? true : false,
      parentRoute: obj.url.split('/').slice(0, -1).join('/').split(':')[0],

    }
    stats.isChildRoute ? stats.route = `? ${obj.url}` : null
    let string = `${isBasePath ? '+' : '+'} ${stats.route.padEnd(30)} ${stats.size}`

    globalThis.isProduction ? console.log(string) : null
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
      let origin = process.cwd() + "/src/" + name 
      if (!globalThis.isProduction) {
        let { sourceMap } = sourceMapGen({ origin: origin, fileName: name }, await Compiler(data, origin))
        data = data + `\n//# sourceMappingURL=/src/maps/${name.replace('.jsx', '.js.map')}\n //#sourceURL=${origin}`
        await writer(process.cwd() + "/dist/src/maps/" + name.replace('.jsx', '.js.map'), JSON.stringify(sourceMap, null, 2))
      }
      await writer(process.cwd() + "/dist/src/" + name.split('.jsx').join('.js'), await Compiler(data, origin))
      return
    }
    bundleSize += fs.statSync(process.cwd() + "/src/" + name).size;
    await writer(process.cwd() + "/dist/src/" + name, data);
  })

  const scannedPublicFiles = await glob("**/**/**.{css,js,html,mjs,cjs,png,jpg,jpeg,gif,svg,mp4,webm,ogg}", {
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
  console.log(`\nTotal bundle size: ${Math.round(bundleSize / 1000)}kb`)

  bundleSize = 0;

  return true
}
const s = () => {

  const server = http.createServer((req, res) => {

    const validExtensions = ['.js', '.css', '.mjs', '.cjs', '.html', '.json', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.mp4', '.webm', '.ogg', '.map']

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
                    console.log('Reloading...')
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
    let ext = ['.js', '.css', '.mjs', '.cjs', '.html', '.json', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.mp4', '.webm', '.ogg', '.map'].includes(path.extname(filePath)) ? path.extname(filePath) : '.html'
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
      case '.map':
        return 'application/json';
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
    globalThis.ws = ws
  });


}


switch (true) {
  case process.argv.includes('dev') && !process.argv.includes('build') && !process.argv.includes('start'):

    globalThis.devMode = true
    globalThis.isProduction = false
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
            if (globalThis.ws && !globalThis.isWriting) {
              globalThis.ws.clients.forEach((client) => {
                console.log('Reloading...')
                client.send('reload')
              })
            }

            globalThis.isBuilding = true
            Build()
          }
        }).on('error', (err) => console.log(err))
    })
    let p = process.argv[process.argv.indexOf('dev') + 1] || 3000

    process.env.PORT = p
    s()

    globalThis.listen = true;

    break;
  case process.argv.includes('build') && !process.argv.includes('dev') && !process.argv.includes('start'):
    globalThis.devMode = false
    globalThis.isProduction = true
    globalThis.routeStates = []
    console.log(`
Vader.js v1.3.3 
Building to ./dist
`)
    if (fs.existsSync(process.cwd() + '/dist/src/maps')) {
      fs.rmSync(process.cwd() + '/dist/src/maps', { recursive: true })
    }
    Build()

    break;
  case process.argv.includes('start') && !process.argv.includes('dev') && !process.argv.includes('build'):
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
    // add color
    console.log(` 
Vader.js is a reactive framework for building interactive applications for the web built ontop of bun.js!
    
Usage: vader <command> 
    
Commands:

   vaderjs dev     Start the development server
    
   vaderjs build   Build the project to ./dist
    
   vaderjs start  <port>   Production Mode (default 3000 or process.env.PORT)
      
Learn more about vader:           https://vader-js.pages.dev/
        
    `)
    break;

}
