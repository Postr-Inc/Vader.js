window.Vader={version:"1.3.3"},window.componentRegistry={};let errors={"SyntaxError: Unexpected token '<'":"You forgot to enclose tags in a fragment <></>"},mounts=[],hasRan=[];export const strictMount=(e,t)=>{let n=setInterval((()=>{document.querySelector(`[key="${e}"]`)&&!hasRan.includes(e)&&(clearInterval(n),t(),hasRan.push(e))}),120)};export class Component{constructor(){this.state={},this.key=null,this.components={},this.mounted=!1,this.checkIFMounted(),this.memoizes=[],this.functions=[],this.children=[],this.parentNode={},this.request={headers:{},method:"GET",params:{},path:"",query:{}},this.response={json:e=>{},send:e=>{},redirect:e=>{},render:async e=>{},log:e=>{},setQuery:e=>{}},this.router={use:e=>{}}}createComponent(e,t,n){function s(e){return"function"==typeof e&&/^class\s/.test(Function.prototype.toString.call(e))}let r=s(e)?new e(t):null;if(!e)throw new Error("Component must be defined");let o=new Component(t);if(s(e))r.props=t,r.children=n,r.props.children=n.join(""),r.parentNode=this,r.request=this.request,r.response=this.response,r.key=t.key||null,o=r;else{e.toString();o.key=e.toString().split('key="')[1]?e.toString().split('key="')[1].split('"')[0]:null;let n={key:o.key,render:()=>e.apply(o,[t]),request:this.request,isChild:!0,response:this.response,params:this.request.params,queryParams:this.request.query,reset:o.reset.bind(o),onMount:o.onMount.bind(o),useState:null,router:{use:o.router.use.bind(o)},bindMount:o.bindMount.bind(o),memoize:o.memoize.bind(o),createComponent:o.createComponent.bind(o),isChild:!1,useState:o.useState.bind(o),parseStyle:o.parseStyle.bind(o),bind:o.bind.bind(o),useRef:o.useRef.bind(o),request:this.request,response:this.response,useReducer:o.useReducer.bind(o),hydrate:o.hydrate.bind(o),parentNoe:this};o.render=n.render,o=n}return this.components[t.key]||(this.components[t.key]=o),!this.children.includes(o)&&this.children.push(o),this.components[t.key]}reset(){Object.keys(this.components).forEach((e=>{this.components[e].onUnmount(),delete this.components[e]})),this.state={},this.children=[]}memoize(e){if(!e.key)throw new Error("Component must have a static key");if(!0==!this.memoizes.includes(e.key))this.memoizes.push(e.key),this.components[e.key]=e;let t=this.components[e.key];t.bindMount(),t.parentNode=this,t.props=e.props,t.request=this.request,t.response=this.response;let n=t.render();return n&&n.split(">,").length>1&&(n=n.replaceAll(">,",">")),`<div key="${e.key}">${n}</div>`}parseStyle(e){let t="";return Object.keys(e).forEach((n=>{let s=e[n];n=n.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g,"$1-$2").toLowerCase(),t+=`${n}:${s};`})),t}bindMount(){mounts.push(this)}domDifference(e,t){let n=[];for(let s=0;s<e.length;s++){let r=e[s],o=t[s];r&&o&&!r.isEqualNode(o)&&n.push({type:"replace",old:r,new:o.cloneNode(!0)})}return n}updateChangedElements(e){e.forEach((e=>{switch(e.type){case"replace":e.old.parentNode.replaceChild(e.new,e.old);break;case"remove":e.old.remove();break;case"add":e.old.appendChild(e.new.cloneNode(!0))}}))}hydrate(e){if(e){console.log(e);let t=(new DOMParser).parseFromString(this.render(),"text/html").body.querySelector(`[ref="${e}"]`),n=document.querySelector(`[ref="${e}"]`);console.log(t,n)}else{let e=this.key?document.querySelector(`[key="${this.key}"]`):null,t=(new DOMParser).parseFromString(this.render(),"text/html").body;if(t=document.createElement("div").appendChild(t),!e&&(e=document.querySelector(`[key="${t.attributes?.key?.value||null}"]`)),!e)return void console.error('Hydration failed, component not found got ensure you have set key="a value" on the component or this.key inside of function or render method body');t.querySelectorAll("*").forEach((e=>{e.hasAttribute("key")&&e.innerHTML!==document.querySelector(`[key="${e.attributes.key.value}"]`).innerHTML&&document.querySelector(`[key="${e.attributes.key.value}"]`).replaceWith(e)}))}}patch(e,t){const n=this.domDifference(e,t);this.updateChangedElements(n)}handleObject(obj){try{obj=JSON.parse(obj)}catch(e){}return eval(obj)}bind(e,t,n,s,...r){n=n+this.key||2022;let o={},i=(s=s.replace(/,,/g,",")).replaceAll(",,",",");for(var u in r){let e=r[u];o[i.split(",")[u]]=e}s=s.replace(",,",",");let a=null;try{a=new Function(`event, ${s}`,` \n          return (async (event, ${s}) => {    \n              ${e.toString()}\n          })(event, ${Object.keys(o).join(",")}) \n        `)}catch(e){let{message:t}=e;console.error(`Error in function ${n} ${t}`)}return a=a.bind(this),this.functions.find((e=>e.ref===n))||document.addEventListener(`$dispatch_#id=${n}`,(e=>{let{name:t,event:s}=e.detail;if(t===n){let e=this.functions.find((e=>e.ref===n)).params;Object.keys(e).forEach((t=>{e[t]instanceof CustomEvent&&delete e[t],void 0===e[t]?delete e[t]:e[t]})),a(s,...Object.values(e))}})),window.callFunction=(e,t)=>{document.dispatchEvent(new CustomEvent(`$dispatch_#id=${e}`,{detail:{name:e,params:null,event:t}}))},!this.functions.find((e=>e.ref===n))&&this.functions.push({ref:n,params:o}),t?e:`((event)=>{event.target.ev = event; callFunction('${n}', event.target.ev)})(event)`}useState(e,t){this.state[e]||(this.state[e]=t);let n=()=>this.state[e],s=n();return[s,(t,r)=>{this.state[e]=t,this.hydrate(r),s=n()}]}useRef(e=null,t){this.state[e]||(this.state[e]=t);return{bind:e+this.key,current:(()=>document.querySelector(`[ref="${e+this.key}"]`)||t)()}}useReducer(e=null,t,n=null){this.state[e]||(this.state[e]=t);const s=()=>this.state[e];let r=s();return[s(),(t,o)=>{const i=n(r,t)??t;this.state[e]=i,this.hydrate(o),r=s()}]}render(){}checkIFMounted(){new MutationObserver((e=>{e.forEach((e=>{e.target.querySelector(`[key="${this.key}"]`)&&!this.mounted&&(this.onMount(),this.mounted=!0),Array.from(e.removedNodes).find((e=>e.attributes&&e.attributes.key&&e.attributes.key.value===this.key))&&(this.onUnmount(),this.reset())}))})).observe(document.body,{childList:!0,subtree:!0})}onMount(){}onUnmount(){}}export const useState=(e,t)=>{states[e]||(states[e]=t);return[states[e],(t,n)=>{states[e]=t,this.hydrate(n)}]};export const useReducer=(e,t)=>[e,e=>{}];export const useRef=e=>({current:e,bind:""});export default{Component:Component,useRef:useRef,useReducer:useReducer,useState:useState,strictMount:strictMount};