import fs from 'fs'
import * as Bun from 'bun'
import { Glob } from 'bun' 
import Router from 'vaderjs/router'
globalThis.runOnce = [] 
let config  =  await import(process.cwd() + '/vader.config.ts').then((module) => module.default)
/**
 *  @description This function is used to compile the client code
 * @returns {Promise<void>}
 */
export async function Compile(){  
    console.log('\x1b[36mwait \x1b[0m  - compiling (client and server)')
    if(fs.existsSync(process.cwd() + '/build')){ 
        fs.rmdirSync(process.cwd() + '/build', { recursive: true })
    }
  let isUsingProvider = config?.host?.provider  
  let compileStart = Date.now()
  const glob = new Glob("/**/*.{ts,tsx,js,jsx}", {
    absolute: true,
  });
  if(!await Bun.file(process.cwd() + '/vader.config.ts').exists()){
     throw new Error('vader.config.ts does not exist')
  }  
   
  globalThis.config = config
  let jsConfigEists = await Bun.file(process.cwd() + '/jsconfig.json').exists() 
  if(!jsConfigEists){ 
    await Bun.write(process.cwd() + '/jsconfig.json', `{
      
        "compilerOptions": {
         "jsx":"react",
         "jsxFactory": "Element"
        }
     
    }`)
     
  }else{
    let contents =  JSON.parse(fs.readFileSync(process.cwd() + '/jsconfig.json', 'utf8'))
    contents.compilerOptions.jsx = 'react'
    contents.compilerOptions.jsxFactory = 'Element'
    fs.writeFileSync(process.cwd() + '/jsconfig.json', JSON.stringify(contents)) 
  } 
  let obj = { 
    outdir: config?.compilerOptions?.outDir || process.cwd() + '/build',
    target: config?.compilerOptions?.target || 'browser', 
    external: config?.compilerOptions?.external || ['vaderjs/client', '*.module.css'],
  
  }
  if(config?.mode === 'development'){
    obj.sourcemap  = 'inline'
  }
   
  
    
    
  let imports = []
  function grabFunctions(contents, filePath){
    let functions = []
    
    for(var i = 0; i < contents.split('\n').length; i++){
      if(contents.split('\n')[i].includes('export') && contents.split('\n')[i].includes('function')){
         let name = contents.split('\n')[i].split('function')[1].split('(')[0].trim() 
          let fullFunction = ''
          let j = i
          for(j = i; j < contents.split('\n').length; j++){
            fullFunction += contents.split('\n')[j]
            if(contents.split('\n')[j].includes('}')  && !contents.split('\n')[j + 1].includes(')')){
              
              break;
            }
          }
          functions.push({functionName: name, fullFunction, filePath})
      }
    }
    return functions
  
  } 
  
  let variables = []
  function grabVariables(contents, filePath){
    for(var i = 0; i < contents.split('\n').length; i++){
      if(contents.split('\n')[i].includes('let') || contents.split('\n')[i].includes('var') || contents.split('\n')[i].includes('const')){
         let isUseState = contents.split('\n')[i].includes('useState') 
         if(isUseState){
           let name  = contents.split('\n')[i].split('=')[0].split('[', 2)[1].split(',')[0].trim()
            variables.push(name) 
         }

         let isReducer = contents.split('\n')[i].includes('useReducer')
          if(isReducer){
            let name  = contents.split('\n')[i].split('=')[0].split('[', 2)[1].split(',')[0].trim()
             variables.push(name)
          }else if(!isUseState || !isReducer || !contents.split('\n')[i].includes('import') || !contents.split('\n')[i].includes('[')
           && !contents.split('\n')[i].includes('import')
          ){
            let variable = ''
            let j = i
            let bracketCount = 0
            for(j = i; j < contents.split('\n').length; j++){
              variable += contents.split('\n')[j]
              if(contents.split('\n')[j].includes('{')){
                bracketCount++
              }
              if(contents.split('\n')[j].includes('}')){
                bracketCount--
              }
              if(bracketCount === 0){
                break;
              }
            }
             
             let name = variable.split('=')[0].split('let')[1] ? variable.split('=')[0].split('let')[1].trim() : variable.split('=')[0].split('var')[1] ? variable.split('=')[0].split('var')[1].trim() : variable.split('=')[0].split('const')[1] ? variable.split('=')[0].split('const')[1].trim() : null
             if(name.includes("[")){
                continue
             }
             let value = variable.split('=')[1] ? variable.split('=')[1].trim() : null
             variables.push({name, value, file: filePath})
          }
      }
    }
    globalThis.variables = variables
    return variables
  
  }
  
   
  function cssToObj(data){
    let obj = {}
    let lines = data.split('\n')
    for(var i = 0; i < lines.length; i++){
      if(lines[i].includes(':')){
        let key = lines[i].split(':')[0].trim().replace('.', '')  
        // turn kebab case to camel case
        if(key.includes('-')){
          key = key.split('-').map((word, index) => {
            if(index > 0){
              return word.charAt(0).toUpperCase() + word.slice(1)
            }else{
              return word
            }
          }).join('')
        }
        let value = lines[i].split(':')[1].trim()
        obj[key] = value
      }
    } 
    return obj
  
  }
  async function main(contents, filePath){ 
      let copy = contents
     
      for  (var i in contents.split('\n')){
        let line = contents.split('\n')[i]
        let newLine = ''
        let old;
        let file;
        let varType;
        let mimeTypes = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.json', '.webm', '.mp4', '.avi', '.webp', '.css','.module.css']
        switch(true){ 
          
          case line.includes('function'):
            let props = line.split('function')[1].split('(')[1].split(')')[0].split(',')
            props = props.map((prop) => {
              prop = prop.trim().replace('{', '').replace('}', '')
              if(prop.includes('_') && !prop.match(new RegExp('A-Za-z')) || prop.includes('-') && !prop.match(new RegExp('A-Za-z'))){
                return  prop.replaceAll('_', ' ').replaceAll('-', ' ').split(' ').map((word, index) => {
                  if(index > 0){
                    return word.charAt(0).toUpperCase() + word.slice(1)
                  }else{
                    return word
                  }
                }).join('')
              }
              return prop.trim().replace('{', '').replace('}', '')
            } )
            props = props.filter((prop) => prop !== '')
               // turn prop to an object to fix cannot destructure property of undefined in client
            let newProps = {}
            props.forEach((prop) => {
              newProps[prop] = ''
            })
            if(line && props.length > 0){
              let randomLetters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']
              let randoMPropName = randomLetters.sort(() => Math.random() - 0.5).join('')
              randoMPropName = randoMPropName.replaceAll('/\d/g', '')
              let isAsync = line.includes('async') ? 'async' : ''
              let newLine = ` ${line.includes('export') ? 'export' : ''} ${isAsync} function ${line.split('function')[1].split('(')[0].trim()}(${randoMPropName}= ${JSON.stringify(newProps)}){\n let {${props.join(',')}} = ${randoMPropName}\n
              `
              old = line 
              copy = copy.replace(old, newLine)
               
              
            }
            break; 
          case line.includes('useFile') &&  mimeTypes.some((type) => line.includes(type))
          && !line.includes('import')  
          :
              let file =  line.split('useFile(')[1].split(')')[0].replace(/'/g, '').replace(/"/g, '').replace(';', '')  
              file =  process.cwd() + '/' + file.replaceAll('../','').replace(/\\/g, '/')  
               
              let stats = fs.statSync(file) 
              let fileType = 'application/octet-stream'; // Default to generic binary data
        
              // Determine file type based on extension
              if (file.includes('.png')) {
                  fileType = 'image/png';
              } else if (file.includes('.jpg') || file.includes('.jpeg')) {
                  fileType = 'image/jpeg';
              } else if (file.includes('.svg')) {
                  fileType = 'image/svg+xml';
              } else if (file.includes('.webp')) {
                  fileType = 'image/webp';
              } else if (file.includes('.mp4')) {
                  fileType = 'video/mp4';
              } else if (file.includes('.avi')) {
                  fileType = 'video/x-msvideo';
              }else if (file.includes('.gif')) {
                  fileType = 'image/gif';
              }else if (file.includes('.json')) {
                  fileType = 'application/json';
              }
              else if (file.includes('.css')) {
                  fileType = 'text/css';
              }
               else if (file.includes('.webm')) {
                  fileType = 'video/webm';
              }
              
              let fcontents = fs.readFileSync(file,  fileType.includes('image') ? 'base64' : 'utf8')
              let fileName = line.split('useFile(')[1].split(')')[0].replace(/'/g, '').replace(/"/g, '').replace(';', '').split('/').pop()
              file = file.replace(process.cwd(), '').replace(/\\/g, '/')
              let fileobj = {
                name: fileName,
                size: Math.round(stats.size / 1024) + 'kb',
                type: fileType,
                dataUrl: fileType.includes('image') ? `data:${fileType};base64,${fcontents}` : '',
                fileUrl: file,
                filesize: Math.round(stats.size / 1024) + 'kb',
                lastModified:{
                  date: stats.mtime,
                  time: stats.mtime.getTime(),
                  parsed: new Date(stats.mtime).toDateString()
                },
                arrayBuffer: new Uint8Array(fcontents),
                blob:'',
                text: fcontents,
                json: (fileType === 'application/json' || file.includes('.module.css')) ? cssToObj(fcontents) : null,
                mimetype: fileType,
                extension: file.split('.').pop(),
                formData: null
              }
              newLine = `${JSON.stringify(fileobj)}`
              old = line.split('useFile(')[1].split(')')[0]
              if(line.includes('let') || line.includes('const') || line.includes('var')){
                old = line   
                // let/var/const {} or name = value 
                newLine = `let ${line.split('=')[0].split(' ').slice(1).join(' ')} = ${JSON.stringify(fileobj)}`
                variables.push({name: `${line.split('=')[0].split(' ').slice(1).join(' ')}`, value: `${JSON.stringify(fileobj)}`, file: filePath})
             
              }  
              copy = copy.replace(old, newLine)
            break;
            case !line.includes('import') && line.includes('useState') && !line.includes('let useState'): 
            let varType = line.split('[', 1)[0];
            let before =  line.split('useState(')[1].split(',')[0]; 
            let key = line.split('[')[1].split(',')[0]; 
            let setKey = line.split('[')[1].split(',')[1].split(']')[0];
            newLine =  `${varType} [${key},${setKey}]= this.useState("${key}", ${before}`;  
            old = line;
            copy = copy.replace(old, newLine);
            break;
          case line.includes('useEffect') && !line.includes('var useEffect') && !line.includes('import'): 
            newLine = line.replace('useEffect', 'this.useEffect')
            old = line
            copy = copy.replace(old, newLine)
            break;
        
        
          
         case line.includes('import') && line.includes('module.css'):
              file =  line.split('from')[1].trim().replace(/'/g, '').replace(/"/g, '').replace(';', '')
             let cssKey = line.split('import')[1].split('from')[0].trim()
             file =  process.cwd() + '/' + file.replaceAll('./','').replace(/\\/g, '/')
             contents = fs.readFileSync(file, 'utf8')
             let obj = cssToObj(contents)
             let newObj = JSON.stringify(obj)
             newLine = `let ${cssKey} = ${newObj}`
             old = line

             copy = copy.replace(old, '')
             copy = newLine + '\n' + copy  
             break;
         case line.includes('useRef') && !line.includes('var useRef') && !line.includes('import'):
            
           let refVar =    line.split("=")[0].trim().split(" ")[1];
           
           let ref = line.split("useRef")[1].split("(")[1]
           // if nothing in ref append null
           if(ref === ')'){
             ref = 'null)'
           }
           newLine = `let ${refVar} = useRef("${refVar}", ${ref}`
           old = line
           copy = copy.replace(old, newLine)
           break;
         case line.includes('useReducer') && !line.includes('var useReducer') && !line.includes('import'):
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
          old = line; 
          copy = copy.replace(old, newStatereducer);
           break;
          
         case line.includes('vaderjs/client') && line.includes('import') || line.includes('vaderjs') && line.includes('import'):
             let b4 = line
             let isUsingProvider = config?.host?.provider
             let replacement = isUsingProvider === 'cloudflare' ? 'remove' : '/src/client.js'
             if(replacement === 'remove'){
                copy = copy.replace(b4, '') 
                break;
             }
             let after = line.replace('vaderjs/client',  replacement).replace('vaderjs',  replacement)
             copy = copy.replace(b4, after)
           break;
 
        }
      }
      if(!contents.includes('import Element')){ 
   
   }
      return copy
  }    
   
  
   
   async function gen(){ 
    return new Promise(async (resolve, reject) => {
      const gg = new Glob("/pages/**/*.{ts,tsx,js,jsx}", {
        absolute: true,
        ignore: ["**/node_modules/**"]
      });
       
      let array = await Array.fromAsync(gg.scan())
      array = array.map((file) => {
        file = file.replaceAll('\\', '/')
        file ='./' + file
        return file
      })  
 
      for(var file of array){ 
       let data =  new Bun.Transpiler({
          loader: "tsx",
           tsconfig: {
             'compilerOptions':{
               'jsx':'react',
               'jsxFactory': 'this.Element'
             }
           },
           define:{ 
             
             'jsxDev':JSON.stringify('this.Element'),
             'jsx':  JSON.stringify('this.Element'),
           }
       }).transformSync(await Bun.file(process.cwd() + file).text())  
        let variables = grabVariables(data, file)
       let contents = await main(data, file)
        
      variables.forEach((variable) => { 
        contents.split('\n').forEach((line, index) => {
          if(line.includes(variable) && !line.includes('import') && !line.includes('let') && !line.includes('var') && !line.includes('const') 
          && !line.includes(variable + '()') &&
          !line.includes('.' + variable) && 
          // not an occurence like variable1, variable2, variable3 or variabless
          !line.match(new RegExp(variable + '[0-9]')) && !line.match(new RegExp(variable + '(w+)'))
          && !line.includes(variable + ':')  
          ){ 
            let newLine = line.replaceAll(variable, variable + '()')
            contents = contents.replace(line, newLine)
          }
        });
      })
     
        file = file.split('/pages')[1]
        if(isUsingProvider){
           switch(true){
            case isUsingProvider === 'cloudflare':  
              fs.mkdirSync(process.cwd() + '/build/pages/' + file.split('/').slice(0, -1).join('/'), { recursive: true })
              file = '/build/pages/' + file.replace('.tsx', '.js').replace('.ts', '.js').replace('.jsx', '.js')
              break;
            default:
              file = '/build/' + file.replace('./', '').replace('.tsx', '.js').replace('.ts', '.js').replace('.jsx', '.js') 
           }
        }  
        fs.writeFileSync(process.cwd() + file, contents)

         
      }
 

       
          
      if(!fs.existsSync(process.cwd() + '/build/src/client.js')){
        await Bun.write(process.cwd() + '/build/src/client.js',  await Bun.file(process.cwd() + '/node_modules/vaderjs/client/runtime/index.js').text())
        await Bun.write(process.cwd() + '/build/src/router.js',  await Bun.file(process.cwd() + '/node_modules/vaderjs/client/runtime/router.js').text())
      }  
    
       
      resolve()
    })
    
   }

   await gen()
  
   let compileEnd = Date.now()  
   console.log(`\x1b[32m%s\x1b[0m`, 'success', '-', `compiled in ${compileEnd - compileStart}ms`)
 
} 

if(process.env.hmr || process.env.mode === "production"){
   
  await Compile()
  let hasInitialized = [] 
  if(!process.env.wasLastRun){
    console.group('\x1b[32m%s\x1b[0m', 'ready', '\x1b[0m', '-', `started ${config?.mode} at http://localhost:${config?.env?.PORT || 3000}`) 
  } 
  if(process.env.mode !== "production"){ 
    Router.init() 
  } 
  for(var i in config?.plugins){
      let plugin = config.plugins[i] 
      if(plugin?.name.includes('SSG') && config?.env?.SSR){ 
          hasInitialized.push(plugin)
          continue
      }
      if(plugin.init){ 
          hasInitialized.push(plugin.init())
      }
  } 
}