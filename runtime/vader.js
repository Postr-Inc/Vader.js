
window.params = {};
window.Vader = {
  version: "1.3.3", 
};

let errors = {
  "SyntaxError: Unexpected token '<'": "You forgot to enclose tags in a fragment <></>",
}
 
const path = {
  basename: (path) => {
    return path.split("/").pop();
  },

}

window.queryRef = (ref) => {
  return document.querySelector(`[data-ref="${ref}"]`)
}
window.reinvoke = (eventtype, element) => {
  const eventListener = (e) => {
    return e
  };

  // Check if the event listener has not been added before adding it
  if (!element._eventListenerAdded) {
    element.addEventListener(eventtype, eventListener);

    // Set the flag to indicate that the event listener has been added
    element._eventListenerAdded = true;

    // Trigger the event without overwriting existing data or listeners
    element.dispatchEvent(new Event(eventtype));
  }
};




let invokes = []
let hasran = [];
let states = {};
let mounts = [];
export const strictMount = (key, callback) => {
  let timer = setInterval(() => {
    if (document.querySelector('[key="' + key + '"]')) {
      clearInterval(timer);
      callback();
    }
  }, 120);
};

window.delegate = (event) => {
  return event.detail.target
}

let components = {};
 
let style = document.createElement("style");
 document.head.appendChild(style);

const parseStyles = async (styles, className = '') => {
    let css = await fetch(styles).then((res) => res.text());
    let classes = css.split("}");
    let parsedClasses = {};
    classes.forEach((cls) => {
     
      let name = cls.split(".")[1];
      let value = cls.split("{")[1] 
      let keys = value.split(";");
      let newKeys = [];
      keys.forEach((key) => {
        if (key.includes(":")) {
          let newKey = key.split(":")[0].trim();
          let newValue = key.split(":")[1].trim();
          newKeys.push(`${newKey}: "${newValue}"`);
        }
      });
      value = `{${newKeys.join(",")}}`;
     
      
      parsedClasses[name] =  JSON.stringify(value);
    });
    return parsedClasses;
};


export const stylis = {
  /**
   * @method create 
   * @param {*} styles 
   * @returns  {Object} classes
   * @description  This method allows you to create css classes from an object
   */
  create: async (/**@type {string} */ styles) => {
     
    return  await parseStyles(styles);
  },
};

/**
 * @method mem
 * @param {Component} component
 * @returns  {Component} Stateless Component
 * @description  This method allows you to memoize a component - this means it will be intialized only once and can be reused multiple times baased on a static key
 */
export const mem = (/**@type {Component}**/ component) => {
  // ensure component is instance of Component
  switch (true) {
    case !(component instanceof Component):
      throw new Error("component must be an instance of Component");
    case !component.key:
      throw new Error("component must have a static key");
    // check if key was randomly generated
  } 
  let key = component.key;
  if (!components[key]) {
    components[key] = component;
  }

  return  components[key];
};

/**
 * @method invoke
 * @description  This method allows you to invoke a function from its id
 * @param {*} name
 * @param {*} params
 * @returns
 * @example
 * invoke(this.functions['test'], 'hello') // this will invoke the function test with the params hello
 */
 
let functions = {};
 
export const invoke = (func, params) => {
   let name = func.name;
  
   window[name] = function (params) {
      return func(params);
   }
   window[name] =  window[name].bind(this);
   
    
   return `${name}(${params})`;
   
};

/**
 * Represents a component in the Vader framework.
 */
export class Component {
  /**
   * Creates an instance of Component.
   */
  constructor() {
    this.state = {};
    this.key = null;
    this.components = {};
    this.mounted = false; 
    this.currenthtml = null;
    window.listeners = [];
    this.functionMap = new Map();
    this.freeMemoryFromFunctions();
    this.checkIFMounted();
    this.memoizes = []
    
    this.vdom =  []
    
    this.children = []
   
     
    /**
     * Parent of the current component.
     * @type {Component}
     */
    this.parentNode =  {}
    
      /**
       * Request object.
       */
      this.request =  {
        /**
         * @type {string}
         * @description The headers for the current route
         */
        headers:{},
        /**
         * @type {string}
         * @description The method for the current route
         */
        method: "GET",
        /**
         * @type {string}
         * @description params for the given route /:id/:name etc
         */
        params: {},
        /**
         * @type {string}
         * @description path: current route path
         */
        path: "",
        /**
         * @type {string}
         * @description query: query  object for the current route ?name=hello -> {name: 'hello'}
         */
        query: {},
      },
      /**
       * @type {string}
       * @description The response object for the current route
       */
      this.response = {
        /**
         * @method json
         * @description  This method allows you to send json data to the client
         * @param {*} data 
         */
        json: (data) => {},
        /**
         * @method send
         * @description  This method allows you to send text data to the client
         * @param {*} data 
         */
        send: (data) => {},
        /**
         * @method redirect
         * @description  This method allows you to redirect the client to a new route
         * @param {*} path 
         */
        redirect: (path) => {},
        /**
         * @method render
         * @description  render a new component to the client
         *  @param {*} Component
         */
        render: async (Component) => {},
  }
}

  createComponent(/**@type {Component}**/component, props, children) {
     
    if (!component) {
      throw new Error("Component must be defined");
    }
    if(!props.key){
      throw new Error('new components must have a key')
    } 
    let comp = new component(props);
    
    comp['props'] = props;
    comp.children = children; 
    comp.props.children = children.join('')
    comp.parentNode  = this;
    comp.request = this.request;
    comp.response = this.response;
    comp.key = props.key || null;
     
    if(!this.components[props.key]){
      states[props.key] =  {}
    }
    this.components[props.key] = comp
    this.children.push(comp)
    return this.components[props.key] 
  }
  reset(){
    Object.keys(this.components).forEach((key) => {
      states[key] =  {}
    })
    states[this.key] =  {}
    this.components = {}
    this.children = []
  }
  memoize(/**@type {Component}**/component){  
    if(!component.key){
      throw new Error('Component must have a static key')
    }
    switch(true){
      case !this.memoizes.includes(component.key):
        this.memoizes.push(component.key)
        this.components[component.key] = component;
        break;
    }
 
    let comp = this.components[component.key];
    comp.props = component.props; 
    let h = comp.render() 
    
    if(h && h.split('>,').length > 1){
      h = h.replaceAll('>,', '>')
    }

    return `<div key="${component.key}">${h}</div>`
  }
  parseStyle(styles){ 
    let css = ''
    Object.keys(styles).forEach((key) => { 
      let value = styles[key]
       key = key.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase()
       css += `${key}:${value};`
    })
    return css
  }
  bindMount(){
    mounts.push(this) 
  }

  /**
   * Hydrates the component by updating the HTML content if it has changed.
   * @private
   */

 domDifference(oldDom, newDom) {
    let diff = [];
  
    for (let i = 0; i < oldDom.length; i++) {
      let oldEl = oldDom[i];
      let newEl = newDom[i];
  
      if (oldEl && newEl && !oldEl.isEqualNode(newEl)) {
        diff.push({
          type: 'replace',
          old: oldEl,
          new: newEl.cloneNode(true),
        });
      }
    }
  
    return diff;
  }
  
   updateChangedElements(diff) {
    diff.forEach((change) => {
      switch (change.type) {
        case 'replace':
          change.old.parentNode.replaceChild(change.new, change.old);
          break;
        case 'remove':
          change.old.remove();
          break;
        case 'add':
          change.old.appendChild(change.new.cloneNode(true));
          break;
        default:
          break;
      }
    });
  }
  
   hydrate(hook) {
    if (this.key) {
      if (hook) {
        let newDom = new DOMParser().parseFromString(this.render(), 'text/html').body.firstChild;
  
        let oldElements = document.body.querySelectorAll(`[ref="${hook}"]`);
        let newElements = newDom.querySelectorAll(`[ref="${hook}"]`);
        let diff = this.domDifference(oldElements, newElements);
        this.updateChangedElements(diff);
      } else {
        const targetElement = document.querySelector(`[key="${this.key}"]`);
        if (targetElement) {
          targetElement.outerHTML = this.render();
        } else {
          console.error('Target element not found.');
        }
      }
    }
  }
  
 
  
  patch(oldElements, newElements) {
    const diff = this.domDifference(oldElements, newElements);
  
    this.updateChangedElements(diff);
  }
  
  
  
  

  /**
   * Handles an object by parsing it as JSON and evaluating it.
   * @param {string} obj - The object to handle.
   * @returns {*} - The evaluated object.
   * @prvate
   */
  handleObject(obj) {
    try {
      obj = JSON.parse(obj);
    } catch (error) {
      // Handle JSON parsing error if needed
    }
    return eval(obj);
  }

  /**
   * Frees memory from functions that have not been used for a certain period of time.c
   * @private
   */
  freeMemoryFromFunctions() {
    setInterval(() => {
      for (var [key, value] in this.functionMap) {
        if (Date.now() - value.lastUsed > 1000) {
          this.functionMap.delete(key);
        }
      }
    }, 1000);
  }

  /**
   * Binds a function to the component.
   * @param {string} funcData - The function data.
   * @param {string} p - The parameter.
   * @param {string} ref - The reference.
   * @returns {string} - A valid inline JS function call.
   */
  bind(funcData,jsx,ref, paramNames, ...params) {
   
    
    const name = `func_${crypto ? crypto.getRandomValues(new Uint32Array(1))[0] : Math.random()}`;

    var dynamicFunction = async (...params) => {
      
      // Replace double commas with a single comma
      
    
      // Turn params into a destructured object
      let paramObject = {};
      params = params[0] 
   
      paramNames = paramNames.replace(/,,/g, ',');
    let newparamnames = paramNames.replaceAll(',,', ',')
      

      for(var i in params){
        paramObject[newparamnames.split(',')[i]] = params[i]
      }
       
    
      
      paramNames = paramNames.replace(',,', ',');
      let func = new Function(`${paramNames}`, `
        return (async (${paramNames}) => {
           ${funcData}  
        })(${Object.keys(paramObject).join(',')})
      `); 
       await func.bind(this)(...Object.values(paramObject));
      
    };
     

    dynamicFunction = dynamicFunction.bind(this);
    if (!this.functionMap.has(name)) {
      document.addEventListener(`call_${name}`, (e) => {
        
        dynamicFunction(params)
        this.functionMap.set(e.detail.name, {
          lastUsed: Date.now(),
        });
      });
    }

    this.functionMap.set(name, {
      lastUsed: Date.now(),
    });

    window.call = (name, eventdata, params) => {  
      document.dispatchEvent(
        new CustomEvent(`call_${name}`, {
          detail: { name: `call_${name}`, target: eventdata },
        })
      );
    };

    // Return a valid inline js function call
    function jsxCall(){
      document.dispatchEvent(
        new CustomEvent(`call_${name}`, {
          detail: { name: `call_${name}` },
        })
      );
    }
    return jsx ? jsxCall: `
    ((event) => { 
      event.target.setAttribute('data-ref', '${ref}');
      let reference = event.target.getAttribute('data-ref');
      event.target.eventData = event;
      event.target.data = event 
      call('${name}', {event:event.target.data}, '${paramNames}')
    })(event)
    `;
  }

  /**
   * Calls a function with the specified parameters. and dispatches an event.
   * @param {string} func - The function name.
   * @param {...*} params - The function parameters.
   */
  callFunction(func,  isInlineJsx, ...params) {
    if(!isInlineJsx && params[0] && params[0].detail){
      let el = params[0].detail.target.event.target 
      params[0].data =   el.value; 
      params[0] = params[0].detail.target.event
    } 
    func = func.replace(/'/g, '');
     document.dispatchEvent(new CustomEvent(func, { detail: { name: func, params: params } }));
  }

  /**
   * Uses a function with the specified parameters.
   * @param {Function} func - The function to use.
   * @param {string} params - The function parameters.
   * @param {boolean} [isInlineJsx=false] - Indicates if the function is an inline JSX.
   * @returns {string} - The function call.
   */
  useFunction(func, params, isInlineJsx = false) {
    const sanitizedFuncName = func.name.trim().replace(/\s+/g, '_');

    if (!invokes.includes(`'${sanitizedFuncName}'${this.key}`)) {
      invokes.push(`'${sanitizedFuncName}'${this.key}`); 
      document.addEventListener(`call_${sanitizedFuncName}_${this.key}`, (e) => { 
        let { name, params } = e.detail;
        if (name === `call_${sanitizedFuncName}_${this.key}`) {
          let isarray = Array.isArray(params);

          func(...(isarray ? params : [params]));
        }
      });

      func = func.bind(this);
    }

    try {
      params = JSON.parse(params);
    } catch (error) {
      // Handle JSON parsing error if needed
    }

    const returnString = isInlineJsx
      ? `'call_${sanitizedFuncName}_${this.key}'`
      : `document.dispatchEvent(new CustomEvent('call_${sanitizedFuncName}_${this.key}', { detail: { name: 'call_${sanitizedFuncName}_${this.key}', params: ${JSON.stringify(params)} } }))`;

    return returnString;
  }

  /**
 * useState hook.
 *
 * @template T
 * @param {string} key - The key for the state property.
 * @param {T} initialState - The initial state value.
 * @returns {[() => T, (newValue: T, hook: Function) => void]} - A tuple with getter and setter functions.
 */
 useState(key, initialState) { 
  if (!states[this.key][key]) {
    states[this.key][key] = initialState;
  }

  /**
   * Get the current state value.
   *
   * @returns {T} The current state value.
   */
  let updatedValue = () => states[this.key][key];

  const getValue = updatedValue();

  /**
   * Set a new value for the state.
   *
   * @param {T} newValue - The new value to set.
   * @param {Function} hook - The hook to hydrate after setting the value.
   */
  const set = (newValue, hook) => {
    states[this.key][key] = newValue;
    this.hydrate(hook);
  };

 

  return  [getValue, set];
}

  

  useRef(key = null, initialState) {
    if (!this.state[key]) {
      this.state[key] = initialState;
    }
    const getValue = () => this.state[key];
    const set = (newValue) => {
      this.state[key] = newValue;
      this.hydrate();
    };
   
    
    return  {
       bind: key + this.key,
       current:   document.querySelector(`[ref="${key + this.key}"]`) ||  initialState
    }
  }

  useReducer(key = null, initialState, func = null) {
    const getValue = () => this.state[key];
    const set = (newValue) => {
       
      this.hydrate();
    };
    return [getValue, set];
  }

  /**
   * Placeholder for content to be rendered.
   * @method render
   */
  render() {}

  /**
   * Checks if the component is mounted and triggers the onMount method.
   * @private
   */
  checkIFMounted() {
    if (this.mounted || !this.key) return;
    let timer = setInterval(() => {
      if (document.querySelector('[key="' + this.key + '"]')) {
        clearInterval(timer);
        this.mounted = true;
        this.onMount();
      }
    }, 120);
  }

  /**
   * Method that is called when the component is mounted.
   * @method onMount
   */
  onMount() {}
}





let cache = {};
/**
 * @method require
 * @description  Import  CommonJS modules like Node.js for the browser
 * @param {string} path
 * @param {Boolean} noresolve - used to tell if the path should be automatically handled or manually handled - this is false by default
 * @returns
 */
export const require = async (path, noresolve = false) => {
   
  if (cache[path]) {
    return cache[path];
  }
  let file = ''
  try {
    file = await fetch(path).then((res) => res.text());
    cache
  } catch (error) {
     console.error(error)
  }

  file = file + `\n//# sourceURL=${path}\n`;

  let filetype = path.split(".").pop();
  switch (true) {
    case filetype === "js":
      let exports = file.match(/module.exports\s*=\s*{.*}/gs) || file.match(/exports\s*=\s*{.*}/gs);
      exports = exports ? exports[0] : null;

      if (exports) {
        let keys = exports.split("{")[1].split("}")[0].split(",");
        let returnstring = "";
        keys.forEach((key) => {
          key = key.trim();
          returnstring += `${key},`;
        });
        returnstring = `return {${returnstring}}`;
        file = file += returnstring;
        file = file.replaceAll(exports, "");
      }
      
      cache[path] = new Function(`return (async () => { ${file} })()`)();
      return cache[path]
    case filetype === "jsx": 
    cache[path] = new Function(`return (async () => { ${file} })()`)();
    return  cache[path]
       
  } 
};


window.require = require;
/**
 *  useState hook.
 *
 * @param {string} key - The key for the state property.
 * @param {*} initialState - The initial state value.
 * @returns {[*]} - A tuple with the current state value and a setter function.
 */
export const useState = (key, initialState) => {
  if (!states[key]) {
    states[key] = initialState;
  }

  /**
   * Get the current state value.
   *
   * @returns {*} The current state value.
   */
  let updatedValue = () => states[key];

  /**
   * Set a new value for the state.
   *
   * @param {*} newValue - The new value to set.
   * @param {Function} hook - The hook to hydrate after setting the value.
   */
  const set = (newValue, hook) => {
    states[key] = newValue;
    this.hydrate(hook);
  };

  return [states[key], set];
};

 

/**
 * @method useReducer
 * @param {*} initialState 
 * @param {*} reducer 
 * @returns  {Array} [value, set]
 */
export const useReducer = (/**@type {*}**/initialState, /**@type {function}**/reducer) => {
  return [initialState, (newValue) => {}];
};

const constants = {};
let constantCounter = 0;

export const constant = (value) => {
  const key = `constant_${constantCounter++}`;
  if (!constants[key]) {
    constants[key] = value;
  }
  return constants[key];
};

 /**
 *  useRef hook.
 *
 * @param {*} initialState - The initial state value for the ref.
 * @returns {{ current: *, bind: string }} - An object containing the current value and a bind string.
 */
export const useRef = (initialState) => {
  return {
    /**
     * @description The current value of the ref.
     
     */
    current: initialState,
    /**
     * @description A unique string that can be used to bind the ref to an element.
     */
    bind: '',
  };
};

export default {
  Component,
  require,
  invoke,
  mem,
  constant,
  useRef,
  useReducer,
  useState,
  strictMount,
  stylis,
}