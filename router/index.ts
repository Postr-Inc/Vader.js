 
//@ts-nocheck
import fs from 'fs'   
const router = new Bun.FileSystemRouter({
    dir: process.cwd() + '/pages',
    style:'nextjs'
})
let wsClients = []  
function handleContentTypes(url: string){
    let types: any = {
        'html': 'text/html',
        'css': 'text/css',
        'js': 'text/javascript',
        'json': 'application/json',
        'png': 'image/png',
        'jpg': 'image/jpg',
        'jpeg': 'image/jpeg',
        'svg': 'image/svg+xml',
        'gif': 'image/gif',
        'ico': 'image/x-icon',
        'tiff': 'image/tiff',
        'woff': 'font/woff',
        'woff2': 'font/woff2',
    }

    let typeArray = Array.from(Object.keys(types))
    
    let ext = url.split('.').pop()
    if(typeArray.includes(ext)){
        return types[ext]
    }

}

 
function spawn_ssr_server(config: any ){ 
    if(!fs.existsSync(process.cwd() + '/routes')){
        throw new Error('SSR requires a routes directory to be present in your project')
    }
    let routesRouter = new Bun.FileSystemRouter({
        dir: process.cwd() + '/routes',
        style: 'nextjs'
    }) 
   async function serve (req,res){ 
    routesRouter.reload()
    if(res.upgrade(req)){
        return
    }
    let url = new URL(req.url)
    if(url.pathname.includes('.')){
         url.pathname = url.pathname.replace('/\/', '/').replace('/build/', '')
         if(url.pathname.includes('/build')){
                 url.pathname = url.pathname.replace('/build', '')
         }
         let file = process.cwd() + '/build' + url.pathname   
         let fileType = handleContentTypes(file)
          if(fs.existsSync(file)){
                 let content = await Bun.file(file).text()
                 let data = Buffer.from(content, 'utf-8');
                 const compressed = Bun.gzipSync(data);
                 return new Response(compressed, {status: 200, headers: {'Content-Type': fileType, 'x-powered-by': 'Vader', 
                'Content-Encoding':'gzip',
                 ...config?.routes.find(route => route.pathname === "*" || route.pathname === url.pathname)?.headers}})
          }
    }
    let routeMatch = routesRouter.match(url.pathname) 
    if(routeMatch){
        let route = require(routeMatch.filePath).default
         
        if(route?.name !== req?.method){
            return new Response('Method Not Allowed', {status: 405})
        }else{ 
           try {
            let Request = { 
                req,
                res
            }
            let response = await route(Request)
           
            if(response instanceof Response){ 
                // set x-powered-by header
                response.headers.set('x-powered-by', 'Vader')
                response.headers.set('Content-Type', 'text/html')
                return response
            }
            throw new Error(`Route ${routeMatch.filePath.split('/routes')[1]} did not return a response in file ${routeMatch.filePath}`)
           } catch (error) {
                  console.log(error)
                  return new Response('Internal Server Error', {status: 500})
           }
        }
         

    }
   }
   let server =  Bun.serve({
        port:  config?.env?.PORT || 3000,
        hostname: config?.host?.hostname || 'localhost', 
        reusePort: true,
        lowMemoryMode: true,
        development: false, 
        ...(config?.Router?.tls && {tls: {cert: config.Router.tls.cert, key: config.Router.tls.key}}),
        websocket: {
        message(event){
            
        },
        
        open(ws){
            wsClients.push(ws)
        },
       },
       async  fetch(req,res){
             return await serve(req,res)
        },

        error(error) {
            console.log(error)
        }
    }) 
     
    return {serve, server}
}
 
function spawnServer(config: any){
    Bun.serve({
        port:  config.env.PORT || 3000,
        hostname: config.host.hostname || 'localhost',
        reusePort: true,
        websocket: {
        message(event){
            
        },
        open(ws){
            wsClients.push(ws)
        },
       },
       async  fetch(req,res){
            router.reload()
            if(res.upgrade(req)){
                return
            }
            let url = new URL(req.url)
            if(url.pathname.includes('.')){
               url.pathname = url.pathname.replace('/\/', '/')
               url.pathname = url.pathname.replace('/build/', '') 
               
               let file = process.cwd() + '/build' + url.pathname  
               let fileType = handleContentTypes(file)
                if(fs.existsSync(file)){
                     let content = await Bun.file(file).text()
                     let data = Buffer.from(content, 'utf-8');
                     const compressed = Bun.gzipSync(data);

                     return new Response(compressed, {status: 200, headers: {'Content-Type': fileType, 'x-powered-by': 'Vader',  'x-powered-by': 'Vader', 
                     'Content-Encoding':'gzip',
                     'Accept-Encoding': 'gzip, deflate, br','Connection': 'keep-alive', 'Cache-Control': 'no-cache', 'Pragma': 'no-cache', 'Expires': '0',  ...config?.Router?.headers}})
                }
            }
            let route = router.match(url.pathname)
            if(route){ 
              let isParamRoute = route.filePath.includes('[') && route.filePath.includes(']')
              let path = route.filePath.split('/pages')[1].replace('.jsx', '.js').replace('.tsx', '.js').replace('.ts', '.js')  
              path = isParamRoute ?  'index.html' : path
              let html = fs.readFileSync(process.cwd() + `/build/${path.replace('.js', '.html')}`).toString()
              html = html + `
              <script>
               let ws = new WebSocket('ws://${config.host.hostname || 'localhost'}:${config.env.PORT || 3000}')
                ws.onmessage = function(event){
                     console.log(event.data)
                }
                ws.onclose = function(event){
                    window.location.reload()
                }
              </script>
              ` 
              const data = Buffer.from(html, 'utf-8');
              const compressed = Bun.gzipSync(data);
              return new Response(compressed, {status: 200, headers: {'Content-Type': 'text/html', 'x-powered-by': 'Vader', 
              'Content-Encoding':'gzip',
              'Accept-Encoding': 'gzip, deflate, br','Connection': 'keep-alive', 'Cache-Control': 'no-cache', 'Pragma': 'no-cache', 'Expires': '0',
              ...config?.Router?.headers}})
            }
            return new Response('Not Found', {status: 404})
        }
    })

    
} 
/**
 * @name Vader Router
 * @description This plugin is responsible for routing and serving the application
 */
export default {
    name: 'Vader Router',
    version: '1.0.0',
    once: true,
    init:  ( ) => {  
         if(!globalThis.isListening){ 
             let config = require(process.cwd() + '/vader.config.js').default  
             if(process.env.mode === 'production'){
                console.log(`\x1b[32msuccess \x1b[0m- listening on port ${config.env.PORT || 3000}`)
                spawnServer(config)
             }  
             config?.env?.SSR ? spawn_ssr_server(config ) : spawnServer(config)  
             globalThis.isListening = true
         }  
    }
}