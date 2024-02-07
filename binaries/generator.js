import http from "http";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();
import puppeteer from "puppeteer";
import { WebSocketServer } from "ws";
const wss = new WebSocketServer({ port: 3436 });
globalThis.wss = wss;
process.cwd = () => {
    return process.env.PWD;
}
globalThis.routeDocuments = {};
function httpServer(){
  let server = http.createServer((req, res) => {
    if (!req.url.includes(".")) {
      let folder = req.url.split("?")[1].split("=")[1];

      let content  = globalThis.routeDocuments[folder]
      globalThis.wss.clients.forEach((client) => {  
        client.send(JSON.stringify({ type: "server", content }));
      });
       
     
      res.writeHead(200, { "Content-Type": "text/html" });
      
      res.end(content);
    } else {
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
  
  globalThis.server = server;
  server.listen(8700, async () => {
     
    
  });
}
httpServer()
if(!globalThis.browser){
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    executablePath: process.platform === "win32" ? process.env.CHROME_PATH : '/usr/bin/chromium-browser',
  });
  globalThis.browser = browser;
}
wss.on("connection", async function connection(ws) {
  ws.send(JSON.stringify({ type: "connected" }));
  
  ws.on("message", async function incoming(message) {
    
    let data = JSON.parse(message.toString());
    if (data.type === "generate") { ;
      globalThis.wss.clients.forEach((client) => {
        client.send(JSON.stringify({ message: "Generating" }));
      });
      let PWD = data.PWD;
      process.cwd = () => {
        return PWD;
      };
      let params = JSON.parse(data.params);
      let output = data.output;
      let file = data.file;
      
      let folder = data.folder;
      const page = await  browser.newPage();
      let baseFolder = folder
        .split("/")
        .filter((f) => f !== "pages")
        .join("/");
      baseFolder = baseFolder.replace("//", "/");
      globalThis.routeDocuments[folder] = `<!DOCTYPE html>
       
      <html>
      <head>
          <meta charset="UTF-8">
          <title>Document</title>
          <script id="server">
          window.$SERVER = true 
          </script>
      </head>
      <body>
          <div id="app"></div>
          <script type="module" id="router" >
            window.files = window.files || []
            import Router from '/router.js'
            import c from '${file}'
            const rt = new Router
            let module = await import('${file}') 
           if(Object.keys(module).includes('$prerender') && !module.$prerender){
              document.head.setAttribute('prerender', 'false')
            }
            rt.get($SERVER ? '/' : '${baseFolder}', c)
            window.files.push('${file}')
           
            ${
              Array.isArray(params)
                ? params
                    .map((param) => {
                      if (!param.jsFile) return "";
                      let ranName = Math.random()
                        .toString(36)
                        .substring(7)
                        .replace(".", "");
                      let pd = Object.keys(param.paramData)[0];
                      let baseFolder = folder
                        .split("/")
                        .filter((f) => f !== "pages")
                        .join("/");

                      return `
              import c${ranName} from '${param.jsFile}'
              rt.get('${baseFolder}/:${pd}', c${ranName})
              window.files.push('${param.jsFile}')
              `;
                    })
                    .join("")
                : ""
            }
            window.rt = rt
            rt.listen()
          </script>
      </body>
      </html>
      
      `;
      
      server.on("error", (err) => {
        globalThis.wss.clients.forEach((client) => {
          client.send(JSON.stringify({ type: "error", error: err }));
        });
      });
      
      page.on("error", (err) => {
        globalThis.wss.clients.forEach((client) => {
          client.send(JSON.stringify({ type: "error", error: err }));
        });
      });
      page.on("pageerror", (err) => {
        globalThis.wss.clients.forEach((client) => {
          client.send(JSON.stringify({ type: "error", error: err }));
        });
      });
      await page.goto(`http://localhost:8700/?folder=${folder}`, {
        waitUntil: "networkidle2",
      });
      await page.evaluate(() => {
        let server = document.getElementById("server");
        server.innerHTML = "window.$SERVER = false";
        let shouldPrerender = document.head.getAttribute("prerender");
        if (shouldPrerender === "false") {
          document.querySelector("#app").innerHTML = "";
        }
      });
      let html = await page.content();
      if (!fs.existsSync("./dist")) {
        fs.mkdirSync("./dist");
      }
      if (!fs.existsSync("./dist/pages")) {
        fs.mkdirSync("./dist/pages");
      }

      if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder);
      }
      globalThis.wss.clients.forEach((client) => {
        client.send(JSON.stringify({ type: "done", file }));
      });
      fs.writeFileSync(output, html);
      page.close();
    
 
    }else if(data.type === 'done'){
   
      globalThis.browser.close()
      globalThis.server.close()
      
    }
  });
});