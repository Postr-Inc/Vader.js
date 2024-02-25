import * as Bun from 'bun'
import { Element, Document, DOMParser} from 'vaderjs/binaries/Kalix/index.js'
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
  for(var i in routes){
    let path = i 
    let file = routes[i]
    let comp =  require(file).default
    let document = new Document()
    let div = document.createElement('div')
    div.setAttribute('id', 'root') 
    let dom =  await renderToString(comp)   
    div.setContent(dom) 
    dom = div.toString("outerHTML")   
    let folder = path.split('/pages')[0]
    let newPath = process.cwd() + '/build' + folder + '/index.html'
    let name = comp.name
    file = file.replace(/\\/g, '/').replace('\/\/', '/').replace(process.cwd().replace(/\\/g, '/'), '').split('/pages')[1].replace('.tsx', '.js').replace('.jsx', '.js')
    let isParamRoute = path.includes('[')
    let baseFolder = ''
    if(isParamRoute){
        baseFolder = path.split('[')[0]
        let providerPath;
        switch(true){
            case provider === 'vercel':
                 providerPath = `${baseFolder}:${path.split('[')[1].split(']')[0]}`
                 providerRoutes.push({source: providerPath, dest: `${path}/index.html`}) 
                 break;
            case provider === 'nginx': 
                providerPath = `RewriteRule ^${baseFolder.replace('/', '')}.*$ ${path}/index.html [L]`
                providerRoutes.push(providerPath)
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
    dom = dom + `
    <script type="module">
       import { render } from '/src/client.js'
       import ${name} from '/pages/${file.replace(process.cwd(), '')}'
       import Kuai from '/src/router.js'
       let kuai = new Kuai()
       kuai.get('${path}', (c) => {
            render(${name}, document.getElementById('root'), c.req, c.res)
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