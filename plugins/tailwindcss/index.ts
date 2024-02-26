//@ts-nocheck
function checkIFtailwindInstalled() {
    try {
      require.resolve('tailwindcss');
      return true;
    } catch (e) {
      return false;
    }
  }
  
  
  export default {
      name: "tailwind",
      description: "A plugin to install tailwindcss",
      once: true,
      init: async () => {
          let config = require(process.cwd() + "/vader.config.js").default;
          const fs = require("fs");
          const path = require("path");
          const { exec} = require("child_process");
          const tailwindConfig = `
          /** @type {import('tailwindcss').Config} */
          module.exports = {
            content: ['./src/**/*.{jsx,tsx,js,ts}', './pages/**/*.{jsx,tsx,js,ts}', './components/**/*.{jsx,tsx,js,ts}'],
            theme: {
              ${
                  config?.tailwind?.theme ? JSON.stringify(config.tailwind.theme, null, 2) : ``
              }
              },
            plugins: [
               ${
                  config?.tailwind?.plugins ? config?.tailwind?.plugins.map((plugin) => {
                      return `require('${plugin}')`
                  }).join(",") : ``
               }
            ]
          }
          `;
          fs.writeFileSync(
              path.join(process.cwd(), "tailwind.config.js"),
              tailwindConfig
          );
          if (!checkIFtailwindInstalled()) {  
              console.log(`\x1b[36mwait \x1b[0m  -  installing tailwindcss  & ${config?.tailwind?.plugins ? config?.tailwind?.plugins.length + " plugins" : ""} (First time only)`);
              let npmPath = process.platform === "win32" ? "npm.cmd" : "npm";
              Bun.spawnSync({
                  cmd: [npmPath, "install", "tailwindcss", "postcss", "autoprefixer" , ...config?.tailwind?.plugins || []],
                  cwd:  process.cwd(),  
                  stderr: "inherit",
              })
              console.log(`\x1b[32msuccess \x1b[0m  - tailwindcss installed`)
               
  
              const postcssConfig = `
              module.exports = {
                  plugins: {
                    tailwindcss: {},
                    autoprefixer: {},
                  },
                }
              `;
              fs.mkdirSync(path.join(process.cwd(), "src/public/styles"), {
                  recursive: true,
              });
              fs.writeFileSync(
                  path.join(process.cwd(), "src/public/styles/tailwind.css"),
                  `@import 'tailwindcss/base'; @import 'tailwindcss/components'; @import 'tailwindcss/utilities';`
              );
              fs.writeFileSync(
                  path.join(process.cwd(), "postcss.config.js"),
                  postcssConfig
              ); 
          }
  
          if(!fs.existsSync(path.join(process.cwd(), "src/public/styles/tailwind.css"))){
              fs.mkdirSync(path.join(process.cwd(), "src/public/styles"), {
                  recursive: true,
              });
              fs.writeFileSync(
                  path.join(process.cwd(), "src/public/styles/tailwind.css"),
                  `@import 'tailwindcss/base'; @import 'tailwindcss/components'; @import 'tailwindcss/utilities';`
              );
          }
  
          let cmd = process.platform === "win32" ? "npx.cmd" : "npx";
          Bun.spawn({
              cmd: [ cmd, "tailwindcss", process.cwd() + '/tailwind.config.js' ,  "-i", "src/public/styles/tailwind.css", "-o", config?.tailwind?.output || "public/styles/tailwind.css", "--minify"],
              cwd: process.cwd(),
              stdin: "inherit",
              stderr: "inherit",
          });
      },
  }