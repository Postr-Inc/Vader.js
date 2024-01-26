window.Vader = {
    version: "1.3.3", 
  };
  window.componentRegistry = {};
  let errors = {
    "SyntaxError: Unexpected token '<'": "You forgot to enclose tags in a fragment <></>",
  } 
   
  let mounts = [];
  let hasRan = []
  /**
   * @method strictMount
   * @description  This method allows you to await until the component is mounted before running a callback
   * @param {*} key 
   * @param {*} callback 
   */
  export const strictMount = (key, callback) => {
    let timer = setInterval(() => {
      if (document.querySelector(`[key="${key}"]`) && !hasRan.includes(key)) {
        clearInterval(timer);
        callback();
        hasRan.push(key)
      }
    }, 120);
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
      this.checkIFMounted();
      this.memoizes = []
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
  
    createComponent(/**@type {Component}**/component, props, children) {
       
      function isClass(funcOrClass) {
        return typeof funcOrClass === 'function' &&
          /^class\s/.test(Function.prototype.toString.call(funcOrClass));
      }
      let comp = !isClass(component) ? null : new component(props);
      if (!component) {
        throw new Error("Component must be defined");
      } 
      let c =  new Component(props);
      if(!isClass(component)){ 
        let render = component.toString(); 
         
        
       
        
       c.key =  component.toString().split('key="')[1] ? component.toString().split('key="')[1].split('"')[0] : null;
       
       let comp =  {
          key: c.key,
          render:  () => { 
               return component.apply(c, [props])
           },
          request: this.request,
          isChild: true,
          response:  this.response,
          params:  this.request.params,
          queryParams: this.request.query,
          reset: c.reset.bind(c), 
          onMount: c.onMount.bind(c),
          useState: null,
          router: {
            use: c.router.use.bind(c),
          },
          bindMount: c.bindMount.bind(c),
          memoize: c.memoize.bind(c),
          createComponent: c.createComponent.bind(c),
          isChild: false, 
          useState: c.useState.bind(c),
          parseStyle: c.parseStyle.bind(c),
          bind: c.bind.bind(c),
          useRef: c.useRef.bind(c),
          request: this.request,
          response: this.response,
          useReducer: c.useReducer.bind(c),
          hydrate: c.hydrate.bind(c), 
          onUnmount: c.onUnmount.bind(c), 
          parentNoe: this,
       } 
       c.render = comp.render;
       c = comp;  
         
     
     } else{
        comp['props'] = props;
        comp.children = children; 
        comp.props.children = children.join('')
        comp.parentNode  = this;
        comp.request = this.request;
        comp.response = this.response;
        comp.key = props.key || null;
        c = comp;
      }
   
      
       
       
      if(!this.components[props.key]){
        this.components[props.key] =  c
      }  
      !this.children.includes(c) ? this.children.push(c) : null
      return this.components[props.key] 
    }
    reset(){ 
      Object.keys(this.components).forEach((key) => {
         this.components[key].onUnmount() 
          delete this.components[key]
      })
      this.state = {} 
      this.children = []
    }
    memoize(/**@type {Component}**/component){  
    
      switch(true){
        case !this.memoizes.includes(component.key):
          this.memoizes.push(component.key)
          this.components[component.key] = component;
          break;
      }
   
      let comp = this.components[component.key];
      comp.bindMount();
      comp.parentNode = this;
      comp.props = component.props;  
      comp.request = this.request;
      comp.response = this.response;
      comp.onMount = component.onMount.bind(component);
      comp.onUnmount = component.onUnmount.bind(component);
      let h = comp.render() 
      
      if(h && h.split('>,').length > 1){
        h = h.replaceAll('>,', '>')
      }
  
      return `<span key="${component.key}" >${h}</span>`
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
      
        if (hook) { 
          let newDom = new DOMParser().parseFromString(this.render(), 'text/html').body.querySelector(`[ref="${hook}"]`);
          let oldDom = document.querySelector(`[ref="${hook}"]`);
  
        } else {
           
           
            let targetElement = this.key ? document.querySelector(`[key="${this.key}"]`) : null; 
           
            let newDom = new DOMParser().parseFromString(this.render(), 'text/html').body
            newDom = document.createElement('div').appendChild(newDom) 
             
            
            !targetElement ? targetElement = document.querySelector(`[key="${newDom.attributes?.key?.value || null}"]`) : null
            if(!targetElement){  
              console.error('Hydration failed, component not found got ensure you have set key="a value" on the component or this.key inside of function or render method body')
              return
            } 
             
            newDom.querySelectorAll('*').forEach((el) => {
              
              if(el.hasAttribute('key') && el.innerHTML !== document.querySelector(`[key="${el.attributes.key.value}"]`).innerHTML){
                  
                  document.querySelector(`[key="${el.attributes.key.value}"]`).replaceWith(el)
              }
            });
  
            
          
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
     * Binds a function to the component.
     * @param {string} funcData - The function data.
     * @param {string} p - The parameter.
     * @param {string} ref - The reference.
     * @returns {string} - A valid inline JS function call.
     */
    bind(funcTion, jsx,ref, paramNames, ...params) {
       ref = ref + this.key || 2022
     
       let paramObject = {};
     
    
       paramNames = paramNames.replace(/,,/g, ',');
       let newparamnames = paramNames.replaceAll(',,', ',')
        
       for(var i in params){
          let param = params[i]
          let paramname = newparamnames.split(',')[i]
          paramObject[paramname] = param 
       }
   
     
       
        paramNames = paramNames.replace(',,', ',');
        let func = null
        // at the end of spaces or new lines add a ;
        funcTion = funcTion.split('\n').join(';')
        try{
         func =  new Function(`event, ${paramNames}`, ` 
          return (async (event, ${paramNames}) => {    
              ${funcTion.toString()}
          })(event, ${Object.keys(paramObject).join(',')}) 
        `);  
        }catch(e){
           let  { message } = e;
           console.error(`Error in function ${ref} ${message}`)
        }
         func   = func.bind(this)
      
         if(!this.functions.find((f) => f.ref === ref)){
           document.addEventListener(`$dispatch_#id=${ref}`, (e) => {
              let { name,   event } = e.detail;  
              if (name === ref) {  
                let params = this.functions.find((f) => f.ref === ref).params 
                 Object.keys(params).forEach((key) => {
                  if(params[key] instanceof CustomEvent){
                    delete params[key]
                  }
                   
                  params[key] === undefined ? delete params[key] : params[key]
                 })     
                 func(event, ...Object.values(params))
              }
           });
           
        }
       
      window.callFunction = (name, event) => {  
        document.dispatchEvent(new CustomEvent(`$dispatch_#id=${name}`, { detail: { name: name, params: null, event: event } }));
      }   
      !this.functions.find((f) => f.ref === ref) ? this.functions.push({ref: ref, params: paramObject})  :  null
      
       
      return jsx ?  funcTion :  `((event)=>{event.target.ev = event; callFunction('${ref}', event.target.ev)})(event)`;
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
  
    let getValue = updatedValue();
  
    /**
     * Set a new value for the state.
     *
     * @param {T} newValue - The new value to set.
     * @param {Function} hook - The hook to hydrate after setting the value.
     */
    const set = (newValue, hook) => {
      this.state[key] = newValue;
     
      this.hydrate(hook);
      getValue = updatedValue();
    };
  
   
  
    return  [getValue, set];
  }
  
    
  
    useRef(key = null, initialState) {
      if (!this.state[key]) {
        this.state[key] = initialState;
      }
      const getValue = () =>  document.querySelector(`[ref="${key + this.key}"]`) ||  initialState;
      const set = (newValue) => {
        this.state[key] = newValue;
   
        this.hydrate();
      };
     
      
      return  {
         bind: key + this.key,
         current: getValue(),
      }
    }
  
     useReducer(key = null, initialState, func = null) {
     
      if (!this.state[key]) {
        this.state[key] = initialState;  
      }
      const getValue = () => this.state[key];
      let value = getValue();
      const set = (newValue, hook) => {  
        const nextState = func(value, newValue) ?? newValue; 
        this.state[key] =  nextState;
        this.hydrate(hook);
        value = getValue(); 
      };
      return [getValue(), set];
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
   *
   * @param {*} initialState - The initial state value for the ref.
   * @returns {{ current: *, bind: string }} - An object containing the current value and a bind string.
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
  
  export class Link extends Component{
    constructor(props){
      super(props)
      this.props = props
      this.link = document.createElement('a')
    }
    render(){
       
      
      this.link.innerHTML = this.props.children
      this.link.setAttribute('id', this.props?.href) 
      this.link.style = this.props?.style
      
      this.link.setAttribute('class', this.props?.class)
      this.link.setAttribute('onclick', `window.history.pushState({}, '', '${this.props?.href}'); window.dispatchEvent(new Event('popstate'));`)
      return this.link.outerHTML
    }
     
  }
  
  export default {
    Component,  
    useRef,
    useReducer,
    useState,
    strictMount,  
    Link
  }