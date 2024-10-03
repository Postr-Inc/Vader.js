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
    if (!fs.existsSync(tailwindConfig)) {
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
    onBuildFinish: async (vader) => {
        if (!checkIfTailwindInstalled()) {
            console.error('TailwindCSS is not installed. Please install it using `bun install tailwindcss`')
            process.exit(1)
        }else{
           initTailwind()
           vader.onFileChange('tailwind.config.js', async () => {
                console.log('Rebuilding TailwindCSS...')
                await vader.runCommand(['bun', 'run', 'tailwindcss', 'build', '-o', 'public/styles.css'])
                console.log('TailwindCSS rebuilt successfully!')
           }) 
           vader.runCommand(['bun', 'run', 'tailwindcss', 'build', '-o', 'public/styles.css'])
        }
    },

}
