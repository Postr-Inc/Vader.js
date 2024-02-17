import fs from 'fs';
import playwright from 'playwright';
globalThis.routeDocuments = {}
let context = process.env.isVader === 'true' ? true : false
/**
 * 
 * @param {Object} config 
 * @param {string} config.pages - The directory where the pages are located
 * @param {string} config.output - The directory where the pages are to be outputted
 */


import http from 'http';
let hasGenerated = []
let server = http.createServer((req, res) => {
  if (!req.url.includes(".")) {
    let params = new URLSearchParams(req.url.split("?")[1]);
    let folder = params.get("folder");

    let content = globalThis.routeDocuments[folder]
    res.writeHead(200, { "Content-Type": "text/html" });

    res.end(content);
  } else {
    if (req.url.includes('./')) {
      req.url = req.url.replace('./', '/')
    }
    const filePath = process.cwd() + "/dist/" + req.url;

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404, {
          "Content-Type": filePath.includes("js")
            ? "text/javascript"
            : "text/html",
        });
        res.end("File not found");
      } else {
        res.writeHead(200, {
          "Content-Type": filePath.includes("js")
            ? "text/javascript"
            : "text/html",
        });
        res.end(data);
      }
    });
  }
});

const generateHTML = (routeData) => {
  console
   
  let { path, file, isParam, params,kind, isCatchAll, query, pathname } = routeData;
 
  let baseFolder =  file.split('/').filter(f => f !== 'dist').join('/')
  if (file.includes('./dist')) {
    baseFolder = file.split('./dist')[1]
  }
 

  let html = `
<!DOCTYPE html>
  <html>
   <head> 
   
<title>Vaderjs v1.3.3</title> 
<script id="v">
   window.$SERVER = true
   </script>
</head>
   <body>
    
   <div id="app"></div>
   <script id="router" type="module">
    import Router from '/router.js' 
    
    const rt = new Router
    ${Object.keys(params).length > 0 ? Object.keys(params).map((param, i) => {
     let first = pathname.split('/')[1]
     first = '/' + first
     let ranName = `_${Math.random().toString(36).substr(2, 9)}`
    return `
    import ${ranName} from '${baseFolder}'
    rt.get($SERVER  ? '/' : '${first}/:${param}', ${ranName})`
    }): ''}

    let c = await import('${baseFolder}')
    if(Object.keys(c).includes('$prerender') && c.$prerender === false){
      document.head.setAttribute('prerender', 'false')
    }

    ${
      !isCatchAll && !pathname.includes('[')  ? `rt.get($SERVER  ? '/' : '${pathname}', c)` : isCatchAll &&  !pathname.includes('[')  ? `rt.get($SERVER ? '/' : '${pathname}/*', c)` : ``
    }
   
     
    rt.listen()
   </script>
   </body>
  </html>`
  return html;

}
/**
 * @integration Server Side Generator
 * @description Generate a static webapp from your Vader.js application
 * @returns 
 */

 
const ssg = async (config) => {
  return new Promise(async (resolve, reject) => {
    let { pages, output } = config;
    if(!fs.existsSync(`${process.cwd()}/_dev/meta/routes.json`)){
      process.exit()
    }
    let routes = JSON.parse(fs.readFileSync(`${process.cwd()}/_dev/meta/routes.json`).toString())
    for (var i in routes) {
      let route = routes[i]; 
      
     
      let html = generateHTML(route);
      globalThis.routeDocuments[routes[i].path] = html;
      let browser = await playwright.chromium.launch({
        headless: true,
        executablePath: process.platform === 'win32' ? '' : '/usr/bin/chromium-browser'
      });
      globalThis.browser = browser;
      let page = await browser.newPage();
      await page.goto(`http://localhost:8700?folder=${routes[i].path}`, { waitUntil: 'load' });
      await page.evaluate(() => {
        document.querySelector('script#v').innerHTML = `window.$SERVER = false`
        if(document.head.getAttribute('prerender') === 'false'){
          document.querySelector("#app").innerHTML = "";
        }
      });
      let content = await page.content(); 
      if (output.includes('./dist')) {
        output = output.split('./dist')[1]
      }  
    
      if(routes[i].path.includes('[')){
        routes[i].path = routes[i].path.split('[')[0]
      }else if(routes[i].path.includes(':')){
        routes[i].path = routes[i].path.split(':')[0]
      }
      let path = '/dist/' + output  + routes[i].path + '/index.html';

      fs.writeFileSync(process.cwd() + path,   content);
      hasGenerated.push(routes[i].path)
    }

    if (hasGenerated.length === routes.length) {
      console.log(`Static site generation complete`)
      browser.close()
      server.close()
      resolve() 
      process.exit()
    }
  })
} 

if(context){
   

server.listen(8700);
await ssg({ pages: './pages', output: './dist' })
}
export default {
  name: 'Vaderjs Static Site Generator',
  version: '1.0.0',
  useRuntime: 'node',
  entryPoint: process.cwd() + '/node_modules/vaderjs/@integrations/ssg.js',
  on: ['build', 'dev'],
}


// Path:integrations/ssg.js