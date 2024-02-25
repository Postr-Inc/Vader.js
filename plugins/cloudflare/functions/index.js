import { Glob } from 'bun'
import fs from 'fs'
const glob = new Glob("/**/*.{ts,tsx,js,jsx}", {
    absolute: true,
}); 
/**
 * @description This function generates cloudflare functions from the routes folder
 */
async function generate(){
    let config   = await import(process.cwd() + '/vader.config.js').then((config) => { return config.default })
    let start = Date.now()
    for(var i of glob.scanSync({cwd: process.cwd() + '/routes', absolute: true})){ 
        let data = await Bun.file(i).text()
        let method = ''
        i = i.replaceAll('\\', '/').replace(process.cwd(), '')
        if(!data.includes(data.match(new RegExp('export\\s+default')))){
         throw new Error('File must have a default export')
        }
        data.split('\n').forEach((line, index) => { 
          if(line.includes('GET') || line.includes('POST') || line.includes('PUT') || line.includes('DELETE') && line.includes('function')){
            line =  line.replace(/export\s+default\s+async\s+function/g, line.includes('async') ? 'async function' : 'function')
            method = line.split('function')[1].split('(')[0].trim()
            data = data.replace(data.split('\n')[index], line)
            data = data + `\nexport  async function onRequest${method.toLowerCase().charAt(0).toUpperCase() + method.toLowerCase().slice(1)}(request){
              let req = {
                url: request.request.url,
                method: request.request.method,
                headers:  request.request.headers,
            }
            let res = {
                params: (param) => {
                    return request.params[param]
                },
                query: (param) => {
                   let url = new URL(request.request.url)
                   return url.searchParams.get(param)
                }
            } 
              let response = await ${method}({req, res})
              return response
            }
            `
          }
        }); 

        let env =  `globalThis.env = {
            
                    ${
                        Object.keys(config?.env).map((key) => {
                            return `${key}:"${config.env[key]}",`
                        } ).join('\n')
                    }
                   ${Object.keys(process.env).map((key) => {
                    let value = process.env[key].replace(/"/g, '\\"')
                    value = value.replace(/\\n/g, '\\n') // remove new lines
                    value = value.replace(/\\r/g, '\\r') // remove carriage returns
                    value = value.replace(/\\t/g, '\\t') // remove tabs
                    value = value.replace('/\/g', '\\\\') // remove octal escape sequences
                    // remove octal escape sequences
                    value = value.replace(/\\[0-7]{1,3}/g, ''); 
                    return `${key}:"${value}"`
                } ).join(',\n') 
            }
        };
        `  
        // make env all on one line
        env = env.replace(/\n/g, '')
        data = env + data
  
         
        fs.mkdirSync(process.cwd() + '/build/functions' + i.split('/routes')[1].split('/').slice(0, -1).join('/'), { recursive: true })
        fs.writeFileSync(process.cwd() + '/build/functions/' + i.split('/routes')[1].replace('.ts', '.js').replace('.tsx', '.js').replace('.jsx', '.js'), data)
         
        let nodeModules = process.cwd() + '/node_modules/vaderjs/plugins/cloudflare/toCopy'
        let glb = new Glob('**/*', {
          absolute: true,
          cwd: nodeModules
        })
        for(var file of glb.scanSync({cwd: nodeModules, absolute: true})){ 
          file = file.replaceAll('\\', '/').replace(nodeModules, '')
          if(fs.existsSync('build/' + file.split('/toCopy')[1])) continue
          let data = await Bun.file(file).text() 
          let path = file.split('/toCopy')[1] 
          Bun.write(process.cwd() + '/build/' + path, data)
        }
      }
        console.log(`\x1b[32msuccess \x1b[0m - Cloudflare Functions Compiled in: ${Date.now() - start}ms`)
}
export default {
    name: 'Cloudflare Functions Plugin',
    description: 'This plugin utilizes cloudflare functios for server side rendering',
    version: '0.0.1', 
    type: "SSR",
    init: async (path, options) => {
        console.log(`\x1b[32mevent \x1b[0m - Cloudflare Functions Plugin Initialized`)
        await generate()
    }  
}