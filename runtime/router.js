import{Component}from"./vader.js";let middlewares=[],lastSavedWorkingRoutes=()=>JSON.parse(localStorage.getItem("lastSavedWorkingRoutes"))||[];localStorage.setItem("routes",JSON.stringify(routes)),!localStorage.getItem("lastSavedWorkingRoutes")&&localStorage.setItem("lastSavedWorkingRoutes",JSON.stringify([]));class VaderRouter{constructor(e,t){this.routes=[],this.middlewares=[],this.errorMiddlewares=[],this.listeners=[],this.basePath=e}get(e,t){this.routes.push({path:e,handler:t,method:"get"})}use(e){this.middlewares.push(e)}matchingRoute(){return routes.find((e=>e.url===window.location.pathname||window.location.pathname.split("/")[1]===e.url.split("/")[1]||void 0))}reoderRoutes(){let e=JSON.parse(localStorage.getItem("routes")),t=[],o=lastSavedWorkingRoutes();e.forEach((e=>{o.includes(e.url)&&t.push(e.url)})),localStorage.setItem("lastSavedWorkingRoutes",JSON.stringify(t))}listen(e,t){if(e||(e=Math.random().toString(36).substring(7)),window.onpopstate=async e=>{let t=window.location.pathname;this.reoderRoutes();let o=`/${t.split("/")[1]}`;if(this.checkroute(t)||window.devMode||this.matchingRoute()||t.includes("undefined")||t.includes("/404")){if(!(t.includes("/404")||window.devMode||lastSavedWorkingRoutes().includes(t)||t.includes("undefined"))){let e=lastSavedWorkingRoutes();e.push(t),console.log("r",e),localStorage.setItem("lastSavedWorkingRoutes",JSON.stringify(e))}}else t="/404";let n=(new DOMParser).parseFromString(await fetch(o,{cache:"reload"}).then((e=>e.text())),"text/html").documentElement;document.querySelector("#root").innerHTML=n.querySelector("#root").innerHTML,document.title=n.querySelector("title")?n.querySelector("title").innerHTML:document.title,document.querySelector('script[id="router"]').remove();let s=document.createElement("script");s.id="router",s.innerHTML=n.querySelector('script[id="router"]').innerHTML,s.setAttribute("type","module"),document.body.appendChild(s)},window.rehydrate=async()=>{window.location.reload()},window.history.back=()=>{let e=window.location.pathname,t=lastSavedWorkingRoutes(),o="/404"===e?t.length-1:t.indexOf(e)||0,n=t["/404"===e?o:--o];window.history.pushState({},"",n),window.dispatchEvent(new Event("popstate"))},window.history.forward=()=>{let e=window.location.pathname,t=lastSavedWorkingRoutes(),o="/404"===e?t.length+1:t.indexOf(e)||0,n=t[++o];window.history.pushState({},"",n),window.dispatchEvent(new Event("popstate"))},this.listeners.push(e),1===this.listeners.length){if(this.reoderRoutes(),!0==(!lastSavedWorkingRoutes().includes(window.location.pathname)&&!window.devMode&&"/404"!==window.location.pathname&&void 0!==this.matchingRoute()&&!window.location.pathname.includes("undefined"))){let e=lastSavedWorkingRoutes();e.push(window.location.pathname),localStorage.setItem("lastSavedWorkingRoutes",JSON.stringify(e))}this.handleRoute(window.location.pathname)}else this.listeners.pop();t&&t()}extractParams(e,t){const o=e.split("/").filter((e=>""!==e)),n=t.split("/").filter((e=>""!==e)),s={};return o.forEach(((e,t)=>{if(e.startsWith(":")){const o=e.slice(1);s[o]=n[t]}else if(e.startsWith("*")){n.slice(t).forEach(((e,t)=>{s[t]=e}))}})),s}extractQueryParams(e){const t=e.split("?")[1];if(!t)return{};const o={};return t.split("&").forEach((e=>{const[t,n]=e.split("=");o[t]=n})),o}checkroute(e){return e=e.endsWith("/")?e.slice(0,-1):e,this.routes.find((t=>{if(t.path===e)return!0;if(""===e&&"/"===t.path)return!0;if(e.includes("?")&&(e=e.split("?")[0]),t.path.includes("*")||t.path.includes(":")){const o=t.path.split("/").filter((e=>""!==e)),n=e.split("/").filter((e=>""!==e));if(o.length!==n.length&&!t.path.endsWith("*"))return!1;for(let e=0;e<o.length;e++){const t=o[e],s=n[e];if(!t.startsWith(":")&&!t.startsWith("*")&&t!==s)return!1}return!0}const o=this.extractParams(t.path,e);return Object.keys(o).length>0}))}handleRoute(e){let t=200,o=e,n=this.checkroute(e);n||(n=window.routes.find((e=>!e.url.includes("/404")||this.error||window.devMode?!(this.error||!e.url.includes("/404"))||void 0:(window.history.pushState({},"","/404"),window.dispatchEvent(new Event("popstate")),this.error=!0,!1))),t=n?200:404);const s=this.extractQueryParams(o),r=n&&n.path?this.extractParams(n.path,o):{};Object.keys(r).forEach((e=>{r[e]=r[e].split("?")?r[e].split("?")[0]:r[e]}));const i={headers:{},params:r,query:s,path:e,fileUrl:window.location.href.split(window.location.origin)[1],url:window.location.href,method:n?n.method:"get",pause:!1,timestamp:Date.now()};window.$CURRENT_URL=i.path,window.$FULL_URL=window.location.href.replace("#","");const a={status:t,log:e=>{void 0===e?console.log(`${i.path} ${i.method} ${a.status} ${i.timestamp}`):console.table({"Request Path":i.path,"Request Method":n.method,"Response Status":a.status,"Request Timestamp":i.timestamp})},refresh:()=>{this.handleRoute(window.location.pathname)},redirect:e=>{!e.startsWith("/")&&(e=`/${e}`),window.history.pushState({},"",e),window.dispatchEvent(new Event("popstate"))},render:async(e,t,o,n)=>{function i(e){return"function"==typeof e&&/^class\s/.test(Function.prototype.toString.call(e))}try{let n=new Component;if(i(e.default)){let t=new e.default;n.state=t.state,n=t}else{let i=e.default.toString();n.key=e.default.toString().split('key="')[1]?e.default.toString().split('key="')[1].split('"')[0]:null;let a=i.match(/this\.key\s*=\s*['"]([^'"]+)['"]/);a&&(n.key=a[1]);let l={key:n.key,render:()=>e.default.apply(n,[t,o]),request:t,response:o,params:r,queryParams:s,reset:n.reset.bind(n),onMount:n.onMount.bind(n),useState:null,router:{use:n.router.use.bind(n)},bindMount:n.bindMount.bind(n),memoize:n.memoize.bind(n),createComponent:n.createComponent.bind(n),isChild:!1,useState:n.useState.bind(n),parseStyle:n.parseStyle.bind(n),bind:n.bind.bind(n),useRef:n.useRef.bind(n),useReducer:n.useReducer.bind(n),onMount:n.onMount.bind(n),onUnmount:n.onUnmount.bind(n),hydrate:n.hydrate.bind(n)};n.render=l.render,n=l}if(!document.querySelector("#root"))throw new Error("Root element not found, please add an element with id root");n.reset(),n.components={},n.request=t,n.response=o,n.router.use&&!n.isChild?await new Promise((async s=>{if(i(e.default))if(i(e.default))switch(await n.router.use(t,o),t.pause){case!0:console.log("pausing",t.pause);let e=setInterval((()=>{t.pause?console.log("still pausing",t.pause):(clearInterval(e),s())}),1e3);break;case!1:s()}else s();else switch(await e.default.apply(n,[t,o]),await n.router.use(t,o),t.pause){case!0:let e=setInterval((()=>{t.pause?console.log("still pausing  request",t.url):(clearInterval(e),s())}),1e3);break;case!1:s()}})):n.router.use&&n.isChild&&console.warn("Router.use() is not supported in child components");const a=await n.render();document.querySelector("#root").innerHTML!==a&&(document.querySelector("#root").innerHTML=a),n.bindMount(),n.onMount()}catch(e){console.error(e)}},setQuery:e=>{let t="";Object.keys(e).forEach(((o,n)=>{t+=`${0===n?"?":"&"}${o}=${e[o]}`}));let o=window.location.hash.split("?")[0];t=t.replace("/","-").replaceAll("/","-"),window.location.hash=`${o}${t}`},send:e=>{document.querySelector("#root").innerHTML=e},json:e=>{const t=document.querySelector("#root");t.innerHTML="";const o=document.createElement("pre");o.textContent=JSON.stringify(e,null,2),t.appendChild(o)}};middlewares.forEach((e=>{e(i,a)})),n&&n.handler(i,a)}}window.VaderRouter=VaderRouter;export default VaderRouter;