window.Vader={version:"1.3.3"},window.componentRegistry={};let errors={"SyntaxError: Unexpected token '<'":"You forgot to enclose tags in a fragment <></>"},mounts=[],hasRan=[];export const strictMount=(e,t)=>{let n=setInterval((()=>{document.querySelector(`[key="${e}"]`)&&!hasRan.includes(e)&&(clearInterval(n),t(),hasRan.push(e))}),120)};export class Component{constructor(){this.state={},this.key=null,this.components={},this.mounted=!1,this.checkIFMounted(),this.memoizes=[],this.functions=[],this.children=[],this.parentNode={},this.request={headers:{},method:"GET",params:{},path:"",query:{}},this.response={json:e=>{},send:e=>{},redirect:e=>{},render:async e=>{},log:e=>{},setQuery:e=>{}},this.router={use:e=>{}}}createComponent(e,t,n){function isClass(e){return"function"==typeof e&&/^class\s/.test(Function.prototype.toString.call(e))}let s=isClass(e)?new e(t):null;if(!e)throw new Error("Component must be defined");let r=new Component(t);if(isClass(e))s.props=t,s.children=n,s.props.children=n.join(""),s.parentNode=this,s.request=this.request,s.response=this.response,s.key=t.key||null,r=s;else{e.toString();r.key=e.toString().split('key="')[1]?e.toString().split('key="')[1].split('"')[0]:null;let n={key:r.key,render:()=>e.apply(r,[t]),request:this.request,isChild:!0,response:this.response,params:this.request.params,queryParams:this.request.query,reset:r.reset.bind(r),onMount:r.onMount.bind(r),useState:null,router:{use:r.router.use.bind(r)},bindMount:r.bindMount.bind(r),memoize:r.memoize.bind(r),createComponent:r.createComponent.bind(r),isChild:!1,useState:r.useState.bind(r),parseStyle:r.parseStyle.bind(r),bind:r.bind.bind(r),useRef:r.useRef.bind(r),request:this.request,response:this.response,useReducer:r.useReducer.bind(r),hydrate:r.hydrate.bind(r),onUnmount:r.onUnmount.bind(r),parentNoe:this};r.render=n.render,r=n}return this.components[t.key]||(this.components[t.key]=r),!this.children.includes(r)&&this.children.push(r),this.components[t.key]}reset(){Object.keys(this.components).forEach((e=>{this.components[e].onUnmount(),delete this.components[e]})),this.state={},this.children=[]}memoize(e){if(!0==!this.memoizes.includes(e.key))this.memoizes.push(e.key),this.components[e.key]=e;let t=this.components[e.key];t.bindMount(),t.parentNode=this,t.props=e.props,t.request=this.request,t.response=this.response,t.onMount=e.onMount.bind(e),t.onUnmount=e.onUnmount.bind(e);let n=t.render();return n&&n.split(">,").length>1&&(n=n.replaceAll(">,",">")),`<span key="${e.key}" >${n}</span>`}parseStyle(e){let t="";return Object.keys(e).forEach((n=>{let s=e[n];n=n.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g,"$1-$2").toLowerCase(),t+=`${n}:${s};`})),t}bindMount(){mounts.push(this)}domDifference(e,t){let n=[];for(let s=0;s<e.length;s++){let r=e[s],o=t[s];r&&o&&!r.isEqualNode(o)&&n.push({type:"replace",old:r,new:o.cloneNode(!0)})}return n}updateChangedElements(e){e.forEach((e=>{switch(e.type){case"replace":e.old.parentNode.replaceChild(e.new,e.old);break;case"remove":e.old.remove();break;case"add":e.old.appendChild(e.new.cloneNode(!0))}}))}hydrate(e){if(e){(new DOMParser).parseFromString(this.render(),"text/html").body.querySelector(`[ref="${e}"]`),document.querySelector(`[ref="${e}"]`)}else{let e=this.key?document.querySelector(`[key="${this.key}"]`):null,t=(new DOMParser).parseFromString(this.render(),"text/html").body;if(t=document.createElement("div").appendChild(t),!e&&(e=document.querySelector(`[key="${t.attributes?.key?.value||null}"]`)),!e)return void console.error('Hydration failed, component not found got ensure you have set key="a value" on the component or this.key inside of function or render method body');t.querySelectorAll("*").forEach((e=>{e.hasAttribute("key")&&e.innerHTML!==document.querySelector(`[key="${e.attributes.key.value}"]`).innerHTML&&document.querySelector(`[key="${e.attributes.key.value}"]`).replaceWith(e)}))}}patch(e,t){const n=this.domDifference(e,t);this.updateChangedElements(n)}handleObject(obj){try{obj=JSON.parse(obj)}catch(e){}return eval(obj)}bind(e,t,n,s,...r){n=n+this.key||2022;let o={},i=(s=s.replace(/,,/g,",")).replaceAll(",,",",");for(var u in r){let e=r[u];o[i.split(",")[u]]=e}s=s.replace(",,",",");let a=null;e=e.split("\n").join(";");try{a=new Function(`event, ${s}`,` \n        return (async (event, ${s}) => {    \n            ${e.toString()}\n        })(event, ${Object.keys(o).join(",")}) \n      `)}catch(e){let{message:t}=e;console.error(`Error in function ${n} ${t}`)}return a=a.bind(this),this.functions.find((e=>e.ref===n))||document.addEventListener(`$dispatch_#id=${n}`,(e=>{let{name:t,event:s}=e.detail;if(t===n){let e=this.functions.find((e=>e.ref===n)).params;Object.keys(e).forEach((t=>{e[t]instanceof CustomEvent&&delete e[t],void 0===e[t]?delete e[t]:e[t]})),a(s,...Object.values(e))}})),window.callFunction=(e,t)=>{document.dispatchEvent(new CustomEvent(`$dispatch_#id=${e}`,{detail:{name:e,params:null,event:t}}))},!this.functions.find((e=>e.ref===n))&&this.functions.push({ref:n,params:o}),t?e:`((event)=>{event.target.ev = event; callFunction('${n}', event.target.ev)})(event)`}useState(e,t){this.state[e]||(this.state[e]=t);let updatedValue=()=>this.state[e],n=updatedValue();return[n,(t,s)=>{this.state[e]=t,this.hydrate(s),n=updatedValue()}]}useRef(e=null,t){this.state[e]||(this.state[e]=t);return{bind:e+this.key,current:(()=>document.querySelector(`[ref="${e+this.key}"]`)||t)()}}useReducer(e=null,t,n=null){this.state[e]||(this.state[e]=t);const getValue=()=>this.state[e];let s=getValue();return[getValue(),(t,r)=>{const o=n(s,t)??t;this.state[e]=o,this.hydrate(r),s=getValue()}]}render(){}checkIFMounted(){new MutationObserver((e=>{e.forEach((e=>{e.target.querySelector(`[key="${this.key}"]`)&&!this.mounted&&(this.onMount(),this.mounted=!0),Array.from(e.removedNodes).find((e=>e.attributes&&e.attributes.key&&e.attributes.key.value===this.key))&&(this.onUnmount(),this.reset())}))})).observe(document.body,{childList:!0,subtree:!0})}onMount(){}onUnmount(){}}export const useState=(e,t)=>{states[e]||(states[e]=t);return[states[e],(t,n)=>{states[e]=t,this.hydrate(n)}]};export const useReducer=(e,t)=>[e,e=>{}];export const useRef=e=>({current:e,bind:""});export class Link extends Component{constructor(e){super(e),this.props=e,this.link=document.createElement("a")}render(){return this.link.innerHTML=this.props.children,this.link.setAttribute("id",this.props?.href),this.link.style=this.props?.style,this.link.setAttribute("class",this.props?.class),this.link.setAttribute("onclick",`window.history.pushState({}, '', '${this.props?.href}'); window.dispatchEvent(new Event('popstate'));`),this.link.outerHTML}}export default{Component:Component,useRef:useRef,useReducer:useReducer,useState:useState,strictMount:strictMount};