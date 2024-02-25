let {watchDir} = await import(process.cwd() + '/node_modules/vaderjs/binaries/watcher/hmr.js').then((res) => res)
let { Compile } = await import(process.cwd() + '/node_modules/vaderjs/binaries/compiler/main.js').then((res) => res).catch(() => {})
 
let config = await import(process.cwd() + '/vader.config.ts').then((res) => res.default).catch(() => {}) 
 
let Router = await import(process.cwd() + '/node_modules/vaderjs/router/index.ts').then((res) => res.default).catch(() => {})
globalThis.Vader = {
    version: '1.4.2'
}  
const colours = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    dim: "\x1b[2m",
    underscore: "\x1b[4m",
    blink: "\x1b[5m",
    reverse: "\x1b[7m",
    hidden: "\x1b[8m",
    
    fg: {
        black: "\x1b[30m",
        red: "\x1b[31m",
        green: "\x1b[32m",
        yellow: "\x1b[33m",
        blue: "\x1b[34m",
        magenta: "\x1b[35m",
        cyan: "\x1b[36m",
        white: "\x1b[37m",
        gray: "\x1b[90m",
        crimson: "\x1b[38m" // Scarlet
    },
    bg: {
        black: "\x1b[40m",
        red: "\x1b[41m",
        green: "\x1b[42m",
        yellow: "\x1b[43m",
        blue: "\x1b[44m",
        magenta: "\x1b[45m",
        cyan: "\x1b[46m",
        white: "\x1b[47m",
        gray: "\x1b[100m",
        crimson: "\x1b[48m"
    }
}; 
function log(){
    console.log(`
Vaderjs v${globalThis.Vader.version} 🚀
Command: ${colours.fg.green} ${mode}${colours.reset}
${colours.fg.cyan}SSR Enabled: ${colours.fg.green} ${config?.env?.SSR}${colours.reset}
${colours.fg.cyan}Prerendering Enabled: ${colours.fg.green} ${config?.plugins?.find((plugin) => plugin.name.includes('SSG')) 
&& !config?.plugins?.find((plugin) => plugin.type === 'SSR') ? 'true' : 'false'}${colours.reset} 
    `) 
}
let mode = process.argv[2] 
switch(mode){
    case 'build':
        log()
            await Compile()  
            process.exit(0)
   case 'start':  
    log()
    process.env.mode  = "production"
    Router.init()
    break
    default:
       
 log()
console.log('\x1b[33m%s\x1b[0m', 'Initializing...')
 
watchDir(process.cwd(), mode, config, colours)
 
        break;
} 
 
 