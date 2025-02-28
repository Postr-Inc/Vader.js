//@ts-nocheck
let isClassComponent = function (element) {
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
  let params: { [key: string]: string };
  let localStorage: []
}
//@ts-ignore
globalThis.isServer = typeof window === "undefined";
//@ts-ignore
if(isServer){
  globalThis.params = {
    [Symbol.iterator]: function* () {
      for (const key in this) {
        yield [key, this[key]];
      }
    },
  };
}



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
 * @description - Bypasses this error when using state in a non parent function
 * @param funct 
 * @param context 
 * @returns 
 * @example
 * // - src/index.ts
 * 
 * export default function useAuth(){ 
 *  let [isAuthenticated, setAuthenticated] = useState(false)
 * }
 * 
 * // app/index.jsx
 * 
 * export default function(){
 *  // this will error because this is not present in the cild function
 *  const { isAuthenticated } = useAuth()
 *  // to declare this we need to use bound from vaderjs module
 *  const { isAuthenticated } = bound(useAuth)()
 *  return ( 
 *   <div></div>
 * 
 *  )
 * }
 */
export function bound(funct: Function, context: any) {
  return function() {
    return funct.apply(context, arguments);
  };
}
/**
 * @description - useRef allows you to store a reference to a DOM element
 * @param value
 * @returns {current:   HTMLElement}
 * @example
 * const inputRef = useRef();
 * <input ref={inputRef} />
 * console.log(inputRef.current) // <input />
 */
export const useRef = (value) => {
  return { key: crypto.randomUUID(), current: value };
}

/**
 * @description  - Handle asyncronous promises and return the data or error;
 * @param promise
 * @returns
 */
export const useAsyncState = (promise: Promise<any>) => {
  return [null, () => { }];
}
export const useEffect = (callback: any, dependencies: any[] = []) => { 
  dependencies = dependencies.map((dep) => JSON.stringify(dep));
  if (dependencies.length === 0) {
    callback();
  }
}

// make a switch function component


export const A = (props: {
  /**
  * @description Set the elements classlist
  */
  className?: string;
  /**
  * @description Once clicked send user to a different link
  */
  href?: string;
  style?: string;
  openInNewTab?: boolean
  onClick?: () => void;
  onChange?: () => void;
}, children: any) => {
  function handleClick(e) {
    e.preventDefault();
    if (props.openInNewTab) {
      window.open(props.href, "_blank");
      return void 0;
    }   
    window.history.pushState({}, "", props.href);
    window.dispatchEvent(new Event("popstate")); 
    window.dispatchEvent(new Event("load"));
    window.location.reload();
    return void 0;
  }
  return e("a", { ...props, onClick: handleClick }, props.children);
}


export const Fragment = (props: any, children: any) => {
  return {
    type: null,
    props: props,
    children
  }
}

if(typeof window !== "undefined") {
  window.history.back = () => {
    window.history.go(-1);
  }
  window.history.forward = () => {
    window.history.go(1);
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
  if (!element)
    return "";
  let instance;
  switch (true) {
    case isClassComponent(element):
      instance = new element;
      instance.props = props;
      instance.children = children;
      instance.Mounted = true;
      return instance.render(props);
    case typeof element === "function": 
      instance = memoizeClassComponent(Component, element.name);  
      element = element.bind(instance); 
      instance.render = (props) => element(props);
      if (element.name.toLowerCase() == "default") {
        throw new Error("Function name must be unique");
      }
      instance.key = element.name;
      instance.Mounted = true;
      let firstEl = instance.render({ key: instance.key, children, ...props }, children);
      instance.children = children;
      if (!firstEl)
        firstEl = { type: "div", props: { key: instance.key, ...props }, children };
      firstEl.props = { key: instance.key, ...firstEl.props, ...props }; 
      firstEl.props["idKey"] = instance.props?.ref?.key || instance.key;
      instance.props = firstEl.props; 
      return firstEl;
    default:
      if(!element) {
        return "";
      }
      let el = { type: element, props: props || {}, children: children || [] };
      if (el.type !== "head") {
        el.props = { idKey: el.props?.ref?.key || crypto.randomUUID(), ...el.props };
      }

      // if element == false return empty string
      if (el.type === false) {
        return "";
      }

      return el;
  }
};

/*
  * @description - Switch component
  * @param element
  * @param props
  * @param children
  * @returns
  */


interface SwitchProps {
  children: any[] | any;
}

const acceptedAttributes = [
  // Global attributes
  'accesskey', 'class', 'className', 'idKey', 'contenteditable', 'contextmenu', 'data', 'dir', 'hidden',
  'id', 'lang', 'style', 'tabindex', 'title', 'translate', 'xml:lang', 'xml:space',

  // SVG-specific attributes
  'xmlns', 'fill', 'viewBox', 'stroke-width', 'stroke', 'd', 'stroke-linecap', 'stroke-linejoin', 'content', 'name'
];


// make children optional
export function Switch({ children = [] }: SwitchProps) {
  for (let child of children) {
    if (child.props.when) { 
      return { type: "div", props: {
        idKey: crypto.randomUUID()
      }, children: [child] };
    }
  }
  return { type: "div", props: {}, children: [] };
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

export const useState = (initialState, persist) => {
  const setState = (newState) => {
    initialState = newState;
  };
 
  return [initialState, setState];
};

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
if (!isServer) {
  Object.defineProperty(window, "state", {
    value: [],
    writable: true,
    enumerable: true,
  })

} else {
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
  state: {}
  constructor() {
    this.key = crypto.randomUUID();
    this.props = {};
    this.effect = [];
    this.Mounted = false;
    this.state =  {};
    this.element = null;
    this.effectCalls = []
    this.errorThreshold = 1000
    this.maxIntervalCalls = 10
    this.eventRegistry = new WeakMap();
    this.refs = []
  }
  useRef = (key, value) => {
    if (!this.refs.find((r) => r.key == key)) {
      this.refs.push({ key,  current: value});
    }

    return { key, current: this.refs.find((r) => r.key == key).current };
  }
  useEffect(callback, dependencies = []) {
    const callbackId = callback.toString(); // Unique ID based on callback string representation

    if (!this.effectCalls.some((effect) => effect.id === callbackId)) {
        // Add the initial effect call if it doesn't exist
        this.effectCalls.push({
            id: callbackId,
            count: 0,
            lastCall: Date.now(),
            hasRun: false, // Tracks if the effect has already run once
            dependencies
        });
    }

    const effectCall = this.effectCalls.find((effect) => effect.id === callbackId);

    const executeCallback = () => {
        const now = Date.now();
        const timeSinceLastCall = now - effectCall.lastCall;

        // Track call counts and handle potential over-calling issues
        if (timeSinceLastCall < this.errorThreshold) {
            effectCall.count += 1;
            if (effectCall.count > this.maxIntervalCalls) {
                throw new Error(
                    `Woah, way too many calls! Ensure you are not over-looping. Adjust maxIntervalCalls and errorThreshold as needed.`
                );
            }
        } else {
            effectCall.count = 1;
        }

        effectCall.lastCall = now;

        setTimeout(() => {
            try {
                effects.push(callbackId); // Track executed effects
                callback(); // Execute the callback
            } catch (error) {
                console.error(error);
            }
        }, 0);
    };

    // First time: Run the effect and mark it as run
    if (!effectCall.hasRun && dependencies.length === 0) {
      executeCallback();
      effectCall.hasRun = true;
      effectCall.dependencies = dependencies;
      return;
    }

    // If there are no dependencies, do nothing after the first run
    if (dependencies.length === 0) {
        return;
    }

    // Check if dependencies have changed
    let dependenciesChanged = false;
    for (let i = 0; i < dependencies.length; i++) {
        const previousDependencies = effectCall.dependencies || [];
        if (
            JSON.stringify(previousDependencies[i]) !== JSON.stringify(dependencies[i])
        ) {
            dependenciesChanged = true;
            break;
        }
    }

    // If dependencies have changed, run the effect and update dependencies
    if (dependenciesChanged) {
        executeCallback();
        effectCall.dependencies = dependencies;
    }
}

  
   useState(key, defaultValue, persist = false) {
    let value = this.state[key] || defaultValue;
    if(value === "true" || value === "false") {
      value = JSON.parse(value);
    }
    // if value is boolean store as string

    if (persist) {
      value = sessionStorage.getItem(key) ? JSON.parse(sessionStorage.getItem(key)).value : defaultValue;
    }
    const setValue = (newValue) => {
      if(typeof newValue === "function") {
        newValue = newValue(this.state[key]);
      }
      this.state[key] =  typeof newValue === "boolean" ? newValue.toString() : newValue;
      if (persist) {
        sessionStorage.setItem(key, JSON.stringify({ value: newValue }));
      }
      this.forceUpdate(this.key);
    }; 
    return [value, setValue];
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
        setTimeout(() => {
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
  addEventListener(element, event, handler) {
    if (!this.eventRegistry.has(element)) {
      this.eventRegistry.set(element, []);
    }
    const registeredEvents = this.eventRegistry.get(element);
    const isDuplicate = registeredEvents.some((e) => e.type === event && e.handler === handler);
    if (!isDuplicate) {
      element["on" + event] = handler;
      registeredEvents.push({ type: event, handler });
      this.eventRegistry.set(element, registeredEvents);
    }
  }
  removeEventListeners(element) {
    // Unregister and remove all events for the element
    const registeredEvents = this.eventRegistry.get(element) || [];
    registeredEvents.forEach(({ type, handler }) => {
      element.removeEventListener(type, handler);
    });
    this.eventRegistry.delete(element);
  }
  forceUpdate(key) {
    let el =  document.querySelector(`[idKey="${key}"]`); 
    let newl = this.toElement(this.props);
    if (newl.getAttribute("idKey") !== key) {
      newl = Array.from(newl.children).filter((el2) =>   el2.getAttribute("idKey") === key)[0];
    } 
    this.Reconciler.update(el, newl);
  }
  attachEventsRecursively = (element, source) => {
    // Rebind events for the current element
    const events = this.eventRegistry.get(source) || [];
    events.forEach(({ event, handler }) => {
      this.addEventListener(element, event, handler);
    });
  
    // Traverse children recursively
    const children = Array.from(source.childNodes || []);
    const elementChildren = Array.from(element.childNodes || []);
  
    children.forEach((child, index) => {
      if (elementChildren[index]) {
        this.attachEventsRecursively(elementChildren[index], child);
      }
    });
  };


  Reconciler = {
    update: (oldElement, newElement) => { 
      if (!oldElement || !newElement) return;
  
      // Check if the current element needs an update
      if (this.Reconciler.shouldUpdate(oldElement, newElement)) {
        // Update attributes
        const oldChildren = Array.from(oldElement.childNodes);
        const newChildren = Array.from(newElement.childNodes);
    
        const maxLength = Math.max(oldChildren.length, newChildren.length);
        if (oldElement.tagName !== newElement.tagName) {
          const newElementClone = newElement.cloneNode(true);
          oldElement.replaceWith(newElementClone);
      
          // Attach events recursively to the new element
          this.attachEventsRecursively(newElementClone, newElement);
          return;
        }

        for (let i = 0; i < maxLength; i++) {
          if (i >= oldChildren.length) {
            const newChildClone = newChildren[i].cloneNode(true);
            if(oldElement.nodeType === Node.TEXT_NODE) {
              oldElement.textContent = newElement.textContent;
              return;
            }
            oldElement.appendChild(newChildClone);
    
            // Rebind events to the new child (and its children recursively)
            this.attachEventsRecursively(newChildClone, newChildren[i]);
          } else if (i >= newChildren.length) {
            oldElement.removeChild(oldChildren[i]);
          } else {
            this.Reconciler.update(oldChildren[i], newChildren[i]);
          }
        }
    
        Array.from(oldElement.attributes || []).forEach(({ name }) => {
          if (!newElement.hasAttribute(name)) {
            oldElement.removeAttribute(name);
          }
        });
  
        Array.from(newElement.attributes || []).forEach(({ name, value }) => {
          if (oldElement.getAttribute(name) !== value) {
            oldElement.setAttribute(name, value);
          }
        });
  
        // Handle text node updates
        if (oldElement.nodeType === Node.TEXT_NODE) {
          if (oldElement.textContent !== newElement.textContent) {
            oldElement.textContent = newElement.textContent;
          }
          return;
        }
  
        // If the element has a single text node, update text directly
        if (
          oldElement.childNodes.length === 1 &&
          oldElement.firstChild.nodeType === Node.TEXT_NODE
        ) {
          if (oldElement.textContent !== newElement.textContent) {
            oldElement.textContent = newElement.textContent;
          }
          return;
        }
      }
  
      // Process children recursively
      const oldChildren = Array.from(oldElement.childNodes);
      const newChildren = Array.from(newElement.childNodes);
  
      const maxLength = Math.max(oldChildren.length, newChildren.length);
  
      for (let i = 0; i < maxLength; i++) {
        if (i >= oldChildren.length) { 
          // Add new child if it exists in newChildren but not in oldChildren
          const newChildClone = newChildren[i].cloneNode(true);
          oldElement.appendChild(newChildClone);
  
          // Attach any event listeners
          const newChildEvents = this.eventRegistry.get(newChildren[i]) || [];
          newChildEvents.forEach(({ type, handler }) => {
            this.addEventListener(newChildClone, type, handler);
          });
        } else if (i >= newChildren.length) {
          // Remove child if it exists in oldChildren but not in newChildren
          oldElement.removeChild(oldChildren[i]);
        } else { 
          this.Reconciler.update(oldChildren[i], newChildren[i]);
        }
      }
  
      // Reapply events for the current element
      const parentEvents = this.eventRegistry.get(newElement) || [];
      parentEvents.forEach(({ type, handler }) => {
        if (newElement.nodeType === oldElement.nodeType) {
          this.addEventListener(oldElement, type, handler);
        } 
      });

    },
    shouldUpdate: (oldElement, newElement) => { 
      // Check if node types differ
      if (oldElement.nodeType !== newElement.nodeType) {
        return true;
      }
  
      // Check if text content differs
      if (oldElement.nodeType === Node.TEXT_NODE) {
        return oldElement.textContent !== newElement.textContent;
      }
  
      // Check if node names differ
      if (oldElement.nodeName !== newElement.nodeName) {
        return true;
      }
  
      // Check if child counts differ
      if (oldElement.childNodes.length !== newElement.childNodes.length) {
        return true;
      }
  
      // Check if attributes differ
      const newAttributes = Array.from(newElement.attributes || []);
      for (let { name, value } of newAttributes) {
        if (oldElement.getAttribute(name) !== value) {
          return true;
        }
      }
  
      // If no differences found, no update needed
      return false;
    },
  } 
  
  parseToElement = (element) => {
    if (!element || element.nodeType) return  "" 
  
    let svgTags = ["svg", "path", "circle", "rect", "line", "polyline", "polygon", "ellipse", "g"];
    let isSvg = svgTags.includes(element.type);
  
    // Create the element, using proper namespace for SVG
    let el = isSvg
      ? document.createElementNS("http://www.w3.org/2000/svg", element.type)
      : document.createElement(element.type);
  
    // Handle text nodes
    if (typeof element === "string" || typeof element === "number" || typeof element === "boolean") {
      el.textContent = element; // Safer alternative to innerHTML
      return el;
    }
  
    // Set attributes
    let attributes = element.props || {};
    for (let key in attributes) {
      if(typeof attributes[key] !== "string" && !acceptedAttributes.includes(key) || !acceptedAttributes.includes(key)) continue; 
      if(key === "ref") {  
        let _key = attributes[key].key;
        // update the ref
        let ref = this.refs.find((r) => r.key == _key);
         if(ref) {
           ref.current = document.querySelector(`[idKey="${_key}"]`) || el;
         }
        el.setAttribute("idKey", _key);
        element.props.idKey = _key
     } 
      else if (key === "key") {
        el.key = attributes[key];
      } else if (key === "className") {
        el.setAttribute("class", attributes[key]);
      } else if (key === "style") {
        let styleObject = attributes[key];
        if (typeof styleObject === "object") {
          for (let styleKey in styleObject) {
            el.style[styleKey] = styleObject[styleKey];
          }
        }
      } else if (key.startsWith("on")) {
        // Event listeners
        const eventType = key.substring(2).toLowerCase();
        const handler = attributes[key];
        this.eventRegistry.set(el, [...(this.eventRegistry.get(el) || []), { event: eventType, handler }]);
        this.addEventListener(el, eventType, handler);
      } else if (attributes[key] !== null && attributes[key] !== undefined  && 
        !key.includes(" ") || !key.includes("-") || !key.includes("_")) {
        try {
          el.setAttribute(key, attributes[key]);
        } catch (error) {
           
        }
      } else   if(typeof attributes[key] === "object" && key !== "style"){
        continue;
      } 
    }
  
    // Handle children
    let children = element.children || [];
    children.forEach((child) => {
      if (Array.isArray(child)) {
        // Recursively process nested arrays
        child.forEach((nestedChild) => el.appendChild(this.parseToElement(nestedChild)));
      } else if (typeof child === "function") {
        // Handle functional components
        let component = memoizeClassComponent(Component, child.name);
        component.Mounted = true;
        component.render =  (props) => child(props);
        let componentElement = component.toElement();
        el.appendChild(componentElement);
      } else if (typeof child === "object") {
        // Nested object children
        el.appendChild(this.parseToElement(child));
      } else if (child !== null && child !== undefined && child !== false) {
        // Text nodes
        el.appendChild(document.createTextNode(child));
      }
    });
  
    return el;
  };
  e(element, props, ...children) {
    if (typeof element === "function") {
      return element();
    }
    return { type: element, props: props || {}, children: children || [] };
  }
  toElement() {
    let children = this.render(this.props); 
    let el = this.parseToElement(children); 
    el.setAttribute("idKey", this.key);
    return el;
  }
  render() {
    return "";
  }
}

function memoizeClassComponent(Component, key) { 
  let instance = memoizes.get(key);
  if (!instance) {
    instance = new Component(key);
    memoizes.set(key, instance); 
  }
  return instance;
}
/**
 * @description - Render jsx Componenet to the DOM
 * @param element
 * @param container
 */
export function render(element, container) {
  // CLEAR STATE ON RELOAD
  if (!isServer) {
    window.addEventListener("beforeunload", () => {
       let keys = Object.keys(sessionStorage);
       keys.forEach((key) => {
          if (key.startsWith("state_")) {
            sessionStorage.removeItem(key);
          }
        });
    });
  }
  if (isClassComponent(element)) {
    const instance = new element;
    instance.Mounted = true;
    let el = instance.toElement();
    instance.element = el;
    container.innerHTML = "";
    container.replaceWith(el);
  } else {
    let memoizedInstance = memoizeClassComponent(Component, element.name);
    memoizedInstance.Mounted = true;
    element = element.bind(memoizedInstance);

    memoizedInstance.render = (props) => element(props);
    if (element.name == "default") {
      throw new Error("Function name Must be a unique function name as it is used for a element key");
    }
    memoizedInstance.key = element.name;
    let el = memoizedInstance.toElement();
    el.key = element.name;
    container.innerHTML = "";
    container.replaceWith(el);
  }
}
