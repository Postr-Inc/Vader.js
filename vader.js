#!/usr/bin/env node
import { exec } from "child_process";
import fs from "fs";
globalThis.currentCommand = null;
globalThis.isRunning = false;
let vaderisInstalled = process.cwd() + "/node_modules/vaderjs/binaries/main.js";
if (!fs.existsSync(process.cwd() + "/_dev")) {
  fs.mkdirSync(process.cwd() + "/_dev");
  !fs.existsSync(process.cwd() + "/_dev/readme.md") && fs.writeFileSync(process.cwd() + "/_dev/readme.md", `This folder is used by vader.js to store important files, deletables include: Bun, Chrome - These should only be uninstalled if you need to reinstall them.`);
}

if (!fs.existsSync(process.cwd() + "/_dev/vader.js")) {
  console.log("Copying vader to dev folder....");
  fs.copyFileSync(vaderisInstalled, process.cwd() + "/_dev/vader.js");
}

function checkIFBundleIsInstalled() {
  if (fs.existsSync(process.cwd() + "/_dev/bun")) {
    return new Promise((resolve, reject) => {
      resolve(true);
    });
  }
  return new Promise((resolve, reject) => {
    exec("bun -v", (err, stdout, stderr) => {
      if (err) {
        reject(err);
      }
      if (stdout) {
        resolve(`Bun.js is installed: ${stdout}`);
      }
      if (stderr) {
        reject(`Bun.js is not installed: ${stderr}`);
      }
    });
  });
}

function run() {
  if (!fs.existsSync(process.cwd() + "/package.json")) {
    fs.writeFileSync(process.cwd() + "/package.json", JSON.stringify({ name: "my_app", version: "1.0.0" }, null, 2));
    return;
  }
  let packageJson = JSON.parse(fs.readFileSync(process.cwd() + "/package.json").toString());
  if (!packageJson.scripts) {
    packageJson.scripts = {};
  }
  packageJson.scripts["dev"] = "bun run ./_dev/vader.js dev";
  packageJson.scripts["build"] = "bun run ./_dev/vader.js build";
  packageJson.scripts["start"] = "bun run ./_dev/vader.js start";
  if (!packageJson.dependencies) {
    packageJson.dependencies = {};
  }
  fs.writeFileSync(process.cwd() + "/package.json", JSON.stringify(packageJson, null, 2));

  if (currentCommand) {
    let child = exec(currentCommand);
    child.stdout.pipe(process.stdout);
    child.stderr.pipe(process.stderr);
    child.on("exit", (code) => {
      process.exit(code);
    });
    child.on("message", (message) => {
      console.log(message.toString());
    });
    child.on("error", (err) => {
      console.error(err);
    });

    return;
  }

  console.log(` 
  Vader.js is a reactive framework for building interactive applications for the web built ontop of bun.js!
            
  Usage: npx vaderjs <command> 
            
   Commands:
        
   vaderjs run dev  -p <number>    Start the development server
            
   vaderjs run build   Build the project to ./dist
            
   vaderjs run start  -p <number>  Production Mode (default 3000 or process.env.PORT)
              
   Learn more about vader:      https://vader-js.pages.dev/
                
   `);
}

function checkIFChromeIumIsInstalled() {
  let platform = process.platform;
  let findChrome = {
    windows: `powershell -c "${process.cwd() + "\\node_modules\\vaderjs\\binaries\\win32\\check.ps1"}"`,
    others: "/usr/bin/chromium-browser --version",
  };
  let installCommands = {
    windows: `winget install Google.Chrome`,
    others: "sudo apt-get install chromium-browser -y",
  };
  findChrome.windows = findChrome.windows.replace(/\n/g, " ");
  let commandToRun = platform === "win32" ? findChrome.windows : findChrome.others;

  return new Promise((resolve, reject) => {
    if (fs.existsSync(process.cwd() + "/_dev/chrome")) {
      resolve(true);
    } else {
      exec(commandToRun, (err, stdout, stderr) => {
        let hasError = false;
        if (err) {
          console.log(err);
          hasError = true;
          console.log(`Attempting to install DEPENDENCY: ${platform === "win32" ? "Google Chrome" : "Chromium"}`);
        }
        if (stdout && !hasError) {
          resolve(`${platform === "win32" ? "Google Chrome" : "Chromium"} is installed: ${stdout}`);
          fs.writeFileSync(process.cwd() + "/_dev/chrome", `Installed: ${stdout}`);
        }
        if (stderr) {
          console.log(stderr);
          console.log(`Installing DEPENDENCY: ${platform === "win32" ? "Google Chrome" : "Chromium"}`);
          let installCommand = platform === "win32" ? installCommands.windows : installCommands.others;
          return new Promise((resolve, reject) => {
            exec(installCommand, (err, stdout, stderr) => {
              if (err) {
                reject(err);
              }
              if (stdout) {
                resolve(`${platform === "win32" ? "Google Chrome" : "Chromium"} installed successfully: ${stdout}`);
                fs.writeFileSync(process.cwd() + "/_dev/chrome", `Installed: ${stdout}`);
                run();
              }
              if (stderr) {
                reject(`${platform === "win32" ? "Google Chrome" : "Chromium"} failed to install: ${stderr}`);
              }
            });
          });
        }
      });
    }
  });
}
let Commands = {
  dev: `bun run dev`,
  build: `bun run build`,
  start: `bun run start`,
};
let port = process.argv.includes("-p") || process.argv.includes("--port") ? process.argv[process.argv.indexOf("-p") + 1] || process.argv[process.argv.indexOf("--port") + 1] || process.env.PORT || 3000 : process.env.PORT || 3000;
switch (true) {
  case process.argv.includes("dev") && !process.argv.includes("build") && !process.argv.includes("start"):
    currentCommand = Commands.dev + (port ? ` -p ${port}` : "");
    break;
  case process.argv.includes("build") && !process.argv.includes("dev") && !process.argv.includes("start"):
    currentCommand = Commands.build + (port ? ` -p ${port}` : "");
    break;
  case process.argv.includes("start") && !process.argv.includes("dev") && !process.argv.includes("build"):
    currentCommand = Commands.start + (port ? ` -p ${port}` : "");
    break;
  default:
    currentCommand = null;
    break;
}
checkIFChromeIumIsInstalled()
  .then((stdout) => {
    if (stdout) {
      checkIFBundleIsInstalled()
        .then((stdout) => {
          if (stdout && !isRunning) {
            if (!fs.existsSync(process.cwd() + "/_dev/bun")) {
              fs.writeFileSync(process.cwd() + "/_dev/bun", `Installed: ${stdout}`);
            }
            run();
            globalThis.isRunning = true;
          }
        })
        .catch(async (err) => {
          console.log("Bun.js is not installed. Installing....");
          let installScipt = {
            windows: 'powershell -c "irm bun.sh/install.ps1|iex',
            others: "curl -fsSL https://bun.sh/install.sh | bash",
          };
          let scriptotRun = process.platform === "win32" ? installScipt.windows : installScipt.others;
          exec(scriptotRun, async (err, stdout, stderr) => {
            if (err) {
              console.log("Error installing bun.js");
              process.exit(1);
            }
            if (stdout) {
              if (!process.platform === "win32") {
                await new Promise((resolve, reject) => {
                  console.log(`Adding bun.js to path...`);
                  let shell = null;
                  exec("source ~/.bashrc", (err, stdout, stderr) => {
                    if (err) {
                      console.log("Error installing bun.js");
                      return;
                    }
                    if (stdout) {
                      run();
                    }
                    if (stderr) {
                      console.log("Error installing bun.js");
                      process.exit(1);
                    }
                  });
                });
                exec("chmod +x bun.sh/install.sh", (err, stdout, stderr) => {
                  if (err) {
                    console.log("Error installing bun.js");
                    return;
                  }
                  if (stdout) {
                    console.log("Bun.js installed successfully");
                    run();
                  }
                  if (stderr) {
                    console.log("Error installing bun.js");
                    process.exit(1);
                  }
                });
              }
              run();
            }
          });
        });
    }
  })
  .catch(async (err) => {
    console.error(err);
    process.exit(1);
  });
