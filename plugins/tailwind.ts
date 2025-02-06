//@ts-nocheck
import fs from 'fs'
import path from 'path'
function checkIfTailwindInstalled() {
    try {
        //@ts-ignore
        require.resolve('tailwindcss')
        require.resolve('postcss')
        return true
    } catch (e) {
        return false
    }
}

function initTailwind() {  
    const postcssConfig = path.resolve(process.cwd(), 'postcss.config.mjs')
    const tailwindCssFile = path.join(process.cwd(), '/public/styles.css')
    if(!fs.existsSync(tailwindCssFile)){
        fs.writeFileSync(tailwindCssFile, `@import "tailwindcss"`)
    }
    if (!fs.existsSync(postcssConfig)) {
        fs.writeFileSync(postcssConfig, `export default {  plugins: {    "@tailwindcss/postcss": {},  }}`)

    }

}


export default {
    name: 'tailwindcss',
    description: 'TailwindCSS plugin for Vader.js',
    version: '0.0.2',
    onBuildStart: async (vader) => {
        if (!checkIfTailwindInstalled()) {
            console.error('TailwindCSS is not installed. Please install it using `bun  install tailwindcss @tailwindcss/postcss postcss-cli`\n more info: https://tailwindcss.com/docs/installation/using-postcss`')
            process.exit(1)
        }else{
           initTailwind()
           console.log('Building TailwindCSS...')
           await vader.runCommand(['bun', 'run', 'postcss', './public/styles.css', '-o', 'dist/public/tailwind.css']) 
           vader.injectHTML(`<link rel="stylesheet" href="/public/tailwind.css">`) 

        }  
        
        return
    },
    onBuildFinish: async (vader) => {
        console.log('TailwindCSS plugin finished building')
    },

}
