import { Glob } from "bun";
let config = await import(process.cwd() + '/vader.config.js')
import fs from 'fs'
let {cwd, dev, compiler} = config.default
let startTime = Date.now()
switch (true){ 
    case !dev:
        throw new Error('dev is not defined in vader.config.js')
    case !compiler:
        throw new Error('compiler dist and start are not defined in vader.config.js')
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
function handleFunction(func) {
     
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
  
          if (line.includes("function") && line.includes(name)) {
           
            functionNames.push(name);
            // Get the location in the string where the function is declared
            let declarationIndex = code.indexOf(func);
    
            // Get the location in the string where the function ends
            let endIndex = declarationIndex + func.length;
            // ad this.bind to the end
            let newFunc = `this.bind(${name})`;
            // append that to the end of the function endindex
            let newCode = code.slice(0, endIndex) + newFunc + code.slice(endIndex);
          
            
            string = newCode;
            continue;
          }
  
          // Check if the line includes the function name
          if (line.includes(name) && !line.includes("function")
           && line.includes('{') && line.includes('}') && !line.includes('=>')
          ) {
            let hasParams = line.includes("(") && line.includes(")");
            let params = hasParams
              ? line.split("(")[1].split(")")[0].trim()
              : null;
             
   
          
            lines[i] = lines[i].replaceAll(
              hasParams ? `${name}(${params})` : name,
             `this.useFunction(${name},${params})}`
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

    


   // only return elements with {()=>{}} or if it also has parameters ex: onclick={(event)=>{console.log(event)}}
   const functionAttributeRegex =   /\s*([a-zA-Z0-9_-]+)(\s*=\s*("([^"\\]*(\\.[^"\\]*)*)"|'([^'\\]*(\\.[^'\\]*)*)'|\{(?:[^{}]|(?:\{(?:[^{}]|(?:\{[^{}]*\})*)*\})*)*\}|(?:\([^)]*\)|\{[^}]*\}|()=>\s*(?:\{[^}]*\})?)|\[[^\]]*\]))?/gs;

   let attributesList = [];
   
   
   // handle functions
    let functionAttributes = [];
    let functionMatch;
    while ((functionMatch = functionAttributeRegex.exec(code)) !== null) {
        let [, attributeName, attributeValue] = functionMatch;
        if(attributeValue &&  !attributeValue.includes('this.bind') && attributeValue.includes('()=>') || attributeValue &&   attributeValue.includes('()=>{')
      
        ){
             let old = `${attributeName}${attributeValue}`
             let value = attributeValue.split('()=>')[1] ?  attributeValue.split('{')[1].split('}')[0].trim()  : attributeValue.split('()=>')[1].split('}')[0].trim()
             
             let new2 = `this.bind("${value}")`
             attributesList.push({ element:attributeName, attributes: { [attributeName]: {
                value: value,
                old: old,
                attribute: attributeName,
                new: new2
             } } });
          
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
              let newvalue = `${value.attribute}="\${${value.new}}"`
                string = string.replace(value.old, newvalue);
                console.log(string)
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
  


  let reader = async (file) => {
    let text = await  Bun.file(file).text()
    return text;
  }
  let writer = async (file, data) => {
    let f = await Bun.write(file, data)
     
    return  {_written:true}
  }

  const glob = new Glob("**/*.jsx");
  compiler.start = compiler.start.replaceAll('.', '')
  compiler.dist = compiler.dist.replaceAll('.', '')
  for await (const file of glob.scan(process.cwd() + compiler.start)) {
     let contents = await reader(process.cwd() + compiler.start + '/' + file)
     if(contents.includes('wascompiled') || contents.length < 1){
        continue;
     }
     let data = handleFunction( contents)
     let path = process.cwd() + compiler.dist + '/' + file
     await writer(path, data)
  }
    

  const gb = new Glob("*");
  const scannedFiles = await Array.fromAsync(gb.scan({ cwd:  './core/pre' }))
  const scannedVaderFiles = await Array.fromAsync(gb.scan({ cwd:  './core/pre/vader' }))
  
  if(!fs.existsSync(process.cwd()  + '/dist/index.html')){
 
    scannedFiles.forEach(async (file) => { 
      let data = await reader(process.cwd() + '/core/pre/' + file)
      await writer(process.cwd() + '/dist/' + file, data)
    })
    scannedVaderFiles.forEach(async (file) => {
        let data =  await reader(process.cwd() + '/core/pre/vader/' + file)
        await writer(process.cwd() + '/dist/core/vader/' + file, data)
    })
  } 


let end = Date.now()
console.log(`Compiled in ${end - startTime}ms`)

 
