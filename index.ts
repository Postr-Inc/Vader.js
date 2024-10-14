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
export const useEffect = (callback:any, dependencies: any[] = []) => {
  dependencies = dependencies.map((dep) =>  JSON.stringify(dep));
  if (dependencies.length === 0) {
    callback();
  }
}

// make a switch function component


export const A  = (props: {
  /**
  * @description Set the elements classlist
  */
  class: string;
  /**
  * @description Once clicked send user to a different link
  */
  href: string;
  style: string;
  openInNewTab: boolean
  onClick: () => void;
  onChange: () => void;
}, children: any) => {
   function handleClick(e) {
    e.preventDefault();
    if(props.openInNewTab){
      window.open(props.href, "_blank");
      return void 0;
    }
    window.history.pushState({}, "", props.href);
    window.dispatchEvent(new PopStateEvent("popstate"));
    window.location.reload();
     return void 0;
   }
  return  {
    type: "a",
    props: {...props, onClick: handleClick},
    children: children || [],
  }
}


export const Fragment = (props: any, children: any) => {
  return  {
    type:null,
    props: props,
    children
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
export const e = (element, props, ...children) => {
  let instance;
  switch (true) {
    case isClassComponent(element):
      instance = new element;
      instance.props = props;
      instance.children = children;
      instance.Mounted = true;
      return instance.render(props);
    case typeof element === "function":
      instance = new Component;
      instance.render = element;
      instance.Mounted = true;
      let firstEl = instance.render({key: instance.key, children: children, ...props}, children);
      instance.children = children;
      if (!firstEl) {
        return {type: "div", props: {key: instance.key,  ...props}, children: children};
      }

      firstEl.props = { key: instance.key,  ...firstEl.props, ...props };
      return { type: "ghost", props:{}, children: [firstEl]}
    default:
      return { type: element, props: props || {}, children: children || [] };
  }
};

/*
  * @description - Switch component
  * @param element
  * @param props
  * @param children
  * @returns
  */


export function Switch({ children }) {
  for (let child of children) {
    if (child.props.when) {
      return child;
    }
  }
  return  { type: "div", props: {}, children: [] };
}

/**
 * @description - Match component
 * @param param0
 * @returns
 */
export function Match({ when, children }) {
  return when ? children : { type: "div", props: {}, children: [] };
}
/**
 * @description -  Manage state and forceupdate specific affected elements
 * @param key
 * @param initialState
 * @param persist - persist state on reload
 * @returns {T,  (newState: any, Element: string) => void, key}
 */
export const useState = <T>(initialState: T, persist: false) => {
  const setState = (newState: T) => {
    initialState = newState;
  }


  return [initialState, setState];
}

if (!isServer) {
  window.effects = []
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

 // create a hidden object on window
 //
if(!isServer){
  Object.defineProperty(window, "state", {
    value: [],
    writable: true,
    enumerable: true,
  })

}else{
  globalThis.state = []
}
export class Component {
  props;
  state;
  element;
  Mounted;
  effect;
  key;
  effectCalls: any[]
  eventRegistry: any
  prevState;
  refs: HTMLElement[] | any[]
  state: any[] = []
  constructor() {
    this.key = crypto.randomUUID();
    this.props = {};
    this.effect = [];
    this.Mounted = false;
    this.state = [];
    this.element = null;
    this.effectCalls = []
    this.errorThreshold = 1000
    this.maxIntervalCalls  = 10
    this.eventRegistry = new Map();
    this.refs = []
  }
  useRef = (key, value) => {
     if(!this.refs.find((r)=> r.key == key)){
        this.refs.push({key, value});
     }

      return this.refs.find((r)=> r.key == key).value;
  }
  useEffect(callback, dependencies = []) {
    const callbackId = callback.toString();

    if (!this.effectCalls.some(s => s.id === callbackId)) {
        this.effectCalls.push({ id: callbackId, count: 0, lastCall: Date.now(), runOnce: dependencies.length === 0 });
    }

    const effectCall = this.effectCalls.find(s => s.id === callbackId);

    const executeCallback = () => {
        const now = Date.now();
        const timeSinceLastCall = now - effectCall.lastCall;

        if (timeSinceLastCall < this.errorThreshold) {
            effectCall.count += 1;
            if (effectCall.count > this.maxIntervalCalls) {
                throw new Error(`Woah wayy too many calls, ensure you are not overlooping you can change the maxThresholdCalls and errorThreshold depending on needs`)
            }
        } else {
            effectCall.count = 1;
        }

        effectCall.lastCall = now;

        setTimeout(() => {
            try {

              effects.push(callbackId);

                callback()
            } catch (error) {
                console.error(error);
            }
        }, 0);
    };

    if (dependencies.length === 0 && this.Mounted && this.effect.length === 0 && !effects.includes(callbackId)){
        executeCallback();
        this.effect.push(callbackId);
    } else {
        // Check if dependencies have changed
        let dependenciesChanged = false;
        if (dependencies.length !== this.effect.length) {
            dependenciesChanged = true;
        } else {
            for (let i = 0; i < dependencies.length; i++) {
                if (this.effect[i] !== dependencies[i]) {
                    dependenciesChanged = true;
                    break;
                }
            }
        }

        if (dependenciesChanged) {
            this.effect = [...dependencies];
            executeCallback();
        }
    }
}
  useState(key, defaultValue, persist = false) {

    if (typeof window === "undefined")
      return [defaultValue, () => {
      }];

     let value = this.state.find((v) => v.key == key) ?  this.state.find((v) => v.key == key).value : defaultValue;

    if(!this.state.find(i => i.key === key)){
      this.state.push({key: key, value: defaultValue})
    }
    if (typeof value === "string") {
      try {
        value = JSON.parse(value);
      } catch (error) {
      }
    }

    const clear = () =>{
      this.state =  this.state.filter((v) => v.key !== key);
    }
    const setValue = (newValue) => {
      // If newValue is a function, call it with the current value
      if (typeof newValue === "function") {
        const item = this.state.find(i => i.key === key);
        newValue = item ? newValue(item.value) : newValue;
      }


      let itemIndex = this.state.findIndex(i => i.key === key);

      if (itemIndex !== -1) {
        this.state[itemIndex].value = newValue;
      } else {
        this.state.push({ key: key, value: newValue });
      }

      this.forceUpdate(this.key);
    };


    return [value, setValue, clear];
  }
  useFetch(url, options) {
    const loadingKey = "loading_" + url;
    const errorKey = "error" + url;
    const dataKey = "_data" + url;
    let [loading, setLoading, _clear1] = this.useState(loadingKey, true);
    let [error, setError, _clear2] = this.useState(errorKey, null);
    let [data, setData, clear] = this.useState(dataKey, null);
    if (loading() && !error() && !data()) {
      fetch(url, options).then((res) => res.json()).then((data2) => {
        setLoading(false);
        setData(data2);
        this.forceUpdate(this.key);
        setTimeout(()=> {
          _clear1()
          _clear2()
          clear()
        }, 1500)
      }).catch((err) => {
        setError(err);
        this.forceUpdate(this.key);
      });
    }
    return { loading, error, data };
  }
  forceUpdate(key) {
    let el = Array.from(document.querySelectorAll("*")).filter((el2) => {
      return el2.key === key;
    })[0];
    let newl = this.toElement();
    if (newl.key !== key) {
      newl = Array.from(newl.children).filter((el2) => el2.key === key)[0];
    }
    this.Reconciler.update(el, newl);
  }
  Reconciler = {
    update: (oldElement, newElement) => {
      if (!oldElement || !newElement) return;

      // Store and re-attach events before updating
      const events = this.eventRegistry.get(oldElement.id) || [];


      if (this.Reconciler.shouldUpdate(oldElement, newElement)) {
        let part = this.Reconciler.shouldUpdate(oldElement, newElement, true);
        console.log(part)
        if (part === true) {
          if (oldElement.nodeType === 3) {
            oldElement.nodeValue = newElement.nodeValue;
          } else {
            oldElement.innerHTML = newElement.innerHTML;

            // Swap attributes
            for (let i = 0; i < newElement.attributes.length; i++) {
              let attr = newElement.attributes[i];
              oldElement.setAttribute(attr.name, attr.value);
            }

            // Re-attach events
            events.forEach(ev => {
              const { event, handler } = ev
              oldElement.addEventListener(event, handler);
              newElement.addEventListener(event, handler)
            });

            // Update children recursively
            for (let i = 0; i < newElement.childNodes.length; i++) {
              let children = {old: oldElement.childNodes[i], new:newElement.childNodes[i] }

              this.Reconciler.update(oldElement.childNodes[i], newElement.childNodes[i], true);
            }
          }
        } else if (part.type === "Attributes") {
          for (var i = 0; i < part.attributes.length; i++){
            const _part = part.attributes[i]
            oldElement.setAttribute(_part.name, _part.value);
          }

        }
      } else {
        events.forEach(ev => {
          const { event, handler } = ev
          oldElement.addEventListener(event, handler);
          newElement.addEventListener(event, handler)
        });

        // Update children recursively
        for (let i = 0; i < newElement.childNodes.length; i++) {

          this.Reconciler.update(oldElement.childNodes[i], newElement.childNodes[i], true);
        }
      }
    },

    shouldUpdate: (oldElement, newElement, isChild = false) => {
      // Check for node type differences
      if (oldElement.nodeType !== newElement.nodeType) {
        return oldElement.innerHTML !== newElement.innerHTML ? { type: 'innerHTML' } : true;
      }

      // Compare text node content
      if (oldElement.nodeType === 3 && newElement.nodeType === 3) {
        if (oldElement.nodeValue !== newElement.nodeValue) {
          return true;
        }
      }

      // Compare node names
      if (oldElement.nodeName !== newElement.nodeName) {
        return true;
      }

      // Compare child nodes length
      if (oldElement.childNodes.length !== newElement.childNodes.length) {
        return true;
      }

      // Compare attributes
      const oldAttributes = oldElement.attributes || [];
      const newAttributes = newElement.attributes || [];

      // Check if an attribute was added or changed
      //
      var attributes = []
      for (let i = 0; i < newAttributes.length; i++) {
        const attr = newAttributes[i];
        if (oldElement.getAttribute(attr.name) !== attr.value) {
         attributes.push({ type: 'attribute', name: attr.name, value: attr.value })
        }
      }

      // Check if an attribute was removed
      for (let i = 0; i < oldAttributes.length; i++) {
        const attr = oldAttributes[i];
        if (!newElement.hasAttribute(attr.name)) {
           attributes.push({ type: 'attribute', name: attr.name, value: null })
        }
      }

      if (attributes.length > 0 ){
        return {
          type: "Attributes",
          attributes
        }
      }

      return false;
    }

  };

  parseToElement = (element) => {
    if (!element) return document.createElement("div");
    // create either a element or svg element
    let svg = ["svg", "path", "circle", "rect", "line", "polyline", "polygon", "ellipse", "g"];
    let el =  svg.includes(element.type) ? document.createElementNS("http://www.w3.org/2000/svg", element.type) : document.createElement(element.type);
    let isText = typeof element === "string" || typeof element === "number" || typeof element === "boolean";
    if (isText && element){ 
      el.innerHTML = element;
    } else {
      let attributes = element.props;
      let children = element.children;
      for (let key in attributes) {
        if (key === "key") {
          el.key = attributes[key];
          continue;
        }
        if (key === "className") {
          el.setAttribute("class", attributes[key]);
          continue;
        }
        if (key === "style") {
          try {
            for (let styleKey in attributes[key]) {
              el.style[styleKey] = attributes[key][styleKey];
            }
          } catch (error) {

          }
          continue;
        }
        if (key.startsWith("on")) {
          el.addEventListener(key.substring(2).toLowerCase(), attributes[key]);
          el.id = el.id || Math.random().toString(36).substring(7);
          this.eventRegistry.set(el.id, [...(this.eventRegistry.get(el) || []), { event: key.substring(2).toLowerCase(), handler: attributes[key] }]);
          continue;
        }
        el.setAttribute(key, attributes[key]);
      }
      if (children === undefined)
        return el;
      for (let i = 0;i < children.length; i++) {
        let child = children[i];
        if (Array.isArray(child)) {
          child.forEach((c) => {
            el.appendChild(this.parseToElement(c));
          });
        }
        if (typeof child === "function") { 
          let comp = memoizeClassComponent(Component);
          comp.Mounted = true;
          comp.render = child;
          let el2 = comp.toElement();
          el2.key = comp.key;
          el.appendChild(el2);
        } else if (typeof child === "object") {
          el.appendChild(this.parseToElement(child));
        } else if(child){
          let span = document.createTextNode(child)
          el.appendChild(span);
        }
      }
    }
    return el;
  };
  e(element, props, ...children) {
    if (typeof element === "function") {
      return element();
    }
    return { type: element, props: props || {}, children: children || [] };
  }
  toElement() {
    let children = this.render();

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
export function render(element, container) {
  if (isClassComponent(element)) {
    const instance = new element;
    instance.Mounted = true;
    let el = instance.toElement();
    instance.element = el;
    container.innerHTML = "";
    container.replaceWith(el);
  } else {
    let memoizedInstance = memoizeClassComponent(Component);
    memoizedInstance.Mounted = true;
    memoizedInstance.render = element.bind(memoizedInstance);
    let el = memoizedInstance.toElement();
    el.key = memoizedInstance.key;
    container.innerHTML = "";
    container.replaceWith(el);
  }
}
