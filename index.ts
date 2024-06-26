//@ts-nocheck
let isClassComponent = function(element) {
  return element.toString().startsWith("class");
}; 

const memoizes = new Map();
//@ts-ignore
 
declare global {
  interface Window {
    onbeforeunload: any;
    localStorage: any;
    sessionStorage: any;
    state: any;
  } 
  const genKey: any; 
  /**
   * @description Allows you to check if current session is server or  client
   */
  let isServer: boolean;
  /**
   * @description - The params object is used to store the  parameters of the current URL
   * @example
   * // URL: https://example.com?name=John
   * console.log(params.name) // John
   * @example
   * // URL: https://example.com/:name/:age
   * // GO: https://example.com/John/20
   * console.log(params.name) // John
   * console.log(params.age) // 20
   */
  let params:  { [key: string]: string };
  let localStorage : []
}
//@ts-ignore
globalThis.isServer = typeof window === "undefined";
//@ts-ignore
globalThis.params = {
  [Symbol.iterator]: function* () {
    for (const key in this) {
      yield [key, this[key]];
    }
  },
};
 
 

/**
 * @description useFetch allows you to make POST - GET - PUT - DELETE requests then returns the data, loading state and error
 * @param url 
 * @param options 
 * @returns  [data, loading, error]
 */
export const useFetch = (url: string, options: any) => {
  return [null, true, null];
};

/**
 * @description  - Handle asyncronous promises and return the data or error; 
 * @param promise 
 * @returns 
 */
export const useAsyncState = (promise: Promise<any>) => {
  return [null, () => {}];
}
export const useEffect = (callback:any, dependencies: any[]) => {
  dependencies = dependencies.map((dep) => dep.toString());
  if (dependencies.length === 0) {
    callback();
  }
} 

export const Fragment = (props: any, children: any) => {
  return  {
    type: "div",
    props: props || {},
    children: children || [],
  }
}

globalThis.Fragment = Fragment;

/**
 * @description - Create a new element
 * @param element 
 * @param props 
 * @param children 
 * @returns 
 */
export const e = (element: any, props: any, ...children: any[]) => {
  let instance;
  switch (true){
    case isClassComponent(element):
       instance = new element();
      instance.props = props;
      instance.children = children;
      return instance.render();
    case typeof element === "function":
      instance = new Component();
      instance.render = element;
      return instance.render();
    default:
      return { type: element, props: props || {}, children: children || [] };
  } 
};

/**
 * @description -  Manage state and forceupdate specific affected elements
 * @param key 
 * @param initialState 
 * @returns {state,  (newState: any, Element: string) => void, key}
 */
export const useState = <T>(initialState: T) => {
  const setState = (newState: T) => {
    initialState = newState;
  }
  return [initialState, setState];
} 

/**
 * @description -  Create a new component
 * @param element
 * @param props
 * @param children
 * @returns
 * @example
 * const App = (props) => {
 *   return (
 *     <div>
 *       <h1>Hello, {props.name}</h1>
 *     </div>
 *    )
 *  }
 * 
 *  render(<App name="John" />, document.getElementById("root"));
 */
export class Component {
  props: any;
  state: any;
  element: any;
  Mounted: boolean;
  effect: any[];
  key: string;
  prevState: any;
  constructor() {
    this.key = Math.random().toString(36).substring(7);
    this.props = {};
    this.state = {};
    this.effect = [];
    this.Mounted = false;
    this.element = null; 
  }
   

  useEffect(callback: any, dependencies: any[]) {
    if (dependencies.length === 0 && this.Mounted && this.effect.length === 0) { 
      callback();
      this.effect.push(callback);
    }else{
      for (let i = 0; i < dependencies.length; i++) {
        if (this.effect[i] !== dependencies[i]) {
          this.effect = dependencies;
          callback();
        } 
      }
    }
  }  
   useState<T>(key: string, defaultValue: T) {
    let value = sessionStorage.getItem("state_" + key) ? JSON.parse(sessionStorage.getItem("state_" + key)).value : defaultValue;
  
    // Parse value if it's a stringified object or number
    if (typeof value === 'string') {
      try {
        value = JSON.parse(value);
      } catch (error) {
        // Not a valid JSON, keep it as is
      }
    }
  
    // Add listener for unload event to save state
    if (!window['listener' + key]) {
      window['listener' + key] = true;
      window.addEventListener('beforeunload', () => {
        sessionStorage.removeItem('state_' + key)
      });
    }
  
    const setValue = (newValue: T) => {
      value = newValue;
      sessionStorage.setItem("state_" + key, JSON.stringify({ type: typeof newValue, value: newValue }));
      this.forceUpdate(this.key)
    };
  
    return [value as T, setValue];
  }
  
 

  useFetch(url: string, options: any) { 
    const loadingKey = "loading_" + url;
    const errorKey = "error" + url;
    const dataKey = "_data" + url; 
     let [loading, setLoading] = this.useState(loadingKey, false);
     let [error, setError] = this.useState(errorKey, null);
     let [data, setData] = this.useState(dataKey, null);

    if (loading && !error && !data) {
        this.state[this.key][loadingKey] = true;

        fetch(url, options)
            .then((res) => res.json())
            .then((data) => {
              //@ts-ignore
                setLoading(false); 
                setData(data);
                this.forceUpdate(this.key);
            })
            .catch((err) => {
                setError(err);
                this.forceUpdate(this.key);
            });
    }

    return [data, loading, error];
}


  forceUpdate(key) { 
    //@ts-ignore
    let el = Array.from(document.querySelectorAll("*")).filter((el2: any) =>{ return el2.key === key})[0]; 
    let newl = this.toElement(); 
    if(newl.key !== key){  
      //@ts-ignore 
      newl = Array.from(newl.children).filter((el2) => el2.key === key)[0];
    }  
    this.Reconciler.update(el, newl);
  }
  Reconciler = {
    update: (oldElement, newElement) => {  
      if(!oldElement || !newElement) return;
      if (this.Reconciler.shouldUpdate(oldElement, newElement) && oldElement.tagName == newElement.tagName){ 
          oldElement.replaceWith(newElement)
      } else {
        let children = oldElement.childNodes;
        for (let i = 0; i < children.length; i++) { 
          this.Reconciler.update(children[i], newElement.childNodes[i]);
        }
      }
    },
     shouldUpdate(oldElement, newElement) {  
      if (oldElement.nodeType !== newElement.nodeType) {
        return true;
      }
      if (oldElement.nodeType === 3 && newElement.nodeType === 3) {
        return oldElement.textContent !== newElement.textContent;
      }
      if (oldElement.nodeName !== newElement.nodeName) {
        return true;
      }
      if (oldElement.childNodes.length !== newElement.childNodes.length) {
        return true;
      }
      return false;
    }
  }; 
   
  parseToElement = (element: any) => { 
    if(!element) return document.createElement("div");
    let el = document.createElement(element.type);
    let isText = typeof element === "string" || typeof element === "number" || typeof element === "boolean";
    if (isText) {
      el.textContent = element;
    } else {
      let attributes = element.props;
      let children = element.children;
      for (let key in attributes) {
        if(key === "key"){ 
          el.key = attributes[key];
          continue;
        }
        if (key === "className") {
          el.className = attributes[key];
          continue;
        }
        if (key === "style") {
          for (let styleKey in attributes[key]) {
            el.style[styleKey] = attributes[key][styleKey];
          }
          continue;
        }
        //@ts-ignore
        if (key.startsWith("on")) {  
          el.addEventListener(key.substring(2).toLowerCase(), attributes[key]);
          continue;
        }
        el.setAttribute(key, attributes[key]);
      }
      for (let i = 0;i < children.length; i++) {
        let child = children[i];
        if (Array.isArray(child)) {
          child.forEach((c) => {
            el.appendChild(this.parseToElement(c));
          });
        }
        if(typeof child === "function"){
          el.appendChild(this.parseToElement(child()));
        }else
        if (typeof child === "object") {
        el.appendChild(this.parseToElement(child));
        }else{ 
           let span = document.createElement("span");
            span.innerHTML = child;
            el.appendChild(span);
        }
      }
    }
    return el;
  };
  e(element: string | Function, props: any, ...children: any[]) {
    if(typeof element === "function"){
      return element();
    }
    return { type: element, props: props || {}, children: children || [] };
  }
  toElement() { 
    let children = this.render();
    //@ts-ignore
    if(children.props['key']){
      this.key = children.props['key'];
    }
    let el = this.parseToElement(children);
    el.key = this.key;  
    return el;
  }
  render() {
    return "";
  }

  
}
 
function memoizeClassComponent(Component: any) {
  let key = Component.toString();
  if (memoizes.has(key)) {
    return memoizes.get(key);
  }
  let instance = new Component();
  memoizes.set(key, instance);
  return instance;

}
/**
 * @description - Render jsx Componenet to the DOM
 * @param element 
 * @param container 
 */
export function render(element: any, container: HTMLElement) {
  if (isClassComponent(element)) {
    const instance = new element();  
    instance.Mounted = true;  
    let el = instance.toElement();  
    instance.element = el;  
    container.innerHTML = ""; 
    container.replaceWith(el);
  } else { 
     let memoizedInstance = memoizeClassComponent(Component);
      memoizedInstance.Mounted = true;
      memoizedInstance.render =  element.bind(memoizedInstance);
      let el = memoizedInstance.toElement(); 
      container.innerHTML = "";
      container.replaceWith(el);

  }
}