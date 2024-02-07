#!/usr/bin/env node
import fs from 'fs';
let vaderisInstalled = process.cwd() + '/node_modules/vaderjs/binaries/main.js'
if(!fs.existsSync(process.cwd() +'/_dev')){ 
  fs.mkdirSync(process.cwd() +'/_dev');
}

if(!fs.existsSync(process.cwd() +'/_dev/vader.js')){
    console.log('Copying vader to dev folder....')
    fs.copyFileSync(vaderisInstalled, process.cwd() +'/_dev/vader.js');
}  

let args = process.argv.slice(2);

function run(arg){ 
    if(!fs.existsSync(process.cwd() + '/package.json')){
        fs.writeFileSync(process.cwd() + '/package.json', JSON.stringify({name: 'my_app', version: '1.0.0'}, null, 2));
        return;
    }
    let packageJson = JSON.parse(fs.readFileSync(process.cwd() + '/package.json').toString());
    if(!packageJson.scripts){
        packageJson.scripts = {};
    }
    packageJson.scripts['dev'] = 'bun run ./_dev/vader.js dev';
    packageJson.scripts['build'] = 'bun run ./_dev/vader.js build';
    packageJson.scripts['start'] = 'bun run ./_dev/vader.js start';
    if(!packageJson.dependencies){
        packageJson.dependencies = {};
    }
    fs.writeFileSync(process.cwd() + '/package.json', JSON.stringify(packageJson, null, 2));
    console.log(` 
    Vader.js is a reactive framework for building interactive applications for the web built ontop of bun.js!
        
    Usage: vader <command> 
        
    Commands:
    
       bun run dev  -p <number>    Start the development server
        
       bun run build   Build the project to ./dist
        
       bun run start  -p <number>  Production Mode (default 3000 or process.env.PORT)
          
    Learn more about vader:           https://vader-js.pages.dev/
            
        `) 
}


run()
