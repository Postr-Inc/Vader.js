#!/usr/bin/env bun

import ansiColors from 'ansi-colors'
import { Glob } from 'bun'
const args = Bun.argv.slice(2)
globalThis.isBuilding = false;
import fs from 'fs'
import { platform } from 'os'
import path from 'path'

let bunPath = 'bun'; // Default for Linux/Mac
if (platform() === 'win32') {
    bunPath = 'bun'; // Bun path for Windows
} else {
    bunPath = path.resolve(process.env.HOME || process.env.USERPROFILE, '.bun', 'bin', 'bun');
}




if (!fs.existsSync(process.cwd() + '/app') && !args.includes('init')) {
    console.error(`App directory not found in ${process.cwd()}/app`)
    process.exit(1)
}
if (!fs.existsSync(process.cwd() + '/public')) {
    fs.mkdirSync(process.cwd() + '/public')
}
if (!fs.existsSync(process.cwd() + '/src')) {
    fs.mkdirSync(process.cwd() + '/src')
}
if (!fs.existsSync(process.cwd() + '/vader.config.ts')) {
    fs.writeFileSync(process.cwd() + '/vader.config.ts',
        `import defineConfig from 'vaderjs/config'
export default  defineConfig({
    port: 8080,
    host_provider: 'apache'
})`)
}
var config = require(process.cwd() + '/vader.config.ts').default
const mode = args.includes('dev') ? 'development' : args.includes('prod') || args.includes('build') ? 'production' : args.includes('init') ? 'init' : args.includes('serve') ? 'serve' : null;
if (!mode) {
    console.log(`
    Usage:
     bun vaderjs serve - Start the server
     bun vaderjs dev - Start development server output in dist/
     bun vaderjs prod - Build for production output in dist/
     bun vaderjs init - Initialize a new vaderjs project
    `)
    process.exit(1)
}

if (mode === 'init') {
    if (fs.existsSync(process.cwd() + '/app')) {
        console.error('App directory already exists: just run `bun vaderjs dev` to start the development server')
        process.exit(1)
    }
    let counterText = await Bun.file(path.join(process.cwd(), "/node_modules/vaderjs/examples/counter/index.jsx")).text()
    await Bun.write(path.join(process.cwd(), "/app/index.jsx"), counterText)
    console.log('Initialized new vaderjs project: run `bun vaderjs dev` to start the development server')
    process.exit(0)
}

console.log(
    `VaderJS - v${require(process.cwd() + '/node_modules/vaderjs/package.json').version} 🚀
  Mode: ${mode}
  SSR: ${require(process.cwd() + '/vader.config.ts').default.ssr ? 'Enabled' : 'Disabled'}
  PORT: ${require(process.cwd() + '/vader.config.ts').default.port || 8080}
  ${mode == 'serve' ? `SSL: ${require(process.cwd() + '/vader.config.ts').default?.ssl?.enabled ? 'Enabled' : 'Disabled'} ` : ``}
    `
)


let { port, host, host_provider } = require(process.cwd() + '/vader.config.ts').default
if (host_provider === 'apache' && mode === 'development') {
    console.warn('Note: SSR will not work with Apache')
}
if (!fs.existsSync(process.cwd() + '/jsconfig.json')) {
    let json = {
        "compilerOptions": {
            "jsx": "react",
            "jsxFactory": "e",
            "jsxFragmentFactory": "Fragment",
        }
    }
    await Bun.write(process.cwd() + '/jsconfig.json', JSON.stringify(json, null, 4))
}

globalThis.bindes = []
var fnmap = []
const vader = {
    isDev: mode === 'development',
    onFileChange: (file, cb) => {
        fs.watch(file, cb)
    },
    runCommand: (cmd) => {
        return new Promise((resolve, reject) => {
            let c = Bun.spawn(cmd, {
                stdout: 'inherit',
                cwd: process.cwd(),
                onExit({ exitCode: code }) {
                    if (code === 0) {
                        resolve()
                    } else {
                        reject()
                    }
                }
            })

             


        })
    },
    onBuildStart: (cb) => {
        if (!fnmap.find(v => v.code == cb.toString())) {
            fnmap.push({ code: cb.toString(), fn: cb })
        }
    },
    injectHTML: (html) => {
        bindes.push(html)
        globalThis.bindes = bindes
    },
}
const handleReplacements = (code) => {
    let lines = code.split('\n')
    let newLines = []
    for (let line of lines) {
        let hasImport = line.includes('import')

        if (hasImport && line.includes('public') && line.includes('.png') ||
     hasImport && line.includes('.jpg') && line.includes('public') ||   hasImport && line.includes('.jpeg') && line.includes('public') ||   hasImport && line.includes('.gif') && line.includes('public') ||   hasImport && line.includes('.svg') && line.includes('public')) {
            // remove ../ from path 

            line = line.replaceAll('../', '').replaceAll('./', '')

            line = line.replace('public', '/public') 
        }
        if (hasImport && line.includes('.css')) {
            try {
                let isSmallColon = line.includes("'")
                let url = isSmallColon ? line.split("'")[1] : line.split('"')[1]
                // start from "/" not "/app"
                // remvoe all ./ and ../
                url = url.replaceAll('./', '/').replaceAll('../', '/')

                let p = path.join(process.cwd(), '/', url)
                line = '';
                url = url.replace(process.cwd() + '/app', '')
                url = url.replace(/\\/g, '/')
                if (!bindes.includes(`<link rel="stylesheet" href="${url}">`) && !bindes.includes(`
                  <style>
                    ${fs.readFileSync(p, 'utf-8')}
                  </style>
                  `)) {
                    bindes.push(`
                    <style>
                      ${fs.readFileSync(p, 'utf-8')}
                    </style>
                    `)
                }
            } catch (error) {
                console.error(error)
            }
        }
        if (line.toLowerCase().includes('genkey()')) {
            line = line.toLowerCase().replace('genkey()', `this.key = "${crypto.randomUUID()}"`)
        }
        if (!hasImport && line.includes('useFetch')) {
            line = line.replace('useFetch', 'this.useFetch')
        }
        if (!hasImport && line.includes('useState') && line.includes('[')) {
            let key = line.split(',')[0].split('[')[1].replace(' ', '')
            let b4 = line
            b4 = line.replace('useState(', `this.useState('${key}',`)
            line = b4
        }
        if (!hasImport && line.includes('useAsyncState')) {
            let key = line.split(',')[0].split('[')[1].replace(' ', '')
            let b4 = line
            b4 = line.replace('useAsyncState(', `this.useAsyncState('${key}',`)
            line = b4
        }
        if (!hasImport && line.includes('useEffect')) {
            let b4 = line
            b4 = line.replace('useEffect(', `this.useEffect(`)
            line = b4
        }
        if (!hasImport && line.includes('useRef')) {
            line = line.replace(' ', '')
            let b4 = line
            let key = line.split('=')[0].split(' ').filter(Boolean)[1]
            b4 = line.replace('useRef(', `this.useRef('${key}',`)
            line = b4
        }

        newLines.push(line)
    }
    let c = newLines.join('\n')
    return c
}

if (!fs.existsSync(process.cwd() + '/dev/bundler.js')) {
    fs.mkdirSync(process.cwd() + '/dev', { recursive: true })
    fs.copyFileSync(require.resolve('vaderjs/bundler/index.js'), process.cwd() + '/dev/bundler.js')
}
let start = Date.now()
async function generateApp() {
    globalThis.isBuilding = true;
    console.log(ansiColors.green('Building...'))
    if (mode === 'development') {

    } else {
        fs.mkdirSync(process.cwd() + '/dist', { recursive: true })
    }
    try {
        let plugins = config.plugins || []
        for (let plugin of plugins) {
            if (plugin.onBuildStart) {
                await plugin.onBuildStart(vader)
            }
        }
    } catch (error) {
        console.log(error)
    }


    return new Promise(async (resolve, reject) => {
        let routes = new Bun.FileSystemRouter({
            dir: path.join(process.cwd(), '/app'),
            style: 'nextjs'
        })
        routes.reload()
        globalThis.routes = routes.routes
        Object.keys(routes.routes).forEach(async (route) => {

            let r = routes.routes[route]
            let code = await Bun.file(r).text()
            code = handleReplacements(code)
            let size = code.length / 1024
            r = r.replace(process.cwd().replace(/\\/g, '/') + '/app', '')
            r = r.replace('.jsx', '.js').replace('.tsx', '.js')
            if(!fs.existsSync(path.join(process.cwd() + '/dist', path.dirname(r)), { recursive: true })){
 fs.mkdirSync(path.join(process.cwd() + '/dist', path.dirname(r)), { recursive: true })
            }
            
            let params = routes.match(route).params || {}
            let base = routes.match(route)
            let paramIndexes = []
            for (let param in params) {
                let routes = base.pathname.split('/')
                let index = routes.indexOf('[' + param + ']')
                paramIndexes.push(index)
            }

            // dont return
            code = await new Bun.Transpiler({
                loader: 'tsx',
                tsconfig: {
                    "compilerOptions": {
                        "jsx": "react",
                        "jsxFactory": "e",
                        "jsxFragmentFactory": "Fragment"
                    }
                }
            }).transformSync(code)

            fs.writeFileSync(
                process.cwd() + '/dist/' + path.dirname(r) + '/' + path.basename(r),
                `
                      let route = window.location.pathname.split('/').filter(Boolean) 
                      let params = {
                        // get index tehn do route[index]
                        ${Object.keys(params).map((param, i) => {
                    if (paramIndexes[i] !== -1) {
                        var r_copy = r;
                        r_copy = r_copy.split('/').filter(Boolean)
                        var index = paramIndexes[i] - 1
                        return `${param}: route[${index}]`
                    }
                }).join(',\n')}
                      }
              
                      \n${code}
                  `
            );
            if(!fs.existsSync(process.cwd() + '/dev', )){

            fs.mkdirSync(process.cwd() + '/dev', { recursive: true })
            } 


            if (!fs.existsSync(process.cwd() + '/dev/readme.md')) {
                fs.writeFileSync(process.cwd() + '/dev/readme.md', `# Please do not edit the bundler.js file in the dev directory. This file is automatically generated by the bundler. \n\n`)
            }
            async function runT() {
                return await new Bun.Transpiler({
                    loader: 'tsx',
                }).transformSync(await Bun.file(require.resolve('vaderjs')).text())
            }
            if (!fs.existsSync(path.join(process.cwd(), '/dist/src/vader'))
                || fs.readFileSync(path.join(process.cwd(), '/dist/src/vader/index.js')) != await runT()
            ) {
               if(!fs.existsSync(path.join(process.cwd(), '/dist/src/vader'))) fs.mkdirSync(process.cwd() + '/dist/src/vader', { recursive: true });
              else fs.writeFileSync(path.join(process.cwd(), '/dist/src/vader/index.js'), (await runT()));

            }
            await Bun.spawn({
                cmd: [bunPath, 'run', './dev/bundler.js'],
                cwd: process.cwd(),
                stdout: 'inherit',
                env: {
                    ENTRYPOINT: path.join(process.cwd(), 'dist', path.dirname(r), path.basename(r)),
                    ROOT: path.join(process.cwd(), 'app/'),
                    OUT: path.dirname(r),
                    file: path.join(process.cwd(), 'dist', path.dirname(r), path.basename(r)),
                    DEV: mode === 'development',
                    size,
                    bindes: bindes.join('\n'),
                    filePath: r,
                    isAppFile: true,
                    isJsx: true,
                    INPUT: `../app/${r.replace('.js', '.jsx').replace('.tsx', '.js')}`,
                },
                onExit({ exitCode: code }) {
                    if (code === 0) {
                        bindes = [];
                        resolve();
                    } else {
                        reject();
                    }
                },
            });
        })

        switch (host_provider) {
            case 'vercel':

                let vercelData = {
                    rewrites: []
                }

                for (let route in routes.routes) {
                    let { filePath, kind, name, params, pathname, query } = routes.match(route)
                    let r = route

                    if (r.includes('[')) {
                        r = r.replaceAll('[', ':').replaceAll(']', '')
                    }
                    if (r === '/') {
                        continue
                    }

                    vercelData.rewrites.push({
                        source: r,
                        destination: `${path.dirname(routes.routes[route]).replace(process.cwd().replace(/\\/g, '/') + '/app', '')}/index.html`
                    })
                }

                fs.writeFileSync(process.cwd() + '/vercel.json', JSON.stringify(vercelData, null, 4))
                break;
            case 'apache':
                let data = ''

        }
        // run all plugins that have onBuildFinish
        try {
            let plugins = config.plugins || []
            for (let plugin of plugins) {
                if (plugin.onBuildFinish) {
                    await plugin.onBuildFinish(vader)
                }
            }
        } catch (error) {
            console.error(ansiColors.red(error))
        }

    })


}

function handleFiles() {
    return new Promise(async (resolve, reject) => {
        try {
            let glob = new Glob('public/**/*')
            for await (var i of glob.scan()) {
                let file = i
                if(!fs.existsSync(path.join(process.cwd() + '/dist', path.dirname(file)))){
fs.mkdirSync(path.join(process.cwd() + '/dist', path.dirname(file)), { recursive: true })
                }
                 
                if (fs.existsSync(path.join(process.cwd() + '/dist', file))) {
                    fs.rmSync(path.join(process.cwd() + '/dist', file))
                }
                fs.copyFileSync(file, path.join(process.cwd() + '/dist', file))
            }
            let glob2 = new Glob('src/**/*')
            for await (var i of glob2.scan()) {
                var file = i
                if(!fs.existsSync(path.join(process.cwd() + '/dist', path.dirname(file))))
                fs.mkdirSync(path.join(process.cwd() + '/dist', path.dirname(file)), { recursive: true });
                // turn jsx to js
                if (file.includes('.jsx') || file.includes('.tsx')) {
                    let code = await Bun.file(file).text()

                    code = handleReplacements(code)
                    code = await new Bun.Transpiler({
                        loader: 'tsx',
                    }).transformSync(code)

                    file = file.replace('.jsx', '.js').replace('.tsx', '.js')
                    fs.writeFileSync(path.join(process.cwd() + '/dist', file.replace('.jsx', '.js').replace('.tsx', '.js')), code)
                    await Bun.spawn({
                        cmd: [bunPath, 'run', './dev/bundler.js'],
                        cwd: process.cwd(),
                        stdout: 'inherit',
                        env: {
                            ENTRYPOINT: path.join(process.cwd() + '/dist/' + file.replace('.jsx', '.js').replace('.tsx', '.js')),
                            ROOT: process.cwd() + '/app/',
                            OUT: path.dirname(file),
                            shouldReplace: true,
                            file: process.cwd() + '/dist/' + file.replace('.jsx', '.js').replace('.tsx', '.js'),
                            DEV: mode === 'development',
                            size: code.length / 1024,
                            filePath: file.replace('.jsx', '.js'),
                            isTs: file.includes('.tsx'),
                            INPUT: path.join(process.cwd(), file.replace('.js', '.jsx').replace('.tsx', '.js')),
                        },
                        onExit({ exitCode: code }) {
                            if (code === 0) {
                                resolve()
                            } else {
                                reject()
                            }
                        }
                    })
                } else if (file.includes('.ts')) {
                    let code = await Bun.file(file).text()
                    code = handleReplacements(code)
                    file = file.replace('.ts', '.js')
                    fs.writeFileSync(path.join(process.cwd() + '/dist', file.replace('.ts', '.js')), code)
                    await Bun.spawn({
                        cmd: [bunPath, 'run', './dev/bundler.js'],
                        cwd: process.cwd(),
                        stdout: 'inherit',
                        env: {
                            ENTRYPOINT: path.join(process.cwd() + '/dist/' + file.replace('.ts', '.js')),
                            ROOT: process.cwd() + '/app/',
                            OUT: path.dirname(file),
                            file: process.cwd() + '/dist/' + file.replace('.ts', '.js'),
                            DEV: mode === 'development',
                            isTS: true,
                            size: code.length / 1024,
                            filePath: file.replace('.ts', '.js'),
                            INPUT: path.join(process.cwd(), file.replace('.js', '.jsx')),
                        },
                        onExit({ exitCode: code }) {
                            if (code === 0) {
                                resolve()
                            } else {
                                reject()
                            }
                        }
                    })
                }

            }

            resolve()
        } catch (error) {
            reject(error)
        }
    })
}
globalThis.clients = []

if (mode === 'development') {
    try {
        await generateApp()
        await handleFiles()
        let watcher;
        let isBuilding = false;
        let debounceTimeout;

        const startWatcher = () => {
            if (watcher) watcher.close(); // Close any existing watcher

            watcher = fs.watch(path.join(process.cwd(), '/'), { recursive: true }, (eventType, file) => {
                if (!file) return; // Ensure file name is valid
                if (file.includes('node_modules')) return;
                if (file.includes('dist')) return;
                if (!fs.existsSync(path.join(process.cwd(), file)) && fs.existsSync(path.join(process.cwd(), "dist", file))) {
                    fs.rmSync(path.join(process.cwd(), "dist", file))
                }

                if (
                    file.endsWith('.tsx') || file.endsWith('.jsx') || file.endsWith('.css') || file.endsWith('.ts')
                ) {
                    // Reset config if needed
                    if (file.endsWith('vader.config.ts')) {
                        delete require.cache[require.resolve(process.cwd() + '/vader.config.ts')];
                        globalThis.config = require(process.cwd() + '/vader.config.ts').default;
                    }

                    clearTimeout(debounceTimeout);
                    debounceTimeout = setTimeout(async () => {
                        if (!isBuilding) {
                            isBuilding = true;
                            try {
                                await generateApp();
                                await handleFiles();
                                setTimeout(() => {
                                    clients.forEach(c => c.send('reload'));
                                }, 1000);
                            } catch (error) {
                                console.error(error);
                            } finally {
                                isBuilding = false;
                            }
                        }
                    }, 500);
                }

                // Restart watcher if a new directory is created
                if (eventType === 'rename') {
                    setTimeout(startWatcher, 500); // Slight delay to allow the OS to recognize new files
                }
            });
        };

        // Start the watcher and restart it periodically
        setInterval(startWatcher, 500);
        startWatcher(); // Run initially
    } catch (error) {
        console.error(error)
    }

}
else if (mode == 'production') {
    await handleFiles()
    await generateApp()

    console.log(`Build complete in ${Date.now() - start}ms at ${new Date().toLocaleTimeString()}`);
}
else {
    if (isBuilding) console.log(`Build complete in ${Date.now() - start}ms at ${new Date().toLocaleTimeString()}`);

}

if (mode == 'development' || mode == 'serve') {
    let server = Bun.serve({
        port: port || 8080,
        websocket: {
            open(ws) {
                globalThis.clients.push(ws)
                ws.send('Connected')
            },
            message(ws, message) {
                globalThis.clients.forEach(c => {
                    c.send(message)
                })
            },

        },
        async fetch(req, res) {
            if (res.upgrade(req)) {
                return new Response('Upgraded', { status: 101 })
            }

            let url = new URL(req.url)
            if (url.pathname.includes('.')) {
                let p = url.pathname.replaceAll("%5B", "[").replaceAll("%5D", "]")
                let file = await Bun.file(path.join(process.cwd() + '/dist' + p))
                if (!await file.exists()) return new Response(`
                    <h1>Whoops You hit a roadblock </h1>
                    `, { status: 404, headers: {
                    'Content-Type': 'text/html'
                } })
                let imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp', 'image/tiff', 'image/bmp', 'image/ico', 'image/cur', 'image/jxr', 'image/jpg']

                return new Response(imageTypes.includes(file.type) ? await file.arrayBuffer() : await file.text(), {
                    headers: {
                        'Content-Type': file.type,
                        'Cache-Control': imageTypes.includes(file.type) ? 'max-age=31536000' : 'no-cache',
                        'Access-Control-Allow-Origin': '*'
                    }
                })
            }
            let router = new Bun.FileSystemRouter({
                dir: process.cwd() + '/app',
                style: 'nextjs'
            })
            router.reload()
            let route = router.match(url.pathname)
            if (!route) {
                return new Response('Not found', { status: 404 })
            }
            let p = route.pathname;
            let base = path.dirname(route.filePath)
            base = base.replace(/\\/g, '/')
            base = base.replace(path.join(process.cwd() + '/app').replace(/\\/g, '/'), '')
            base = base.replace(/\\/g, '/').replace('/app', '/dist')
            base = process.cwd() + "/dist/" + base
            if (!fs.existsSync(path.join(base, 'index.html'))) {
                return new Response(`
                <html>
                <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0"> 
                <meta http-equiv="refresh" content="5">
                </head>
                <body>
                 <p>Rerouting to display changes from server</p>
                </body>    
                `, {
                    headers: {
                        'Content-Type': 'text/html',
                        'Cache-Control': 'no-cache'
                    }
                })
            }
            let data = await Bun.file(path.join(base, 'index.html')).text()
            if (mode == "development") {
                return new Response(data + `
            <script>
            let ws = new WebSocket(\`\${location.protocol === 'https:' ? 'wss' : 'ws'}://\${location.host}\`)
            ws.onmessage = (e) => {
                if(e.data === 'reload'){
                    console.log('Reloading to display changes from server')
                    window.location.reload()
                }
            }
            ws.onopen = () => {
                console.log('Connected to hmr server')
            }
            
            ws.onclose = () => {
                // try to reconnect
                 console.log('Reconnecting to hmr server')
                 ws = new WebSocket(\`\${location.protocol === 'https:' ? 'wss' : 'ws'}://\${location.host}\`)    
            }
            
            </script>
            `, {
                    headers: {
                        'Content-Type': 'text/html'
                    }
                })
            } else {
                return new Response(data, {
                    headers: {
                        'Content-Type': 'text/html'
                    }
                })
            }

        }
    })

    console.log(ansiColors.green('Server started at http://localhost:' + port || 8080))
}
