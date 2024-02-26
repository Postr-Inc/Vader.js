import { watch } from 'fs'
import fs from 'fs'
globalThis.hasLogged = false
export function watchDir(cwd, _){
    process.chdir(cwd)
    let p = Bun.spawn(['bun', "run", process.cwd() + '/node_modules/vaderjs/binaries/compiler/main.js'], {
        cwd: process.cwd(),
        env: {
            hmr: true
        },
        stdout: 'inherit',
    })
    let paths = ['src', 'pages', 'public', 'routes', 'vader.config.ts']
    for(var i in paths){
        let path = paths[i]
        if(!fs.existsSync(process.cwd() + '/' + path)){ 
            continue;
        }
        watch(process.cwd() + '/' + path, { recursive: true, absolute:true }, (event, filename) => { 
            if(!filename.endsWith('.ts') && !filename.endsWith('.tsx') && !filename.endsWith('.js') && !filename.endsWith('.jsx')) return
           if(filename && !filename.includes('node_modules') && !globalThis.hasLogged){ 
            console.log(`\x1b[36mwait \x1b[0m  - compiling (client and server)`)
                globalThis.hasLogged = true 
                 p.kill(0) 
                 p = Bun.spawn(['bun', "run", process.cwd() + '/node_modules/vaderjs/binaries/compiler/main.js'], {
                    cwd: process.cwd(),
                    env: {
                        hmr: true,
                        wasLastRun: true
                    },
                    stdout: 'inherit',
                })
               setTimeout(() => {
                     globalThis.hasLogged = false
               }, 1000)
           }
        })
    }
    
     
}