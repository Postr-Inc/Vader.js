//@ts-nocheck
import fs from 'fs'
import path from 'path'
function checkIfTailwindInstalled() {
    try {
        //@ts-ignore
        require.resolve('tailwindcss')
        return true
    } catch (e) {
        return false
    }
}

function initTailwind() { 
    const tailwindConfig = path.resolve(process.cwd(), 'tailwind.config.js')
    const postcssConfig = path.resolve(process.cwd(), 'postcss.config.js')
    if (!fs.existsSync(tailwindConfig)) {
        fs.writeFileSync(postcssConfig, `module.exports = {
            plugins: {
              tailwindcss: {},  
              autoprefixer: {},
              }
              }`)

        fs.writeFileSync(tailwindConfig, `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,js,jsx,ts,tsx}', './app/**/*.{html,js,jsx,ts,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
}`) 

}

}


export default {
    name: 'tailwindcss',
    description: 'TailwindCSS plugin for Vader.js',
    version: '0.0.1',
    onBuildStart: async (vader) => {
        if (!checkIfTailwindInstalled()) {
            console.error('TailwindCSS is not installed. Please install it using `bun install  tailwindcss postcss-cli autoprefixer`')
            process.exit(1)
        }else{
           initTailwind()
           
           vader.onFileChange('tailwind.config.js', async () => {
                console.log('Rebuilding TailwindCSS...')
                await vader.runCommand(['bun', 'run', 'postcss',  './public/styles.css', '-o', 'dist/public/tailwind.css'])
                console.log('TailwindCSS rebuilt successfully!')
           }) 
           await vader.runCommand(['bun', 'run', 'postcss', './public/styles.css', '-o', 'dist/public/tailwind.css']) 
           vader.injectHTML(`<style>${fs.readFileSync(path.resolve(process.cwd(), 'dist/public/tailwind.css'))}</style>`)
        }  
        
    },
    onBuildFinish: async (vader) => {
        console.log('TailwindCSS plugin finished building')
    },

}
