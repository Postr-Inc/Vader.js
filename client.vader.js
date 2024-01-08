try {
    await import("./vader.config.js");
  } catch (error) {
    throw new Error("No vader.config.js file found");
  }
   
  let config = await import("./vader.config.js").then((res) => res.default);
  switch (true) {
    case !config.cwd:
      throw new Error(
        "No cwd found in vader.config.js cannot resolve paths without cwd"
      );
    case !config.dev:
      throw new Error(
        "No dev found in vader.config.js cannot resolve paths without dev"
      );
    case config.dev && !config.dev.debugPath:
      throw new Error(
        "No debugPath found in vader.config.js cannot resolve paths"
      );
    case config.dev && !config.dev.core:
      throw new Error("No core folder found in vader.config.js cannot resolve paths");
  }
  
  window.cwd = config.cwd;
  window.params = {};
  window.Vader = {
    version: "1.3.2",
    lts: "1.3.2",
  };
  
  let errors = {
    "SyntaxError: Unexpected token '<'": "You forgot to enclose tags in a fragment <></>",
  }
   
  const path = {
    basename: (path) => {
      return path.split("/").pop();
    },
  
  }

  window.queryRef = (ref) => {
    return document.querySelector(`[data-ref="${ref}"]`)
  }
  window.reinvoke = (eventtype, element) => {
    const eventListener = (e) => {
      return e
    };
  
    // Check if the event listener has not been added before adding it
    if (!element._eventListenerAdded) {
      element.addEventListener(eventtype, eventListener);
  
      // Set the flag to indicate that the event listener has been added
      element._eventListenerAdded = true;
  
      // Trigger the event without overwriting existing data or listeners
      element.dispatchEvent(new Event(eventtype));
    }
  };
  
  async function handleErrors(response) {
    let type = response.name;
    let message = response.message;
    let stack = response.stack;
  
    let fileMatch = stack.match(/at eval.*?([^\s]+):/);
    let file = fileMatch ? fileMatch[1] : '';
  
    let lineMatch = stack.match(/at async eval.*?:(\d+):/);
    let line = lineMatch ? lineMatch[1] : '';
  
    console.log(`File: ${file}, Line: ${line}`);
   let error = { type, message, file, line };
    switch (true) {
      case type === "SyntaxError":
        Object.keys(errors).forEach((key) => {
          if (stack.includes(key)) {
            error.message = errors[key];
          }
        });
        break;
    }
  
    console.log(`vscode://file/${config.dev.debugPath.replace(/\\/g, "/")}/${config.cwd.split("/").pop()}/${file}:${line}:0`);
  
    let { Error } = await require(`${window.origin}/${config.dev.core}/components/error.jsx`, true);
    document.body.innerHTML = await new Error({ type, message, file: path.basename(file), line }).render();
  
    return { type, message, file: path.basename(file), line };
  }
  
  function parseExports(code) {
    let exports = code.split("export"); 
    let defaulteports = code.split("export default");
  
    let parsedExports = {};
  
    if (exports) {
      exports.forEach((exportLine) => {
        let exportType = exportLine.split(" ")[1];
        let exportName = exportLine.split(" ")[2];
        let exportValue = exportLine.split(" ")[3];
         
        if (exportType == "default") {
          exportName = exportLine.split(" ")[3];
          exportValue = exportLine.split(" ")[4];
          parsedExports["_Default$" + exportName] = "";
          return;
        }
        if (
          exportName.includes("useState") ||
          exportName.includes("useFunction") ||
          exportName.includes("constant")
        ) {
          return;
        }
        parsedExports[exportName] = "";
      });
    }
  
    return parsedExports;
  }
  let invokes = []
  let hasran = [];
  let states = {};
  export const strictMount = (callback) => {
    if (hasran.includes(callback.toString())) {
      return;
    }
    callback();
    hasran.push(callback.toString());
  };

  window.delegate = (event) => {
    return event.detail.target
  }
  
  let components = {};
  
  let classes = {};
  let style = document.createElement("style");
   document.head.appendChild(style);
  
  const parseStyles = async (styles, className = '') => {
      let css = await fetch(styles).then((res) => res.text());
      let classes = css.split("}");
      let parsedClasses = {};
      classes.forEach((cls) => {
       
        let name = cls.split(".")[1];
        let value = cls.split("{")[1] 
        console.log(value)
        let keys = value.split(";");
        let newKeys = [];
        keys.forEach((key) => {
          if (key.includes(":")) {
            let newKey = key.split(":")[0].trim();
            let newValue = key.split(":")[1].trim();
            newKeys.push(`${newKey}: "${newValue}"`);
          }
        });
        value = `{${newKeys.join(",")}}`;
       
        
        parsedClasses[name] =  JSON.stringify(value);
      });
      return parsedClasses;
  };
  
  
  export const stylis = {
    /**
     * @method create 
     * @param {*} styles 
     * @returns  {Object} classes
     * @description  This method allows you to create css classes from an object
     */
    create: async (/**@type {string} */ styles) => {
       
      return  await parseStyles(styles);
    },
  };
  
  /**
   * @method mem
   * @param {Component} component
   * @returns  {Component} Stateless Component
   * @description  This method allows you to memoize a component - this means it will be intialized only once and can be reused multiple times baased on a static key
   */
  export const mem = (/**@type {Component}**/ component) => {
    // ensure component is instance of Component
    switch (true) {
      case !(component instanceof Component):
        throw new Error("component must be an instance of Component");
      case !component.key:
        throw new Error("component must have a static key");
      // check if key was randomly generated
    } 
    let key = component.key;
    if (!components[key]) {
      components[key] = component;
    }
  
    return  components[key];
  };
  
  /**
   * @method invoke
   * @description  This method allows you to invoke a function from its id
   * @param {*} name
   * @param {*} params
   * @returns
   * @example
   * invoke(this.functions['test'], 'hello') // this will invoke the function test with the params hello
   */
   
  let functions = {};
   
  export const invoke = (func, params) => {
     let name = func.name;
    
     window[name] = function (params) {
        return func(params);
     }
     window[name] =  window[name].bind(this);
     
      
     return `${name}(${params})`;
     
  };
  
  export class Component {
    constructor() {
      this.state = {};
      this.key = null; 
      this.components = {};
      this.mounted = false; 
      this.checkIFMounted(); 
      this.currenthtml = null;  
      window.listeners = [];  
      this.functionMap = new Map();
      this.freeMemoryFromFunctions();
    }

    
  
    hydrate() {
      if (this.key) {
        const el = document.querySelector(`[key="${this.key}"]`);
  
        if (el) {
          // Check if the current HTML is already cached
          if (this.currentHtml === null) {
            // Cache the current HTML content
            this.currentHtml = el.innerHTML;
          }
  
          // Render the new HTML content
          const newHtml = this.render();
  
          // Compare the new HTML with the cached content
          if (newHtml !== this.currentHtml) {
            // Update the HTML only if it has changed
            el.outerHTML = newHtml;
  
            // Update the cached HTML content
            this.currentHtml = newHtml;
          }
        }
      }
    }
  
  
    handleObject(obj) {
      try {
        obj = JSON.parse(obj);
      } catch (error) {
        // Handle JSON parsing error if needed
      }
      return eval(obj);
    }

    /**
     * @private
     */
    freeMemoryFromFunctions() {
        setInterval(() => {
        for(var [key, value] in this.functionMap){
          if(Date.now() - value.lastUsed > 1000){
            this.functionMap.delete(key)
          }
       }
      }, 1000);
      
    }
   
    bind(funcData,  p, ref) {
      const name = `func_${crypto.randomUUID()}`; // Generate a unique name
   
      var dynamicFunction = (params) => {
         
        let func = new Function(`return (async (${params}) => {
          ${funcData}  
         })()`);
        func = func.bind(this); 
        func(params)
      };
  
      dynamicFunction = dynamicFunction.bind(this);
      if(!this.functionMap.has(name)){
       
        document.addEventListener(`call_${name}`, (e) => {
         
           let { name, target } = e.detail;
           
          dynamicFunction();
           
         this.functionMap.set(e.detail.name, {
            lastUsed: Date.now(),
          });
        });
      }
  
      this.functionMap.set(name, {
        lastUsed: Date.now(),
      });
       

      
 
      window.call = (name, eventdata, params) => {  
        
        document.dispatchEvent(
          new CustomEvent(`call_${name}`, {
            detail: { name: `call_${name}`, target: eventdata  },
          })
        );
      }; 
  
      // Return a valid inline js function call
      return `
      ((event) => { 
        event.target.setAttribute('data-ref', '${ref}');
        let reference = event.target.getAttribute('data-ref');
        event.target.eventData = event;
        let domquery = queryRef(reference);
        domquery.eventData = event; 
        domquery.eventData.detail.target = domquery;
        call('${name}', {event:domquery.eventData}, '${p}')
      })(event)
      `;
    }
    callFunction(func, ...params) {   
      params[0] = params[0].detail.target.event
      
      document.dispatchEvent(new CustomEvent(func, { detail: { name: func, params: params } }));
    }
    useFunction(func, params, isInlineJsx = false) {
      const sanitizedFuncName = func.name.trim().replace(/\s+/g, '_');
      
      if (!invokes.includes(`'${sanitizedFuncName}'${this.key}`)) {
          invokes.push(`'${sanitizedFuncName}'${this.key}`);
  
          document.addEventListener(`call_${sanitizedFuncName}_${this.key}`, (e) => {

              let { name, params } = e.detail;
            
             
              if (name === `call_${sanitizedFuncName}_${this.key}`) {
                  let isarray = Array.isArray(params);
                   
                  func(...(isarray ? params : [params]));
              }
          });
  
          func = func.bind(this);
      }  
  
      try {
          params = JSON.parse(params);
      } catch (error) {
          // Handle JSON parsing error if needed
      }
  
      const returnString = isInlineJsx
          ? `'call_${sanitizedFuncName}_${this.key}'`
          : `document.dispatchEvent(new CustomEvent('call_${sanitizedFuncName}_${this.key}', { detail: { name: 'call_${sanitizedFuncName}_${this.key}', params: ${JSON.stringify(params)} } }))`;
  
      return returnString;
  }
  
    
    /**
     * @method useState
     * @description This method allows you to use state to dynamically update your component
     * @param {string} key - auto generated at compile time
     * @param {any} initialState 
     * @param {Component.render} func 
     * @returns [State, Setter]
     */
  
    useState(key = null, initialState, func = null) {
      if (!this.state[key]) {
        this.state[key] = initialState;
      }
      const getValue = () => this.state[key];
      const set = (newValue) => {
        this.state[key] = newValue;
        this.hydrate();
      };
      return [getValue, set];
    }
    /**
     * @method render
     * @description placeholder for content to be rendered
     */
    render() {}
    /**
     * @private 
     */
    checkIFMounted() {
       if(this.mounted) return;
       let timer = setInterval(() => {
        if(document.querySelector('[key="' + this.key + '"]')){
          clearInterval(timer)
          this.mounted = true;
          this.onMount()
        }
       }, 120);
    }
    onMount() {}
  }
  
 export  function handleFunction(func) {
     
    let componentName = func
      .split("class")[1]
      .split("extends")[0]
      .trim()
      .replaceAll("'", "");
  
   
  
    let string = func;
    let comments = string
  
      .match(/\{\s*\/\*.*\*\/\s*}/gs)
      ?.map((comment) => comment.trim());

 
  
    let savedfuncnames = [];
    let functions = string
      .match(/function.*\(\).*\{.*\};/gs)
      ?.map((func) => func.trim())
      .join("\n")
      .split(";");
  
      let functionNames = []
  
    if (functions) {
      functions.forEach((func) => {
        if (!func.includes("function")) {
          return;
        }
        let code =  string;
   
   
    
        let name = func
          .split("function")[1]
          .split("(")[0]
          .trim()
          .replaceAll("'", "");
  
        let lines =  string.split("\n");
  
        for (let i = 0; i < lines.length; i++) {
          let line = lines[i];
  
         if(!functionNames.includes(name)){
            functionNames.push(name)
         }
  
          // Check if the line includes the function name
          if (line.includes(name) && !line.includes("function")
           && line.includes('{') && line.includes('}') 
          ) {
            let hasParams = line.includes("(") && line.includes(")");
            let params = hasParams
              ? line.split("(")[1].split(")")[0].trim()
              : null;
            
             
   
          
            lines[i] = lines[i].replaceAll(
              hasParams ? `${name}(${params})` : name,
             `this.useFunction(${name},${params || null}, false, ${
                `'${crypto.randomUUID().replaceAll('-', '')}'`
             })}`
           );
           
          }
        }
  
  
        
       
        string = lines.join("\n");
       
   
      });
  
      
    }
    // get all Obj({}) and parse to JSON.stringify
  
    let objects = string.match(/Obj\({.*}\)/gs);
    if (objects) {
      objects.forEach((obj) => {
        let key = obj.split("Obj")[1].split("(")[1].split(")")[0].trim();
        let newobj = obj.replaceAll(`Obj(${key})`, `${key}`) 
        // let newobj = obj.replaceAll(`Obj(${key})`, `JSON.parse('${key}')`)
        string = string.replaceAll(obj,  `this.handleObject('${newobj}')`);
      });
    }
    
    function extractAttributes(code) {
      // Match elements with opening tags
      const elementRegex = /<([a-zA-Z0-9_-]+)([^>]*)>/gs;

  
      // Match attributes in an opening tag, including those with ={}
   // Match attributes in an opening tag, including those with ={...}
   const attributeRegex = /\s*([a-zA-Z0-9_-]+)(\s*=\s*("([^"\\]*(\\.[^"\\]*)*)"|'([^'\\]*(\\.[^'\\]*)*)'|\{(?:[^{}]|(?:\{(?:[^{}]|(?:\{[^{}]*\})*)*\})*)*\}|(?:\([^)]*\)|\{[^}]*\}|()=>\s*(?:\{[^}]*\})?)|\[[^\]]*\]))?/gs;

    


   // only return elements with attribute {()=>{}} or if it also has parameters ex: onclick={(event)=>{console.log(event)}} also get muti line functions
   const functionAttributeRegex =  /\s*([a-zA-Z0-9_-]+)(\s*=\s*{(?:[^{}]|(?:\{(?:[^{}]|(?:\{[^{}]*\})*)*\})*)*})/gs;

   let attributesList = [];
   
   
   // handle functions
    let functionAttributes = [];
    let functionMatch; 
    while ((functionMatch = functionAttributeRegex.exec(code)) !== null) {
        let [, attributeName, attributeValue] = functionMatch;
        let attribute = {};
        

        if (attributeValue && attributeValue.includes("=>")) {
            
            let ref  =  Math.random().toString(36).substring(2);
            let old = `${attributeName}${attributeValue}`;
          
            let newvalue = attributeValue.split("=>")[1] || attributeValue.split("=>")[1].trim();
            newvalue = newvalue.trim();
          
            //remove starting {
            newvalue = newvalue.replace("{", "");
 

           
             
            let params = attributeValue.split("=>")[0].split("(")[1].split(")")[0].trim();
            let functionparams = []
            newvalue = attributeValue.split("=>")[1].includes("}}") ? newvalue.replace("}}", "") : newvalue.replace("}", "");
            // random letters 
            
            functionNames.forEach((name) => {
                 
                string.split("\n").forEach((line) => {
                    if(line.includes(name) && line.includes("function")){
                        let ps = line.split("(")[1].split(")")[0].trim();
                        // remove comments
                        ps =  ps.match(/\/\*.*\*\//gs) ?  ps.replace(ps.match(/\/\*.*\*\//gs)[0], "") : ps;
     
                       functionparams.push({ref:ref, name:name, params:ps})
                     }
                });
               let lines =  newvalue.split("\n");
            
         
               for (let i = 0; i < lines.length; i++) {
                 let line = lines[i];
                 
                 if (line.includes(name)   
                 ) {
                   let hasParams = line.includes("(") && line.includes(")");
                   let params = hasParams
                     ? line.split("(")[1].split(")")[0].trim()
                     : null;
                     
                 
                     let p =  functionparams.find((p) => p.ref == ref).params; 
                   newvalue = lines[i].replaceAll( 
                        hasParams ? `${name}(${params})` : name,
                        `this.callFunction(\${this.useFunction(${name}, null, true)}, ${params})`
                    );
                  
                 }
               }
         
          
             });
            
        
          
             console.log(functionparams.find((p) => p.ref == ref).params)
             params = functionparams.find((p) => p.ref == ref).params;
             let newatribute = `${attributeName}="\${this.bind(\`${newvalue}\`, '${params}')}" data-ref="${ref}"\t`
            
             attribute[attributeName] = {
               old: old,
               new: newatribute,
               attribute: attributeName
             };
             attributesList.push({ element: attributeName, attributes: attribute });
         
           
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
          let value = attributes[key]
          let oldvalue = value; 
          if(value && !value.new){
            if (value && value.includes("{")) {
                value = value.replace("=", "");
                value == 'undefined' ? value = '""' : value = value;
      
                value = `="\$${value}"`; 
                string = string.replace(oldvalue, value);
                
              } else  if (value && value.includes("`")) {
                value = value.replace("=", "");
       
                value = `"\$${value}"`;
                string = string.replace(oldvalue, value);
              } 
          }else if(value && value.new){
               let newvalue = value.new;
                let old = value.old;
                string = string.replace(old, newvalue);
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
          let value = line
            .split("=")[1]
            .split("useState")[1]
            .split("(")[1]
            .split(")")[0]
            .trim();
          let newState = `${type} [${key}, ${setKey}] = this.useState('${key}', ${value}, () => { return this.render() }) 
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
        }
      }
    });
  
    let returnObj = {};
  
   
    let returns = parseExports(string);
    let returnKeys = Object.keys(returns);
    let returnString = "";
  
    string = string.replaceAll("export", "").replaceAll("default", "");
    returnKeys.forEach((key) => {
      if (key.includes("_Default$")) {
        key = key.split("_Default$")[1];
        returnString += `default: ${returns[key]}`;
      }
      returnString += `${key},`;
    });
    returnString = `return {${returnString}}`;
    string = string += returnString;
  
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
  
    // get all functions in strng
    /**
     *  function test(){};
     */
  
    string = string.replaceAll("<>", "`").replaceAll("</>", "`");
  
    string = string.replaceAll("import('vader')", "import('/public/core/vader.dev.js')")
    string = string
      .replaceAll("className", "class")
      .replaceAll("classname", "class");
  
    string += `\n\n //wascompiled`;

    string = string.replaceAll("undefined", "");
  
  
    return  string;
}
  
  
  
  let cache = {};
  /**
   * @method require
   * @description  Import  CommonJS modules like Node.js for the browser
   * @param {string} path
   * @param {Boolean} noresolve - used to tell if the path should be automatically handled or manually handled - this is false by default
   * @returns
   */
  export const require = async (path, noresolve = false) => {
    let newPath =  noresolve ? path : `${window.origin}/${config.cwd}/${path}`;
    if (cache[newPath] && !config.dev.hotrender) {
      return cache[newPath];
    }
    let file = await fetch(newPath).then((res) => res.text());
  
    file = file + `\n//# sourceURL=${newPath}\n`;
  
    let filetype = path.split(".").pop();
    switch (true) {
      case filetype === "js":
        let exports = file.match(/module.exports\s*=\s*{.*}/gs) || file.match(/exports\s*=\s*{.*}/gs);
        exports = exports ? exports[0] : null;
  
        if (exports) {
          let keys = exports.split("{")[1].split("}")[0].split(",");
          let returnstring = "";
          keys.forEach((key) => {
            key = key.trim();
            returnstring += `${key},`;
          });
          returnstring = `return {${returnstring}}`;
          file = file += returnstring;
          file = file.replaceAll(exports, "");
        }
        
        return new Function(`return (async () => { ${file} })()`)();
      case filetype === "jsx": 
        if(file.includes('//wascompiled')){
           return new Function(`return (async () => { ${file} })()`)()
        }
        return await handleFunction(file);
         
    } 
  };
 
  
  window.require = require;
  
  /**
   * @method useState - type
   * @param {*} initialState
   * @returns  {Array} [value, set]
   * @description Allows you to use state to dynamically update your component
   */
  export const useState = (initialState) => {
    let value = initialState;
    if (key && !states[key]) {
      this.states[key] = initialState;
    }
    return [value, (newValue) => {}];
  };
  
  const constants = {};
  let constantCounter = 0;
  
  export const constant = (value) => {
    const key = `constant_${constantCounter++}`;
    if (!constants[key]) {
      constants[key] = value;
    }
    return constants[key];
  };
  
  export default {
    Component,
    require,
    handleFunction,
    invoke,
    mem,
    constant,
    useState,
    strictMount,
    stylis,
  };
  
