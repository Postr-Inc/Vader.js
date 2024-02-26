import * as Bun from 'bun'
import {  Document, DOMParser} from 'vaderjs/binaries/Kalix/index.js'
import { renderToString } from '../../server'
import fs from 'fs'
let routes = new Bun.FileSystemRouter({
    dir: process.cwd() + '/pages',
    style:"nextjs"
}).routes 
globalThis.isNotFirstRun = false
async function generate(){     
  let config = await import(process.cwd() + '/vader.config.js').then((config) => { return config.default })
  let provider = config?.host?.provider   

  let providerRoutes = [] 
    Object.keys(routes).map((route) => {
      if(route.includes('[')){
               
               let root = Object.keys(routes).find((r) => {
                   return r === '/'
               } ) 
            
                
                let param = route.split('/[')[1].split(']')[0] 
                let p = {}
                let existingParams = routes[root]?.params || []
                existingParams.push({
                    isCatchAll: route.includes('[[catchall]]') ? true : false,  
                    name: param,
                    file: routes[route],
                    baseFolder: route.split('[')[0]
                }) 
                p.file = routes[root]
                p.params = existingParams
                routes[root] = p 
                delete routes[route] 
            
      }
  })
  for(var i in routes){
    let path = i  
    let file = routes[i]
    if(typeof file === 'object'){
        file = file.file
    } 
    let comp =  require(file).default 
    if(!comp){
        continue;
    } 
      
    let dom =  await renderToString(comp)
    let isHtml = dom.includes('<html')  
    let folder = path.split('/pages')[0]
    let newPath = process.cwd() + '/build' + folder + '/index.html'
    let name = comp.name || 'App'
    file = file.replace(/\\/g, '/').replace('\/\/', '/').replace(process.cwd().replace(/\\/g, '/'), '').split('/pages')[1].replace('.tsx', '.js').replace('.jsx', '.js')
    let isParamRoute = routes[i].params ? true : false 
    let baseFolder = ''
    if(isParamRoute){
        let route  = routes[i].params[0]
        baseFolder =  i.split('[')[0] 
        let providerPath;
        switch(true){
            case provider === 'vercel':
                 if(route.isCatchAll){
                    providerPath = `${baseFolder}/*`
                    providerRoutes.push({source: providerPath, destination: `${path}/index.html`})
                    break;
                 }
                 providerPath = `${baseFolder}:${route.name}`
                 providerRoutes.push({source: providerPath, dest: `/`}) 
                 break;
            case provider === 'nginx': 
                providerPath = `RewriteRule ^${baseFolder.replace('/', '')}.*$ ${path}/index.html [L]`
                providerRoutes.push(providerPath)
                break;
            case provider === 'cloudflare':
                if(route.isCatchAll){
                    providerPath = `${baseFolder}/*`
                    providerRoutes.push({source: providerPath, destination: `${path}/index.html`})
                    break;
                }
                providerPath = `${baseFolder}/*`
                providerRoutes.push({source: providerPath, destination: `${path}/index.html`})
                break;
        }
    }else{
        let providerPath;
        switch(true){
            case provider === 'vercel':
                 providerPath = `${path}`
                 providerRoutes.push({source: providerPath, dest: `${path}/index.html`}) 
                 break;
            case provider === 'nginx': 
                if(i == '/'){
                    break;
                }
                providerPath = `RewriteRule ^${path.replace('/', '')}/$ ${path}/index.html [L]`
                providerRoutes.push(providerPath)
                break;
           
            
        }
    } 
    dom = preRender ? dom : '<div id="root"></div>' + `
    <script type="module"> 
        
       import { render } from '/src/client.js'
       let ${name} = await import('/pages/${file.replace(process.cwd(), '')}')
         if(${name}.default){
            ${name} = ${name}.default
        }else{
                let keys = Object.keys(${name})
                ${name} = ${name}[keys[0]]
        }
       import Kuai from '/src/router.js'
       let kuai = new Kuai()
       ${
         routes[i].params ? 
         routes[i].params.map((param) => {
                let name = param.name
                let file = param.file.replace(/\\/g, '/').replace('\/\/', '/').replace(process.cwd().replace(/\\/g, '/'), '').split('/pages')[1].replace('.tsx', '.js').replace('.jsx', '.js')
                return `
                // handle if default or named
                let ${name} = await import('/pages/${file}')
                if(${name}.default){
                    ${name} = ${name}.default
                }else{
                     let keys = Object.keys(${name})
                     ${name} = ${name}[keys[0]]
                }
                kuai.get('${param.baseFolder}:${name}', (c) => {
                    render(${name}, ${
                    isHtml ? `document.documentElement`: `document.body.firstChild`
                    }, c.req, c.res)
                })`
         }).join('\n') : ''
       }
       kuai.get('${path}', (c) => {
            render(${name}, ${
            isHtml ? `document.documentElement`: `document.body.firstChild`
            }, c.req, c.res)
       })

       kuai.listen()

        `
    dom = dom + `</script>`
    Bun.write(newPath, dom)
    
  }
  switch(true){
      case provider === 'vercel': 
          let vercelJSON = process.cwd() + '/vercel.json'
          let vercel = {
              "rewrites": providerRoutes
          }
         
          fs.writeFileSync(vercelJSON, JSON.stringify(vercel))
          break;
    case provider === 'nginx':
        let full = `
Header add x-powered-by "vaderjs" 
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  # If the request is not for a file or directory
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d

  # Rewrite specific paths to index.html 
   ${providerRoutes.join('\n')}
</IfModule>
        `
         fs.writeFileSync(process.cwd() + '/.htaccess', full)
        break; 
  }
  console.log(`\x1b[32mSuccess\x1b[0m - Static files generated`)

  return true
}


/**
 * @name Vaderjs SSG Plugin
 * @description This plugin is used to generate static files from the deep object - using kalix.js
 * @version 0.0.1
 */
export default {
    name: 'Vaderjs SSG Plugin',
    version: '0.0.1',
    init: async (component) => { 
        
  console.log(`\x1b[36mwait \x1b[0m  - generating static files`)
           return generate(component)
    }
}