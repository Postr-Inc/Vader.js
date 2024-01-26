import{Component}from"./vader.js";let middlewares=[];class VaderRouter{constructor(e,t){this.routes=[],this.middlewares=[],this.errorMiddlewares=[],this.listeners=[],this.basePath=e}get(e,t){this.routes.push({path:e,handler:t,method:"get"})}use(e){this.middlewares.push(e)}listen(e,t){e||(e=Math.random().toString(36).substring(7)),this.listeners.push(e),1===this.listeners.length?this.handleRoute(window.location.pathname):this.listeners.pop(),t&&t(),window.onpopstate=async e=>{let t=window.location.pathname,r=`/${t.split("/")[1]}`;this.checkroute(t)||(t="/404");let s=(new DOMParser).parseFromString(await fetch(r,{cache:"reload"}).then((e=>e.text())),"text/html").documentElement;document.querySelector("#root").innerHTML=s.querySelector("#root").innerHTML,document.title=s.querySelector("title").innerHTML,document.querySelector('script[id="router"]').remove();let n=document.createElement("script");n.id="router",n.innerHTML=s.querySelector('script[id="router"]').innerHTML,n.setAttribute("type","module"),document.body.appendChild(n)}}extractParams(e,t){const r=e.split("/").filter((e=>""!==e)),s=t.split("/").filter((e=>""!==e)),n={};return r.forEach(((e,t)=>{if(e.startsWith(":")){const r=e.slice(1);n[r]=s[t]}else if(e.startsWith("*")){s.slice(t).forEach(((e,t)=>{n[t]=e}))}})),n}extractQueryParams(e){const t=e.split("?")[1];if(!t)return{};const r={};return t.split("&").forEach((e=>{const[t,s]=e.split("=");r[t]=s})),r}checkroute(e){return this.routes.find((t=>{if(t.path===e)return!0;if(""===e&&"/"===t.path)return!0;if(e.includes("?")&&(e=e.split("?")[0]),t.path.includes("*")||t.path.includes(":")){const r=t.path.split("/").filter((e=>""!==e)),s=e.split("/").filter((e=>""!==e));if(r.length!==s.length&&!t.path.endsWith("*"))return!1;for(let e=0;e<r.length;e++){const t=r[e],n=s[e];if(!t.startsWith(":")&&!t.startsWith("*")&&t!==n)return!1}return!0}const r=this.extractParams(t.path,e);return Object.keys(r).length>0}))}handleRoute(e){let t=200,r=e,s=this.checkroute(e);s||(s=window.routes.find((e=>e.url.includes("/404")&&!this.error?(this.error=!0,!0):!(this.error||!e.url.includes("/404"))||void 0)),t=s?200:404);const n=this.extractQueryParams(r),o=s&&s.path?this.extractParams(s.path,r):{};Object.keys(o).forEach((e=>{o[e]=o[e].split("?")?o[e].split("?")[0]:o[e]}));const i={headers:{},params:o,query:n,path:e,fileUrl:window.location.href.split(window.location.origin)[1],url:window.location.href,method:s?s.method:"get",pause:!1,timestamp:Date.now()};window.$CURRENT_URL=i.path,window.$FULL_URL=window.location.href.replace("#","");const a={status:t,log:e=>{void 0===e?console.log(`${i.path} ${i.method} ${a.status} ${i.timestamp}`):console.table({"Request Path":i.path,"Request Method":s.method,"Response Status":a.status,"Request Timestamp":i.timestamp})},refresh:()=>{this.handleRoute(window.location.pathname)},redirect:e=>{!e.startsWith("/")&&(e=`/${e}`),window.history.pushState({},"",e),window.dispatchEvent(new Event("popstate"))},render:async(e,t,r,s)=>{function isClass(e){return"function"==typeof e&&/^class\s/.test(Function.prototype.toString.call(e))}try{let s=new Component;if(isClass(e.default)){let t=new e.default;s.state=t.state,s=t}else{if(e.default.toString().includes("this.key"))throw new Error('Using this.key is not supported in functional components use the attribute key="a value" instead');s.key=e.default.toString().split('key="')[1]?e.default.toString().split('key="')[1].split('"')[0]:null;let i={key:s.key,render:()=>e.default.apply(s,[t,r]),request:t,response:r,params:o,queryParams:n,reset:s.reset.bind(s),onMount:s.onMount.bind(s),useState:null,router:{use:s.router.use.bind(s)},bindMount:s.bindMount.bind(s),memoize:s.memoize.bind(s),createComponent:s.createComponent.bind(s),isChild:!1,useState:s.useState.bind(s),parseStyle:s.parseStyle.bind(s),bind:s.bind.bind(s),useRef:s.useRef.bind(s),useReducer:s.useReducer.bind(s),onMount:s.onMount.bind(s),onUnmount:s.onUnmount.bind(s),hydrate:s.hydrate.bind(s)};s.render=i.render,s=i}if(!document.querySelector("#root"))throw new Error("Root element not found, please add an element with id root");s.reset(),s.components={},s.request=t,s.response=r,s.router.use&&!s.isChild?await new Promise((async n=>{if(isClass(e.default))if(isClass(e.default))switch(await s.router.use(t,r),t.pause){case!0:console.log("pausing",t.pause);let e=setInterval((()=>{t.pause?console.log("still pausing",t.pause):(clearInterval(e),n())}),1e3);break;case!1:n()}else n();else switch(await e.default.apply(s,[t,r]),await s.router.use(t,r),t.pause){case!0:let e=setInterval((()=>{t.pause?console.log("still pausing  request",t.url):(clearInterval(e),n())}),1e3);break;case!1:n()}})):s.router.use&&s.isChild&&console.warn("Router.use() is not supported in child components");const i=await s.render();document.querySelector("#root").innerHTML!==i&&(document.querySelector("#root").innerHTML=i),s.bindMount(),s.onMount()}catch(e){console.error(e)}},setQuery:e=>{let t="";Object.keys(e).forEach(((r,s)=>{t+=`${0===s?"?":"&"}${r}=${e[r]}`}));let r=window.location.hash.split("?")[0];t=t.replace("/","-").replaceAll("/","-"),window.location.hash=`${r}${t}`},send:e=>{document.querySelector("#root").innerHTML=e},json:e=>{const t=document.querySelector("#root");t.innerHTML="";const r=document.createElement("pre");r.textContent=JSON.stringify(e,null,2),t.appendChild(r)}};middlewares.forEach((e=>{e(i,a)})),s&&s.handler(i,a)}}window.VaderRouter=VaderRouter;export default VaderRouter;