import { Glob } from "bun";
import fs from "fs"; 
import * as Bun from "bun"; 
import WebSocket from 'ws'
let config = await import(process.cwd() + '/vader.config.js').then((m) => m ? m.default : {}).catch((e) => {
    console.error(e)
    return {}
})
/**@description - Used to store hmr websocket clients */
globalThis.clients = []
/**@description - Used to keep track of routes */
globalThis.routes = []
/**
 * @description - Used to keep track of the mode
 */
globalThis.mode = 'dev'
/**@usedby @transForm */
globalThis.isBuilding = false
globalThis.hasGenerated = []
/**
 * @description - Used to keep track of the bundle size
 */
let bundleSize = 0 

 
if(globalThis.mode === 'dev'){
    Bun.spawn({
        cwd: process.cwd() + '/node_modules/vaderjs/binaries/',
        env: {
            PWD: process.cwd(), 
            onExit: (code) => {
                globalThis.isBuilding = false
                globalThis.oneAndDone = true
            }
        },
        cmd: ['node', 'generator.js'],
    }) 
    globalThis.generatorWs = new WebSocket(`ws://localhost:${3436}`)
  globalThis.generatorWs.on('message', (message) => {
         let data = JSON.parse(message.toString()) 
         switch(true){
            case data.type === 'done':
                let file = data.file
                  globalThis.hasGenerated.push(file)
                  console.log('Generated', file)
                break;
            case data.type === 'error':
                console.error(data.message)
                break;
         }
    })
    globalThis.generatorWs.on('connection', (ws) => {
        console.log('Connected to generator...')
    })
     
    if(!globalThis.generatorWs.readyState === 1){
        console.log('Generator is not ready...')
    }
}
 
/**
 * @description - variables used to generate arrays of paths recursively
 */
const glob = new Glob("/pages/**/**/*.{,tsx,js,jsx}", {absolute: true});
const vaderGlob = new Glob("/node_modules/vaderjs/runtime/**/**/*.{,tsx,js}", {absolute: true});
const srcGlob = new Glob("/src/**/**/*.{jsx,ts,tsx,js}", {absolute: true});
const publicGlob = new Glob("/public/**/**/*.{css,js,html,jpg,png,gif,svg,ico,video,webm,mp4,jpeg}", {absolute: true});
const distPages = new Glob("/dist/pages/**/**/*.{tsx,js,jsx}", {absolute: true})
const distSrc = new Glob("/dist/src/**/**/*.{tsx,js,jsx}", {absolute: true})
const distPublic = new Glob("/dist/public/**/**/*.{css,js,html,jpg,png,gif,svg,ico,video,webm,mp4,jpeg}", {absolute: true});

const router = new Bun.FileSystemRouter({
    style: "nextjs",
    dir: process.cwd() + '/pages',
    origin: process.env.ORIGIN || "http://localhost:3000",
    assetPrefix: "_next/static/"
});   
/**
 * @function handleReplaceMents 
 * @description - replaces data to be compatible with Vader.js
 * @param {*} data 
 * @returns 
 */
function handleReplaceMents(data){
    data.split('\n').forEach((line, index)=>{
        switch(true){
            
            case line.includes('useReducer') && !line.includes('import'):
                line = line.replaceAll(/\s+/g, " ");

                let varTypereducer = line.split("=")[0].trim().split("[")[0].trim();
                let keyreducer = line.split("=")[0].trim().split("[")[1].trim().split(",")[0].trim();
          let setKeyreducer = line.split("=")[0].trim().split(",")[1].trim().replace("]", "");
          let reducer = line.split("=")[1].split("useReducer(")[1];

          let newStatereducer = `${varTypereducer} [${keyreducer}, ${setKeyreducer}] = this.useReducer('${keyreducer}', ${line.includes('=>') ? reducer + '=>{' : reducer}`;
           
          data = data.replace(line, newStatereducer);
          break
         
          case  line.includes('useState') && !line.includes('import'):
            let varType = line.split("[")[0]
          if (!line.split("=")[0].split(",")[1]) {
            throw new Error('You forgot to value selector  (useState) ' + ' at ' + `${file}:${string.split(line)[0].split('\n').length}`)
          }
          let key = line.split("=")[0].split(",")[0].trim().split('[')[1];

          if (!line.split("=")[0].split(",")[1]) {
            throw new Error('You forgot to add a setter (useState) ' + ' at ' + `${file}:${string.split(line)[0].split('\n').length}`)
          }
          let setKey = line.split("=")[0].split(",")[1].trim().replace("]", "");
          key = key.replace("[", "").replace(",", "");
          let valuestate = line.split("=")[1].split("useState(")[1];

          let regex = /useState\((.*)\)/gs;
          valuestate = valuestate.match(regex) ? valuestate.match(regex)[0].split("useState(")[1].split(")")[0].trim() : valuestate
          let newState = `${varType} [${key}, ${setKey}] = this.useState('${key}', ${valuestate}`;
          data = data.replace(line, newState);
          break;
         
          case line.includes("useRef") && !line.includes("import"):
          line = line.trim();
          let typeref = line.split(" ")[0]

          let keyref = line.split(typeref)[1].split("=")[0].trim().replace("[", "").replace(",", "");


          let valueref = line.split("=")[1].split("useRef(")[1];

          let newStateref = `${typeref} ${keyref} = this.useRef('${keyref}', ${valueref}`;
          data = data.replace(line, newStateref);
          case line.includes('.jsx') &&  line.includes('import') || line.includes('.tsx') &&  line.includes('import'):
                let old = line
                line = line.replace('.jsx', '.js')
                line = line.replace('.tsx', '.js')
                data = data.replace(old, line)
               
          break;
        }
    }) 
 
    data = data.replaceAll('jsxDEV', 'Vader.createElement')
    data = data.replaceAll('jsx', 'Vader.createElement')
    data = data.replaceAll('vaderjs/client', '/vader.js')
    data = data.replaceAll('.tsx', '.js') 
    let reactImportMatch = data.match(/import React/g);
    if(reactImportMatch){
       let fullmatch = data.match(/import React from "react"/g);
         if(fullmatch){
              data = data.replaceAll('import React from "react"', '');
         }
    }
    data = data.replaceAll('.ts', '.js')

    // check if Vader is imported
    let vaderImport = data.match(/import Vader/g);
    if(!vaderImport){
        data = `import Vader from "/vader.js";\n` + data;
    }
    return data;
}
 

/**
 * @function ContentType    
 * @description - returns the content type based on the file extension
 * @param {*} url 
 * @returns 
 */
const ContentType = (url)=>{
    switch(url.split('.').pop()){
        case 'css':
            return 'text/css';
        case 'js':
            return 'text/javascript';
        case 'json':
            return 'application/json';
        case 'html':
            return 'text/html';
        case 'jpg':
            return 'image/jpg';
        case 'png':
            return 'image/png';
        case 'gif':
            return 'image/gif';
        case 'svg':
            return 'image/svg+xml';
        case 'ico':
            return 'image/x-icon';
        default:
            return 'text/html';
    
    }
}
 
 
 /**
  * @function Server
  * @description - Creates a hmr development server
  * @param {Number} port 
  */
function Server(port){
    Bun.serve({
        port: port,
        fetch(req, res){
            const url = new URL(req.url);
            const success = res.upgrade(req);
            if(success){
                return new Response('Connected', {
                    headers: {
                        "Content-Type": "text/html"
                    }
                })
            }
            if(req.url.includes('.')){  
                return new Response(fs.readFileSync(process.cwd() + '/dist/' + url.pathname, 'utf8'), {
                    headers: {
                        "Content-Type": ContentType(req.url)
                    }
                })
            }
            let matchedRoute = router.match(url.pathname);
            if(matchedRoute){
                let {filePath, kind, name, params, pathname, query,} = matchedRoute
                let folder = url.pathname.split('/')[1]  
                let jsFile = filePath.split('pages/').pop().split('.').shift() + '.js' 
                let pageContent = fs.readFileSync(process.cwd() + '/dist/pages/' + folder + '/index.html', 'utf8')
                globalThis.mode === 'dev' ? pageContent += `
                <script type="module">
                    let ws = new WebSocket('ws://localhost:${port}');
                    ws.onmessage = async (e) => {
                        if(e.data === 'reload'){
                            window.location.reload()
                            console.log('Reloading...')
                        }
                    }
                </script>
                `  : void 0
                return new Response( pageContent, {
                    headers: {
                        "Content-Type": "text/html",
                        "X-Powered-By": "Vader.js v1.3.3"
                    }
                })
            }
            
            return new Response('Not Found', {
                status: 404,
                headers: {
                    "Content-Type": "text/html"
                }
            })
        },
        websocket: { 
            open(ws){ 
                clients.push(ws)
            },
        }
    })
}
/**
 * @function write
 * @description - Writes data to a file
 * @returns {void} 0
 * @param {string} file 
 * @param {any} data 
 * @returns 
 */
const write = (file, data) => { 
    try {
        if(!fs.existsSync('./dist')){
            fs.mkdirSync('./dist')
        } 
        Bun.write(file, data);
    } catch (error) {
        console.error(error)
    }
     
}
/**
 * @function read
 * @param {path} file 
 * @returns  {Promise<string>}
 */
const read = async (file) => {
    return await Bun.file(file).text();
}

/**
 * @function generateProviderRoutes
 * @description - Generates routes for hosting provders ie: vercel, cloudflare
 * @returns {void} 0
 */
async function generateProviderRoutes(){
   if(!config?.host?.provider){
    console.warn('No provider found in vader.config.js ignoring route generation...')
    return void 0;
   }
   let providerType = [{
     provider: 'vercel',
     file: 'vercel.json',
     out: process.cwd() + '/vercel.json',
     obj: {
        rewrites:[]
     }
   },{
     provider: 'cloudflare',
     file:'_redirects',
     out: 'dist/_redirects'
   }]

   let provider = providerType.find((p) => p.provider === config.host.provider)
   if(provider){
   let prev = null
   
    switch(provider.provider){
        case 'vercel': 
             prev = await read(provider.out);
            if(!prev.includes('rewrites')){
                prev =  []
            } else{
                prev = JSON.parse(prev).rewrites    
            }
            routes.forEach((r) => {
               if(r.path === '/'
               || prev.find((p) => p.destination === '/'+ r.path + '/index.html')
               ){
                return void 0;
               }
                prev.push({
                     source: '/'+ r.path,
                     destination: '/'+ r.path + '/index.html'
                })

                if(r.params.length > 0){
                    r.params.forEach((param)=>{
                        if(!param.paramData){
                            return void 0;
                        }
                        let parampath= Object.keys(param.paramData).map((p)=>`:${p}`).join('/')
                        prev.push({
                            source: '/'+ r.path + '/' + parampath ,
                            destination: '/'+ r.path + '/index.html'
                        })
                    })
                }

                fs.writeFileSync(provider.out, JSON.stringify({rewrites: prev}, null, 2))
                 
               
            })
            provider.obj.rewrites = prev
            write(provider.out, JSON.stringify(provider.obj, null, 2))
            break;
        case 'cloudflare':
            console.warn('Cloudflare is not supported yet refer to their documentation for more information:https://developers.cloudflare.com/pages/configuration/redirects/')
            break;
    }


    

   }
   return void 0;
}

/**
 * @function transform
 * @description - Transforms the jsx files to js files based on file paths
 */
 
async function transForm(){
    globalThis.isBuilding = true
    router.reload()
    for await (var file of glob.scan('.')) {    
        file = file.replace(/\\/g, '/');
        let isBasePath =  file.split('pages/')?.[1]?.split('/').length === 1;
        let folder = file.split('pages/')?.[1]?.split('/').slice(0, -1).join('/') || null;  
        let route = isBasePath ? router.match('/') : router.match('/'  + folder) 
        if(route){
            let {filePath, kind, name, params, pathname, query,} = route 
            let data = await read(filePath);
            try{
                data = new Bun.Transpiler({loader: "tsx", target:"browser", }).transformSync(data);
            }catch(e){
                console.error(e)
            }
            let out = `./dist/pages/${isBasePath ? 'index.js' : folder + '/index.js'}`; 
            isBasePath ? folder = '/': null;
            data = handleReplaceMents(data);
            globalThis.routes.push({path: folder, file: out, isParam: kind === 'dynamic' ? true : false, params, query, pathname})
            write(out, data); 
            bundleSize += data.length
            
            
        }
        
    }

    for await (var file of srcGlob.scan('.')) { 
        if(!fs.existsSync(process.cwd() +'/dist/src/')){
            fs.mkdirSync(process.cwd() +'/dist/src/')
        }
        file = file.replace(/\\/g, '/'); 
        switch(file.split('.').pop()){
            case 'ts':
                let transpiler = new Bun.Transpiler({loader: "ts", target:"browser", });
                let data = await read(file); 
                try {
                    data = transpiler.transformSync(data);
                } catch (error) {
                    console.error(error)
                }
                file = file.replace('.ts', '.js')
                let path = process.cwd() +'/dist/src/' + file.split('src/').pop() 
                write(path, data);
                bundleSize += data.length
                 
                break;
               
            case 'tsx':
                let transpilerx = new Bun.Transpiler({loader: "tsx", target:"browser", });
                let datax = await read(file);
                 try {
                    datax = transpilerx.transformSync(datax);
                 } catch (error) {
                     console.error(error)
                 }
                datax = handleReplaceMents(datax);
                file = file.replace('.tsx', '.js')
                let pathx = process.cwd() +'/dist/src/' + file.split('src/').pop()
                write(pathx, datax);
                
                
                break;
            case 'jsx':
                let transpilerjx = new Bun.Transpiler({loader: "jsx", target:"browser", });
                let datajx = await read(file); 
                try {
                    datajx = transpilerjx.transformSync(datajx);
                } catch (error) {
                    console.error(error)
                }
                datajx = handleReplaceMents(datajx);
                file = file.replace('.jsx', '.js')
                let pathjx = process.cwd() +'/dist/src/' + file.split('src/').pop() 
                write(pathjx, datajx);
                bundleSize += datajx.length
                break;
        }
    }
     

    for await (var file of publicGlob.scan('.')) {
        let data = await read(file);
        file = file.replace(/\\/g, '/');
        write(process.cwd() +'/dist/public/' + file.split('public/').pop(), data);
        bundleSize += fs.statSync(process.cwd() +'/dist/public/' + file.split('public/').pop()).size
    }
    for await (var file of vaderGlob.scan('.')) {
        let data = await read(file);
        file = file.replace(/\\/g, '/'); 
        write(process.cwd() +'/dist/' + file.split('node_modules/vaderjs/runtime/').pop(), data);
        bundleSize += fs.statSync(process.cwd() +'/dist/' + file.split('node_modules/vaderjs/runtime/').pop()).size
    }

    // clean dist folder
    for await( var file of distPages.scan('.')){
       file = file.replace(/\\/g, '/');
       let path = process.cwd() +'/pages/' + file.split('dist/pages/').pop() 
       path = path.replace('.js', config?.files?.mimeType || '.jsx')
       
         if(!fs.existsSync(path)){
                fs.unlinkSync(file)
         }
      
    }

    for await( var file of distSrc.scan('.')){
        file = file.replace(/\\/g, '/');
        let path = process.cwd() +'/src/' + file.split('dist/src/').pop()
        // if the file is a js file see if theirs a matching ts file
        if(file.split('.').pop() === 'js'){
            let tsFile =  path.replace('.js', '.ts') 
            // if the ts file exists then the js file is valid else if not the js file exists then remove
           switch(true){
            case !fs.existsSync(tsFile):
                // check if a tsx or jsx file exists
                let tsxFile =  path.replace('.js', '.tsx')
                let jsxFile =  path.replace('.js', '.jsx')
                let tsfile = path.replace('.js', '.ts')
                switch(true){
                    case fs.existsSync(tsxFile): 
                        break; 
                    case fs.existsSync(jsxFile):
                        break;
                    case  fs.existsSync(tsfile): 
                    break
                    default:
                        fs.unlinkSync(file)
                    break;
                }
                break;
            case fs.existsSync(tsFile):
                 
                break;
           }
        } 
     }

        for await( var file of distPublic.scan('.')){
            file = file.replace(/\\/g, '/');
            let path = process.cwd() +'/public/' + file.split('dist/public/').pop()
            if(!fs.existsSync(path)){
                fs.unlinkSync(file)
            }
        }

        

    /**
     * @function organizeRoutes
     * @description - Organizes routes that have param  paths
     */

    const organizeRoutes = () => {
        // if path starts with the same path and is dynamic then they are the same route and push params to the same route
        let newRoutes = []
        routes.forEach((route) => {
            let exists = routes.find((r) => r.path.startsWith(route.path) && r.isParam === true)
            if(exists){
                let b4Params = route.params  
                 route.params = []
                 route.params.push(b4Params)
                 route.params.push( {
                        jsFile:  '/pages/' + exists.path + '/index.js',
                        folder: '/pages/' + exists.path,
                        paramData:exists.params
                    }
                 )
                 route.query = exists.query 
                 newRoutes.push(route)
            }
            else if(!exists && !route.isParam){
                newRoutes.push(route)
               
            }
            //remove param route that matched
            routes = routes.filter((r) =>  exists ? r.path !== exists.path : true)
            
        })
        globalThis.routes = newRoutes
    }
    organizeRoutes()
 
 
    if(globalThis.mode === 'dev' && !globalThis.oneAndDone || globalThis.mode === 'build'){
        console.log('Generating routes...')
         
        /**
         * @description - create an html file for each route
         */
        routes.forEach((r)=>{

            
            globalThis.generatorWs.send(JSON.stringify({
                type:'generate',
                PWD: process.cwd(),
                output: process.cwd() + '/dist/pages/' + r.path + '/index.html',
                file:  '/pages/' + r.path + '/index.js',
                folder:'/pages/' + r.path,
                params: JSON.stringify(r.params),
            }))
    
        })  
        let i = setInterval(() => {
            if(hasGenerated.length === routes.length){ 
                globalThis.generatorWs.send(JSON.stringify({
                    type:'done'
                }))
                globalThis.oneAndDone = true
                clearInterval(i)
            }  
        }, 1000)
    }
    generateProviderRoutes( )
    globalThis.isBuilding = false
    console.log(`Finished building ${Math.round(bundleSize / 1000)}kb`)
    bundleSize = 0
    return void 0;
    
}
let port = 3000
switch (true) {
    case process.argv.includes('dev') && !process.argv.includes('build') && !process.argv.includes('start'):
   
      port = process.env.PORT || process.argv.includes('-p') ? process.argv[process.argv.indexOf('-p') + 1] : 3000
      globalThis.oneAndDone = false
      console.log(`
  Vader.js v${fs.readFileSync(process.cwd() + '/node_modules/vaderjs/package.json', 'utf8').split('"version": "')[1].split('"')[0]}
  - Watching for changes in ./pages
  - Watching for changes in ./src
  - Watching for changes in ./public
  - Serving on port ${port}
  `)
      globalThis.mode = 'dev'
        Server(port) 
        transForm()

        Bun.spawn({
            cwd: process.cwd() + '/node_modules/vaderjs/binaries/',
            env: {
                PWD: process.cwd(), 
                FOLDERS: 'pages,src,public',
                onExit: (code) => {
                    globalThis.isBuilding = false
                    globalThis.oneAndDone = true
                }
            },
            cmd: ['node', 'watcher.js'],
        })
       
        const ws = new WebSocket(`ws://localhost:${3434}`)
        ws.on('open', () => {
            console.log('Watching for changes...')
        }) 
        ws.on('message', (message) => {
            message =  JSON.parse(message.toString()) 
            switch(true){
                case message.type === 'change' && !globalThis.isBuilding:
                    console.log('Rebuilding...')
                    globalThis.clients.forEach((client) => {
                        client.send('reload')
                    })
                    transForm()
                break;
                case message.type === 'add' && !globalThis.isBuilding:
                    console.log('Rebuilding...')
                    globalThis.clients.forEach((client) => {
                        client.send('reload')
                    })
                    transForm()
                break;
            }
            
        })
       
      break;
    case process.argv.includes('build') && !process.argv.includes('dev') && !process.argv.includes('start'):
      globalThis.devMode = false
      globalThis.isProduction = true
      globalThis.routeStates = []
      console.log(`
  Vader.js v1.3.3 
  Building to ./dist
  `)
     
      globalThis.mode = 'build'
      transForm() 
      break; 
    case process.argv.includes('start') && !process.argv.includes('dev') && !process.argv.includes('build'):
       port  = process.env.PORT || process.argv.includes('-p') ? process.argv[process.argv.indexOf('-p') + 1] : 3000
        console.log(`
Vader.js v1.3.3 
Serving ./dist on port ${port}
url: http://localhost:${port}
            `)
        globalThis.devMode = false
        globalThis.isProduction = true
         
         Server(port)
        break;
      default:
     
      break;
  
  }