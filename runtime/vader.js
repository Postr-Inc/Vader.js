window.Vader={version:"1.3.3"},window.componentRegistry={};let errors={"SyntaxError: Unexpected token '<'":"You forgot to enclose tags in a fragment <></>"},mounts=[];export const strictMount=(e,t)=>{let n=setInterval((()=>{mounts.find((t=>t.key===e))&&(clearInterval(n),t())}),120)};export class Component{constructor(){this.state={},this.key=null,this.components={},this.mounted=!1,this.checkIFMounted(),this.memoizes=[],this.functions=[],this.children=[],this.parentNode={},this.request={headers:{},method:"GET",params:{},path:"",query:{}},this.response={json:e=>{},send:e=>{},redirect:e=>{},render:async e=>{},log:e=>{},setQuery:e=>{}},this.router={use:e=>{}}}createComponent(e,t,n){function s(e){return"function"==typeof e&&/^class\s/.test(Function.prototype.toString.call(e))}let r=s(e)?new e(t):null;if(!e)throw new Error("Component must be defined");if(!t.key)throw new Error("new components must have a key");if(s(e.default?e.default:e))r.props=t,r.children=n,r.props.children=n.join(""),r.parentNode=this,r.request=this.request,r.response=this.response,r.key=t.key||null;else{e.default&&(e=e.default);let s=new Component(t),o=e.toString(),i=o.includes("this.key")?o.split("this.key")[1].split("=")[1].split('"')[1]:null,u=(o.match(/return\s*`([\s\S]*)`/),o.split("return")[1].split("`")[0]);u=u.replace(/,\s*$/,""),t.children=n.join("");let a=e.apply(s,[t]);s.key=i,t.key=i,r={key:t.key?t.key:i,render:()=>a,request:this.request,response:this.response,reset:s.reset.bind(s),onMount:s.onMount.bind(s),parentNode:this,useState:s.useState.bind(s),useReducer:s.useReducer.bind(s),useRef:s.useRef.bind(s),router:{use:s.router.use.bind(s)},bindMount:s.bindMount.bind(s),memoize:s.memoize.bind(s),createComponent:s.createComponent.bind(s),isChild:!0,parseStyle:s.parseStyle.bind(s),components:{},onUnmount:s.onUnmount.bind(s),onMount:s.onMount.bind(s),functions:[],memoizes:[]}}return this.components[t.key]||(this.components[t.key]=r),this.children.push(r),this.components[t.key]}reset(){console.log("reset"),Object.keys(this.components).forEach((e=>{this.components[e].onUnmount(),delete this.components[e]})),this.state={},this.children=[]}memoize(e){if(!e.key)throw new Error("Component must have a static key");if(!0==!this.memoizes.includes(e.key))this.memoizes.push(e.key),this.components[e.key]=e;let t=this.components[e.key];t.bindMount(),t.parentNode=this,t.props=e.props,t.request=this.request,t.response=this.response;let n=t.render();return n&&n.split(">,").length>1&&(n=n.replaceAll(">,",">")),`<div key="${e.key}">${n}</div>`}parseStyle(e){let t="";return Object.keys(e).forEach((n=>{let s=e[n];n=n.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g,"$1-$2").toLowerCase(),t+=`${n}:${s};`})),t}bindMount(){mounts.push(this)}domDifference(e,t){let n=[];for(let s=0;s<e.length;s++){let r=e[s],o=t[s];r&&o&&!r.isEqualNode(o)&&n.push({type:"replace",old:r,new:o.cloneNode(!0)})}return n}updateChangedElements(e){e.forEach((e=>{switch(e.type){case"replace":e.old.parentNode.replaceChild(e.new,e.old);break;case"remove":e.old.remove();break;case"add":e.old.appendChild(e.new.cloneNode(!0))}}))}hydrate(e){if(this.key)if(e){let t=(new DOMParser).parseFromString(this.render(),"text/html").body.firstChild,n=document.body.querySelectorAll(`[ref="${e}"]`),s=t.querySelectorAll(`[ref="${e}"]`),r=this.domDifference(n,s);this.updateChangedElements(r)}else{const e=document.querySelector(`[key="${this.key}"]`);if(e){let t=(new DOMParser).parseFromString(this.render(),"text/html").body.firstChild;e.replaceWith(t)}else console.error("Target element not found.")}}patch(e,t){const n=this.domDifference(e,t);this.updateChangedElements(n)}handleObject(obj){try{obj=JSON.parse(obj)}catch(e){}return eval(obj)}bind(e,t,n,s,r,...o){s+=this.key;let i={},u=(r=r.replace(/,,/g,",")).replaceAll(",,",",");for(var a in o){let e=o[a];i[u.split(",")[a]]=e}r=r.replace(",,",",");let l=new Function(`${r}`,`\n       return (async (${r}) => { \n          ${e.toString()}\n       })(${Object.keys(i).join(",")}) \n     `);return l=l.bind(this),this.functions.find((e=>e.ref===s))||document.addEventListener(`$dispatch_#id=${s}`,(n=>{let{name:r,event:o}=n.detail;if(r===s){let n=this.functions.find((e=>e.ref===s)).params;Object.keys(n).forEach((e=>{n[e]instanceof CustomEvent&&delete n[e],void 0===n[e]?delete n[e]:n[e]})),t?e(o,...Object.values(n)):l(...Object.values(n))}})),window.callFunction=(e,t)=>{document.dispatchEvent(new CustomEvent(`$dispatch_#id=${e}`,{detail:{name:e,params:null,event:t}}))},this.functions.find((e=>e.ref===s))?!t&&(this.functions.find((e=>e.ref===s)).params=i):this.functions.push({ref:s,params:i}),n?e:`((event)=>{event.target.ev = event; callFunction('${s}', event.target.ev)})(event)`}useState(e,t){this.state[e]||(this.state[e]=t);let n=()=>this.state[e],s=n();return[s,(t,r)=>{this.state[e]=t,this.hydrate(r),s=n()}]}useRef(e=null,t){this.state[e]||(this.state[e]=t);return{bind:e+this.key,current:(()=>document.querySelector(`[ref="${e+this.key}"]`)||t)()}}useReducer(e=null,t,n=null){return[(()=>this.state[e])(),t=>{const s=n?n(this.state[e],t):t;this.state[e]=s}]}render(){}checkIFMounted(){new MutationObserver((e=>{e.forEach((e=>{e.target.querySelector(`[key="${this.key}"]`)&&!this.mounted&&(this.onMount(),this.mounted=!0),Array.from(e.removedNodes).find((e=>e.attributes&&e.attributes.key&&e.attributes.key.value===this.key))&&(this.onUnmount(),this.reset())}))})).observe(document.body,{childList:!0,subtree:!0})}onMount(){}onUnmount(){}}export const useState=(e,t)=>{states[e]||(states[e]=t);return[states[e],(t,n)=>{states[e]=t,this.hydrate(n)}]};export const useReducer=(e,t)=>[e,e=>{}];export const useRef=e=>({current:e,bind:""});export default{Component:Component,useRef:useRef,useReducer:useReducer,useState:useState,strictMount:strictMount};