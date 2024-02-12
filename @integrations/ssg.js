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
   
  let { path, file, isParam, params, query, pathname } = routeData;
  let baseFolder =  file.split('/').filter(f => f !== 'dist').join('/')
  if (file.includes('./dist')) {
    baseFolder = file.split('./dist')[1]
  }

  let isCatchAll = false;

  let html = `
<!DOCTYPE html>
  <html>
   <head> 
   
<title>Vaderjs v1.3.3</title>
<meta name="description" content="Vader.js is a modern web framework for building web applications.">
<link rel="shortcut icon" href="https://raw.githubusercontent.com/Postr-Inc/Vader.js/main/logo.png" type="image/x-icon">
   </head>
   <body>
   <script id="v">
   window.$SERVER = true
   </script>
   <div id="app"></div>
   <script id="router" type="module">
    import Router from '/router.js' 
    
    const rt = new Router
    ${Array.isArray(params)
      ? params
        .map((param) => {
          if (!param.jsFile) return "";
          let ranName = Math.random()
            .toString(36)
            .substring(7)
            .replace(".", "");
          let pd = Object.keys(param.paramData)[0];
          let baseFolder = path
            .split("/")
            .filter((f) => f !== "pages")
            .join("/");
             
         if(pd === '$catchall'){
            isCatchAll = true;
            console.log('catchall')
            return `
            import c${ranName} from '${param.jsFile}'
            rt.get($SERVER ? '/' : '/${baseFolder}/*', c${ranName})
            `
         }

          return ` 
          
      import c${ranName} from '${param.jsFile}'
      rt.get('/${baseFolder}/:${pd}', c${ranName})
      `;
        })
        .join("")
      : ""
    }
    let c = await import('${baseFolder}')  
    if(Object.keys(c).includes('$prerender') && c.$prerender === false){
      document.head.setAttribute('prerender', 'false')
    }
    ${
      !isCatchAll ? `rt.get($SERVER? '/' : '${pathname}', c)` : ``
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
    let routes = JSON.parse(fs.readFileSync(`${process.cwd()}/_dev/meta/routes.json`).toString())
    for (var i in routes) {
      let route = routes[i];
       
      if(route.path.includes('[')){
         continue
      }
      let html = generateHTML(route);
      globalThis.routeDocuments[routes[i].path] = html;
      let browser = await playwright.chromium.launch({
        headless: true,
        executablePath: process.platform === 'win32' ? '' : '/usr/bin/chromium-browser'
      });
      globalThis.browser = browser;
      let page = await browser.newPage();
      await page.goto(`http://localhost:8700?folder=${routes[i].path}`);
      await page.evaluate(() => {
        document.querySelector('script#v').innerHTML = `window.$SERVER = false`
        if(document.head.getAttribute('prerender') === 'false'){
          document.querySelector("#app").innerHTML = "";
        }
      });
      let content = await page.content();
      console.log(`Writing ${routes[i].path} to ${output}/${routes[i].path}/index.html`)
      if (output.includes('./dist')) {
        output = output.split('./dist')[1]
      }
      let path = '/dist/' + output  + routes[i].path + '/index.html';
      fs.writeFileSync(process.cwd() + path, content)
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
  on: ['build', 'dev:change'],
}


