/**
 * @method strictMount
 * @description  This method allows you to await until the component is mounted before running a callback
 * @param {Component key} key 
 * @param {Function} callback 
 */
export const strictMount = (key, callback) => {
   
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
    /**
     * @type {string}
     * @description The key for the component. used to identify the component in the DOM
     */
    this.key = null;
    /**
     * @private
     */
    this.components = {};
    this.mounted = false;  
    this.checkIFMounted();
    this.memoizes = []
    /**
     * @private
     */
    this.functions = []   
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
        /**
         * @method log
         * @description  This method is used to log the request and response
         * @param {String} type
         */
        log: (type) => {},
        /**
         * @method setQuery
         * @description  This method is used to set the query object for the current route
         */
        setQuery: (query) => {},
        
  }
  /**
   * @method router
   * @description use router methods directly from the parent component
   */

   this.router = {
      /**
       * @method use
       * @description add a middleware to the current route
       * @param {Function} middleware
       * @returns {void}
       */
      use: (/**@type {Function} */ middleware) => {},
   }
}

/**
 * @method createComponent
 * @description  This method allows you to create a component from a class or function
 * @param {Component} component 
 * @param {Object} props 
 * @param {Array} children 
 */
  createComponent(/**@type {Component}**/component, props, children) {
    
  }
  /**
   * @private
   */
  reset(){
     
  }
  /**
   * @method memoize
   * @description  This method allows you to memoize a component which when rerendered will not be reinstantiated
   * @param {Component} component 
   */
  memoize(/**@type {Component}**/component){  
    
  }
  /**
   * @method parseStyle
   * @description  This method allows you to parse a jsx style object to a string
   * @param {object} styles 
   */
  parseStyle(styles){ 
     
  }
  /** 
   * @private
   */
  bindMount(){ 
  }

  /**
   * Hydrates the component by updating the HTML content if it has changed.
   * @private
   */

 domDifference(oldDom, newDom) {
   
  }
  /**
   * @private
   * @param {*} diff 
   */
  
   updateChangedElements(diff) {
     
  }
  
  /**
   * @method hydrate
   * @description  This method allows you to hydrate a component
   * @private
   * @param {*} hook 
   */
   hydrate(hook) {
    
  }
  
 
  /**
   * @method patch
   * @description  This method allows you to patch the dom
   * @private 
   * @param {*} oldElements 
   * @param {*} newElements 
   */
  
  patch(oldElements, newElements) {
   
  }
  
  
  
  

  /**
   * Handles an object by parsing it as JSON and evaluating it.
   * @param {string} obj - The object to handle.
   * @returns {*} - The evaluated object.
   * @prvate
   */
  handleObject(obj) {
    
  }

  

  /**
   * Binds a function to the component.
   * @param {string} funcData - The function data.
   * @param {string} p - The parameter.
   * @param {string} ref - The reference.
   * @param {string} paramNames - The parameter names.
   * @param {...*} params - The parameters.
   * @returns {string} - A valid inline JS function call.
   */
  bind(funcTion,isTerny, jsx,ref, paramNames, ...params) {
    
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
  if (!this.state[key]) {
    this.state[key] = initialState;
  }

  /**
   * Get the current state value.
   *
   * @returns {T} The current state value.
   */
  let updatedValue = () =>  this.state[key];

  const getValue = updatedValue();

  /**
   * Set a new value for the state.
   *
   * @param {T} newValue - The new value to set.
   * @param {Function} hook - The hook to hydrate after setting the value.
   */
  const set = (newValue, hook) => {
    this.state[key] = newValue;
    this.hydrate(hook);
  };

 

  return  [getValue, set];
}

  

 /**
  *  useRef hook.
  * @param {string} key 
  * @param {any} initialState 
  * @returns  {{ current: HTMLElement|any, bind: string }} - An object containing the current value and a bind string.
  */
  useRef(key = null, initialState) {
    
  }

  /**
   * useReducer hook.
   * @param {string} key - The key for the state property.
   * @param {*} initialState - The initial state value.
   * @param {Function} func - The reducer function.
   * @returns {[*, (newValue: *, hook: Function) => void]} - A tuple with getter and setter functions.
   * **/

   useReducer(key = null, initialState, func = null) {
    
  }
  

  /**
   * Placeholder for content to be rendered.
   * @method render
   * @returns {string} - The rendered content.
   */
  render() {}

  /**
   * Checks if the component is mounted and triggers the onMount method.
   * @private
   */
  checkIFMounted() {
    let observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        
        if (mutation.target.querySelector(`[key="${this.key}"]`) && !this.mounted) {
          this.onMount(); 
          this.mounted = true;   
        }
       
        if(Array.from(mutation.removedNodes).find((node) => node.attributes && node.attributes.key && node.attributes.key.value === this.key)){
          this.onUnmount();
          this.reset();  
        }
      })
    })
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  /**
   * Method that is called when the component is mounted.
   * @method onMount
   */
  onMount() {}
  /**
   * Method that is called when the component is unmounted.
   * @method onUnmount
   */
  onUnmount() {}
}

 
 
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
 

 /**
  *  useRef hook.
  * @param {string} key 
  * @param {any} initialState 
  * @returns  {{ current: HTMLElement|any, bind: string }} - An object containing the current value and a bind string.
  */
export const useRef = (initialState) => {
  return {
    /**
     * @description The current value of the ref.
       @type {*}
     */
    current: initialState,
    /**
     * @description A unique string that can be used to bind the ref to an element.
     * @type {HTMLElement|string}
     */
    bind: '',
  };
};

export default {
  Component,  
  useRef,
  useReducer,
  useState,
  strictMount, 
}