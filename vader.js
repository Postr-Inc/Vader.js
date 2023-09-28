let dom = /**@type {Obect}  **/ {};
let states = {};
/**
 * @function markdown
 * @param {String} content
 * @description Allows you to convert markdown to html 
 */
function markdown(content) {
  const lines = content.split('\n').filter((line) => line !== '').map((line) => line.trim());
   
  let result = '';

  lines.forEach((line) => {
    let heading = line.match(/^#{1,6}\s/);
    let bold = line.match(/\*\*(.*?)\*\*/g);
    let italic = line.match(/\*(.*?)\*/g);
 
    let link = line.match(/\[(.*?)\]\((.*?)\)/g);
    let ul = line.match(/^\-\s/);
    let ol =  line.match(/^\d\.\s/);
  
    let li = line.match(/^\s/);
    let hr = line.match(/^\-\-\-\s/);
    let blockquote = line.match(/^\>\s/);
    let image = line.match(/\!\[(.*?)\]\((.*?)\)/g);
    
    
    let codeBlock = line.match(/\`\`\`/g);
    let codeBlockEnd = line.match(/\`\`\`/g);
    let code = line.match(/\`(.*?)\`/g);
    

     
    if (heading) {
       // @ts-ignore
      let headingLevel = heading[0].match(/#/g).length;
      line = line.replace(heading[0], `<h${headingLevel}>`);
      line += `</h${headingLevel}>`;
    }
    if (bold) {
      bold.forEach((b) => {
        line = line.replace(b, `<strong>${b.replace(/\*\*/g, "")}</strong>`);
      });
    }
    if (italic) {
      italic.forEach((i) => {
        line = line.replace(i, `<em>${i.replace(/\*/g, "")}</em>`);
      });
    }

   
    if(link){
      link.forEach((l) => {
         // @ts-ignore
        let text = l.match(/\[(.*?)\]/g)[0].replace(/\[|\]/g, "");
         // @ts-ignore
        let href = l.match(/\((.*?)\)/g)[0].replace(/\(|\)/g, "");
        line = line.replace(l, `<a href="${href}">${text}</a>`);
      });
    }
    if (ul) {
      line = line.replace(ul[0], `<li style="list-style-type: disc;">`);
      line += `</li>`;
    }
    if (ol) {
      line = line.replace(ol[0], `<li style="list-style-type: decimal;">`);
      line += `</li>`;
    }
    if (hr) {
      line = line.replace(hr[0], `<hr/>`);
    }
    if (blockquote) {
      line = line.replace(blockquote[0], `<blockquote>`);
      line += `</blockquote>`;
    }
    if (image) {
      image.forEach((i) => {
        // @ts-ignore
        let alt = i.match(/\[(.*?)\]/g)[0].replace(/\[|\]/g, "");
         // @ts-ignore
        let src = i.match(/\((.*?)\)/g)[0].replace(/\(|\)/g, "");
        i.replace(i, `<img src="${src}" alt="${alt}"/>`);
        line = line.replace(i, `<img src="${src}" alt="${alt}"/>`).replace('!','')
      });
    }
    if (li) {
      line = line.replace(li[0], `<li>`);
      line += `</li>`;
    }
    if (codeBlock) {
      line = line.replace(codeBlock[0], `<pre><code>`);
    }
    if (codeBlockEnd) {
      line = line.replace(codeBlockEnd[0], `</code></pre>`);
    }

    if (code) {
      code.forEach((c) => {
        line = line.replace(c, `<code
        style="background-color: #f5f5f5; padding: 5px; border-radius: 5px;
        
        "
        >${c.replace(/\`/g, "")}</code>`);
      });
    }
   
    


    result += `${line}\n`;
  });

  return result;
}

 

/**
 * @function useRef
 * @description Allows you to get reference to DOM element
 * @param {String} ref
 * @returns {void | Object} {current, update}
 */
 
export const useRef = (ref) => {
  const element = document.querySelector(`[ref="${ref}"]`);
  const getElement = () => element;

  const update = (data) => {
    const newDom = new DOMParser().parseFromString(data, "text/html");
    const newElement = newDom.body.firstChild;

    if (element) {
      // @ts-ignore
      const isDifferent = !newElement.isEqualNode(element);
      if (isDifferent) {
        // @ts-ignore
        element.parentNode.replaceChild(newElement, element);
      }
    }
  };

  return {
    current: getElement(),
    update,
  };
};

let components = [];
/**
 * @class Component
 * @description Allows you to create a component
 * @returns {void}
 * @example
 * import { Vader } from "../../dist/vader/index.js";
 * export class Home extends Vader.Component {
 *  constructor() {
 *   super();
 * }
 *  async render() {
 *  return this.html(`
 *     <div className="hero p-5">
 *        <h1>Home</h1>
 *     </div>
 *   `);
 *  }
 * }
 */
export class Component {
  constructor() {
    this.states = {};
    //@ts-ignore
    this.name = this.constructor.name;
    this.executedEffects = {};
    this.storedProps = {};
    this.componentMounted = false;
    this.hasMounted = false;
    this.$_signal_subscribers = [];
    /**
     * @property {Array} $_signal_subscribers_ran
     * @description Allows you to keep track of signal subscribers
     * @private
     */
    this.$_signal_subscribers_ran = [];
    this.effects = {};
    this.$_useStore_subscribers = [];
    this.init();
    this.Componentcontent = null;
    this.$_signal_dispatch_event = new CustomEvent("signalDispatch", {
      detail: {
        hasUpdated: false,
        state: null,
      },
    });
    this.snapshots = [];
    
  }

  /**
   * @method adapter
   * @description Allows you to create an adapter - this is used to create  custom logic
   *  
   * 
   */
  adapter() {
    return  
  }
  init() {
    this.registerComponent();
  }

  registerComponent() {
    components.push(this);
  }

  /**
   * @method setState
   * @description Allows you to set state
   * @param {String} key
   * @param {*} value
   * @returns {void}
   * @example
   * this.setState('count', 1)
   * */
  setState(key, value) {
    this.states[key] = value;
    this.updateComponent();
  }
  /**
   * @method componentUnmount
   * @description Allows you to run code after component has unmounted
   * @type {VoidFunction}
   * @returns {void}
   */
  unmount() {
    this.componentMounted = false;
    this.componentWillUnmount();
    // @ts-ignore
    document.querySelector(`[data-component="${this.name}"]`).remove();
    if (!document.querySelector(`[data-component="${this.name}"]`)) {
      components = components.filter(
        (component) => component.name !== this.name
      );
    }
  }

  /**
   * @method componentUpdate
   * @description Allows you to run code after component has updated
   * @param {Object} prev_state
   * @param {Object} prev_props
   * @param {Object} snapshot
   * @returns {void}
   * @example
   * componentUpdate(prev_state, prev_props, snapshot) {
   * console.log(prev_state, prev_props, snapshot)
   * }
   * */
  componentUpdate(prev_state, prev_props, snapshot) {}
  /**
   * @method componentDidMount
   * @description Allows you to run code after component has mounted
   */
  componentDidMount() {}

  /**
   * @method componentWillUnmount
   * @description Allows you to run code before component unmounts
   * @type {VoidFunction}
   * @returns {void}
   */
  componentWillUnmount() {}

  /**
   * @method signal
   * @description Allows you to create a signal
   * @param {String} key
   * @param {any} initialState
   * @returns  {Object} {subscribe, cleanup, dispatch, call, set, get}
   * @example
   * let signal = this.signal('count', 0);
   * signal.subscribe((value) => {
   * console.log(value)
   * }, false) // false means it will run every time
   * signal.subscribe((value) => {
   * console.log(value)
   * }, true) // true means it will run once
   * signal.call() // this will call all subscribers
   * signal.set(1) // this will set the value of the signal
   * signal.get() // this will get the value of the signal
   * signal.cleanup() // this will remove all subscribers
   */
  signal = (key, initialState) => {
    let hasCaller = false;
    let [state, setState] = this.useState(key, initialState, () => {
      if (this.$_signal_subscribers.length > 0) {
        for (var i = 0; i < this.$_signal_subscribers.length; i++) {
          if (!hasCaller) {
            if (
              this.$_signal_subscribers[i].runonce &&
              // @ts-ignore
              this.$_signal_subscribers_ran.includes(
                this.$_signal_subscribers[i]
              )
            ) {
              break;
            } else {
              this.$_signal_subscribers[i].function(state);
              this.$_signal_subscribers_ran.push(this.$_signal_subscribers[i]);
              return;
            }
          }
        }
      } else {
        this.$_signal_dispatch_event.detail.hasUpdated = true;
        this.$_signal_dispatch_event.detail.state = state;
        window.dispatchEvent(this.$_signal_dispatch_event);
      }
    });
    /**
     * @function  $_signal_subscribe
     * @description Allows you to subscribe to a signal
     * @param {*} fn
     * @param {*} runonce
     * @returns {void}
     *
     */
    this.$_signal_subscribe = (fn, runonce) => {
      this.$_signal_subscribers.push({
        function: fn,
        runonce: runonce,
      });
    };
    this.$_signal_cleanup = (fn) => {
      this.$_signal_subscribers = this.$_signal_subscribers.filter(
        (subscriber) => subscriber.function !== fn
      );
    };
    this.$_signal_dispatch = () => {
      for (var i = 0; i < this.$_signal_subscribers.length; i++) {
        if (
          this.$_signal_subscribers[i].runonce &&
          // @ts-ignore
          this.$_signal_subscribers_ran.includes(this.$_signal_subscribers[i])
        ) {
          break;
        } else {
          this.$_signal_subscribers[i].function(state);
          this.$_signal_subscribers_ran.push(this.$_signal_subscribers[i]);
        }
      }
    };
    this.$_signal_get = () => {
      return state;
    };
    this.$_signal_call = () => {
      hasCaller = true;
      // @ts-ignore
      this.$_signal_dispatch();
    };
    /**
     * @function  $_signal_set
     * @description Allows you to set the value of a signal
     * @param {*} detail
     */
    this.$_signal_set = (detail) => {
      setState(detail);
    };

    return {
      /**
       * @function subscribe
       * @description Allows you to subscribe to a signal
       * @param {*} fn
       * @param {*} runonce
       */
      subscribe: this.$_signal_subscribe,
      /**
       * @function cleanup
       * @description Allows you to cleanup a signal
       * @param {*} fn
       * @returns {null}
       */
      cleanup: this.$_signal_cleanup,
      /**
       * @function dispatch
       * @description Allows you to dispatch a signal
       * @returns {null}
       */
      dispatch: this.$_signal_dispatch,
      /**
       * @function call
       * @description Allows you to call a signal
       * @returns {null}
       */
      call: this.$_signal_call,
      /**
       * @function set
       * @description Allows you to set the value of a signal
       * @param {*} detail
       * @returns {null}
       */
      set: this.$_signal_set,
      /**
       * @function get
       * @readonly
       * @description Allows you to get the value of a signal
       * @returns {any}
       */
      get: this.$_signal_get,
    };
  };
  /**
   * @method useAuth
   * @description Allows you to create an auth object
   * @param {Object} options
   * @param {Array} options.rulesets
   * @param {Object} options.user
   * @returns {Object} {can, hasRole, canWithRole, assignRule, revokeRule, canAnyOf, canAllOf, canGroup}
   * @example
   * let auth = this.useAuth({
   * rulesets: [
   * {
   * action: 'create',
   * condition: (user) => {
   * return user.role === 'admin'
   *  }
   *  }
   * ],
   *  user: {
   * role: 'admin'
   * }
   * })
   * auth.can('create') // true
   */
  useAuth(options) {
    /**@type {Array}**/
    let rules = options.rulesets;
    if (!rules) {
      throw new Error("No rulesets provided");
    }
    /**@type {Object}**/
    let user = options.user;
    let auth = {
      can: (action) => {
        let can = false;
        rules.forEach((rule) => {
          if (rule.action === action) {
            if (rule.condition(user)) {
              can = true;
            }
          }
        });
        return can;
      },
      /**
       * @function hasRole
       * @description Allows you to check if user has a role
       * @param {String} role
       * @returns {Boolean}
       */
      hasRole: (role) => {
        return user.role && user.role.includes(role);
      },
      /**
       * @function canWithRole
       * @param {String} action
       * @param {String} role
       * @returns
       */
      canWithRole: (action, role) => {
        return auth.can(action) && auth.hasRole(role);
      },
      assignRule: (rule) => {
        if (
          !rules.some((existingRule) => existingRule.action === rule.action)
        ) {
          rules.push(rule);
        }
      },
      revokeRule: (action) => {
        rules = rules.filter((rule) => rule.action !== action);
      },
      canAnyOf: (actions) => {
        return actions.some((action) => auth.can(action));
      },
      canAllOf: (actions) => {
        return actions.every((action) => auth.can(action));
      },
      canGroup: (actions, logicalOperator = "any") => {
        return logicalOperator === "any"
          ? auth.canAnyOf(actions)
          : auth.canAllOf(actions);
      },
    };
    return auth;
  }
  /**
   * @method useReducer
   * @description Allows you to create a reducer
   * @param {*} key
   * @param {*} reducer
   * @param {*} initialState
   * @url - useReducer works similarly to - https://react.dev/reference/react/useReducer
   * @returns  {Array} [state, dispatch]
   * @example
   *  let [count, setCount] = this.useReducer('count', (state, action) => {
   *   switch (action.type) {
   *   case 'increment':
   *     return state + 1
   *   case 'decrement':
   *     return state - 1
   *   default:
   *    throw new Error()
   *    }
   *  }, 0)
   *  setCount({type: 'increment'})
   */
  useReducer(key, reducer, initialState) {
    if (!this.states[key]) {
      this.states[key] = initialState;
    }
    return [
      this.states[key],
      /**
       * @function dispatch
       * @description Allows you to dispatch a reducer
       * @param {*} action
       * @returns {void}
       */
      (action) => {
        this.states[key] = reducer(this.states[key], action);
        this.updateComponent();
      },
    ];
  }
  runEffects() {
    Object.keys(this.effects).forEach((component) => {
      this.effects[component].forEach((effect) => {
        if (!this.executedEffects[effect]) {
          effect();
          this.executedEffects[effect] = true;
        }
      });
    });
  }
  /**
   * @method useSyncStore
   * @description Allows you to create a store
   * @param {String} storeName
   * @param {*} initialState
   * @returns  {Object} {getField, setField, subscribe, clear}
   * @example
   *  let store = this.useSyncStore('store', {count: 0})
   *  store.setField('count', 1)
   *  store.getField('count') // 1
   *
   */
  useSyncStore(storeName, initialState) {
    let [storedState, setStoredState] = this.useState(
      storeName,
      initialState ||
        // @ts-ignore
        localStorage.getItem(`$_vader_${storeName}`, (s) => {
          localStorage.setItem(`$_vader_${storeName}`, JSON.stringify(s));
          this.$_useStore_subscribers.forEach((subscriber) => {
            subscriber(s);
          });
        }) ||
        {},

    );

    const getField = (fieldName) => {
      return storedState[fieldName];
    };
    const setField = (fieldName, value) => {
      const newState = { ...storedState, [fieldName]: value };
      setStoredState(newState);
    };
    const subscribe = (subscriber) => {
      return this.$_useStore_subscribers.push(subscriber);
    };

    const clear = (fieldName) => {
      let newState = storedState;
      delete newState[fieldName];
      setStoredState(newState);
    };
    return {
      getField,
      setField,
      subscribe,
      clear,
    };
  }
  /**
   * @method useState
   * @description Allows you to create a state
   * @param {String} key
   * @param {*} initialValue
   * @param {*} callback
   * @url - useState works similarly to - https://react.dev/reference/react/useState
   * @returns  {Array} [state, setState]
   * @example
   *  let [count, setCount] = this.useState('count', 0, () => {
   *    console.log('count has been updated')
   *   })
   *
   *   setCount(count + 1)
   */
  useState(key, initialValue, callback = null) {
    
   if(!this.states[key]){
    this.states[key] = initialValue;
   }
   
     
    return [
      this.states[key],
      /**
       * @function setState
       * @description Allows you to set state
       * @param {*} value
       * @returns {void}
       */
      (value) => {
        this.states[key] = value;
        this.updateComponent();
        // @ts-ignore
        typeof callback === "function" ? callback() : null;
      },
    ];
  }

  /**
   * @function useEffect
   * @param {*} effectFn
   * @param {*} dependencies
   * @description Allows you to run side effects
   * @deprecated - this is no longer suggested please use vader signals instead
   * @returns {Object} {cleanup}
   */
  useEffect(effectFn, dependencies) {
    if (!this.effects[this.name]) {
      this.effects[this.name] = [];
    }
    this.effects[this.name].push(effectFn);

    if (dependencies.length > 0) {
      dependencies.forEach((d) => {
        if (d.set) {
          throw new Error(
            "signal found, do not use effect and signals at the same time - signals are more efficient"
          );
        }
      });
    } else if (!this.hasMounted) {
      effectFn();
      this.hasMounted = true;
    }

    return {
      cleanup: () => {
        this.effects[this.name] = this.effects[this.name].filter(
          (effect) => effect !== effectFn
        );
      },
    };
  }
  /**
   * @method $Function
   * @description Allows you to create a function in global scope
   * @returns {Function}
   * @example
   * let func = this.$Function(function add(e, a){
   *  return e +  a
   * })
   * @param {*} fn
   */
  $Function(fn) {
    // @ts-ignore
    if (!typeof fn === "function") {
      throw new Error("fn must be a function");
    }
    let name = fn.name;
    if (!name) {
      name = "anonymous" + Math.floor(Math.random() * 100000000000000000);
    }
    window[name] = fn;
    // @ts-ignore
    return `window.${name}()`;
  }

  // Add other methods like render, useEffect, useReducer, useAuth, etc.

  updateComponent() {
    const fragment = document.createDocumentFragment();
    Object.keys(components).forEach(async (component) => {
      const { name } = components[component];
      const componentContainer = document.querySelector(
        `[data-component="${name}"]`
      );

      let time = new Date().getTime().toLocaleString();
      /**
       * @property {Object} snapshot
       * @description Allows you to keep track of component snapshots
       * @private
       * @returns {Object} {name, time, prev_state, prev_props, content}
       */
      let snapshot = {
        name: name,
        time: time,
        prev_state: this.states,
        prev_props: this.storedProps,
        // @ts-ignore
        content: componentContainer.innerHTML,
      };

      if (!componentContainer) return;
      const newHtml = await new Function(
        "useState",
        "useEffect",
        "useAuth",
        "useReducer",
        "useSyncStore",
        "signal",
        "rf",
        "props",
        "render",
        "return `" + (await this.render()) + "`;"
      )(
        this.useState,
        this.useEffect,
        this.useAuth,
        this.useReducer,
        this.useSyncStore,
        this.signal,
        this.render
      );

      if (newHtml !== componentContainer.innerHTML) {
        if (this.snapshots.length > 0) {
          let lastSnapshot = this.snapshots[this.snapshots.length - 1];
          if (lastSnapshot !== snapshot) {
            this.snapshots.push(snapshot);
          }
        } else {
          this.snapshots.push(snapshot);
        }
        this.componentUpdate(
          snapshot.prev_state,
          snapshot.prev_props,
          snapshot.content
        );
        // batch updates
        fragment.appendChild(
          document.createRange().createContextualFragment(newHtml)
        );
        componentContainer.innerHTML = "";
        componentContainer.appendChild(fragment);
        this.runEffects();
      }
    });
  }
  /**
   * @method validateClassName
   * @param {String} className
   * @private
   * @returns {Boolean}
   */
  validateClassName(className) {
    // validate classNames ensure they are camelCase but also allow for - and _
    return /^[a-zA-Z0-9-_]+$/.test(className);
  }

  /**
   * The `html` method generates and processes HTML content for a component, performing various validations and tasks.
   *
   * @param {String} strings - The HTML content to be processed.
   * @param {...any} args - Dynamic values to be inserted into the template.
   * @returns {string} - The processed HTML content as a string.
   *
   * @throws {SyntaxError} - Throws a `SyntaxError` if image-related attributes are missing or invalid.
   * @throws {Error} - Throws an `Error` if there are issues with class names or relative paths.
   *
   * @example
   * // Example usage within a component:
   * const myComponent = new Component();
   * const htmlContent = myComponent.html`
   *   <div>
   *     <img src="/images/example.jpg" alt="Example Image" />
   *   </div>
   * `;
   * document.body.innerHTML = htmlContent;
   *
   * @remarks
   * The `html` method is a core function used in component rendering. It allows you to define and generate HTML content within your component while enforcing best practices and accessibility standards. The method performs several essential tasks:
   *
   * 1. **Image Validation**: It checks images for the presence of 'alt' attributes and their validity.
   *    - Throws a `SyntaxError` if an image is missing the 'alt' attribute.
   *    - Throws a `SyntaxError` if the 'alt' attribute is empty.
   *    - Checks for an 'aria-hidden' attribute for image elements.
   *
   * 2. **Class Attribute Handling**: It enforces class attribute usage and allows optional configuration via comments.
   *    - Throws an `Error` if 'class' attributes are used without permission.
   *    - Supports 'className' attributes for class definitions.
   *    - Allows or disallows class-related comments based on your configuration.
   *
   * 3. **Relative Path Handling**: It processes relative paths in 'href' and 'src' attributes, ensuring proper routing.
   *    - Converts relative 'href' attributes to anchor links with appropriate routing.
   *    - Converts relative 'src' attributes to absolute paths with 'public' directories.
   *
   * 4. **Custom Component Attributes**: It supports adding a 'data-component' attribute to the root element.
   *    - Ensures that the 'data-component' attribute is present for component identification.
   *
   * 5. **Lifecycle Method Invocation**: It invokes the `componentDidMount` method if called from a 'render' context.
   *    - Executes `componentDidMount` to handle component initialization once the DOM is ready.
   *
   * @see {@link Component}
   * @see {@link Component#componentDidMount}
   */
  
  html(strings, ...args) {
    // @ts-ignore
    if (
      // @ts-ignore
      new Error().stack &&
       // @ts-ignore
      new Error().stack.split("\n").length > 0 &&
       // @ts-ignore
      new Error().stack.split("\n")[2] &&
       // @ts-ignore
      new Error().stack.split("\n")[2].includes("render") &&
      !this.componentMounted
    ) {
      this.componentMounted = true;
      this.componentDidMount();
      console.log("component mounted");
    }

    let result = "";
    for (let i = 0; i < strings.length; i++) {
      result += strings[i];
      if (i < args.length) {
        result += args[i];
      }
    }
   
    result = result.replace(/\\n/g, '\n').trim()
    // replace ` 
    result = result.replace(/`/g, '\`').trim()

    result =  new Function("useRef", `return \`${result}\``)(useRef) 

    if (!result.trim().startsWith("<body>")) {
      console.warn(
        "You should wrap your html in a body tag, vader may not grab all html!"
      );
    }
     
    const dom = new DOMParser().parseFromString(result, "text/html");
    const elements = dom.documentElement.querySelectorAll("*");

    elements.forEach((element) => {
      switch (element.nodeName) {
        case "IMG":
          if (
            !element.hasAttribute("alt") &&
            !document.documentElement.outerHTML
              .trim()
              .includes("<!-- #vader-disable_accessibility -->")
          ) {
            throw new SyntaxError(
              `Image: ${element.outerHTML} missing alt attribute`
            );
          } else if (
            element.hasAttribute("alt") &&
            // @ts-ignore
            element.getAttribute("alt").length < 1 &&
            !document.documentElement.outerHTML
              .trim()
              .includes("<!-- #vader-disable_accessibility -->")
          ) {
            throw new SyntaxError(
              `Image: ${element.outerHTML} alt attribute cannot be empty`
            );
            
          } else if (
            element.hasAttribute("src") &&
            !element.getAttribute("src")?.includes("http") || !element.getAttribute("src")?.includes("https") &&
            !document.documentElement.outerHTML
              .trim()
              .includes("<!-- #vader-disable_accessibility -->")
          ) {
            let prevurl = element.getAttribute("src");
            element.setAttribute("aria-hidden", "true");
            element.setAttribute("hidden", "true");
             // if window.lcoation.pathname includes a html file remove it and only use the path
             let url = window.location.origin +  window.location.pathname.replace(/\/[^\/]*$/, '') + '/public/' + element.getAttribute("src");
            let image = new Image();
            image.src = url;
            image.onerror = () => {
              // @ts-ignore
              element.setAttribute("src", prevurl);
              throw new Error(`Image: ${element.outerHTML} not found`);
            };
            element.setAttribute("src", url);

            image.onload = () => {
              document.querySelectorAll(`img[src="${url}"]`).forEach((img) => {
                img.setAttribute("src", url);
                img.removeAttribute("aria-hidden");
                img.removeAttribute("hidden");
              });
            };
          }
          break;

        default:
          if (element.hasAttribute("ref")) {
            // @ts-ignore
            dom[element.getAttribute("ref")] = element;
          }
          if(element.nodeName === "MARKDOWN"){
            element.innerHTML = markdown(element.innerHTML.replace(/\\n/g, '\n').trim())
          }

          if (element.hasAttribute("class")) {
            const allowClassComments =
              document.documentElement.outerHTML.includes(
                "<!-- #vader-allow_class -->"
              );
            if (!allowClassComments) {
              console.warn(
                "you can disable class errors using, <!-- #vader-allow_class -->"
              );
              throw new Error(
                "class attribute is not allowed, please use className instead"
              );
            }
          } else if (element.hasAttribute("className")) {
            const isLocalhost = window.location.href.includes("localhost");
            const is127001 = window.location.href.includes("127.0.0.1");
            const ignoreClassComments = document.documentElement.outerHTML
              .trim()
              .includes("<!-- #vader-class-ignore -->");
            const allowClassComments = document.documentElement.outerHTML
              .trim()
              .includes("<!-- #vader-allow_class -->");

            if (
              // @ts-ignore
              (!this.validateClassName(element.getAttribute("className")) &&
                isLocalhost) ||
              (is127001 && !ignoreClassComments && !allowClassComments)
            ) {
              throw new Error(
                `Invalid className ${element.getAttribute(
                  "className"
                )}, please use camelCase instead - example: myClass`
              );
            }
            // @ts-ignore
            element.setAttribute("class", element.getAttribute("className"));
            element.removeAttribute("className");
          }

          if (
            element.hasAttribute("href") &&
            // @ts-ignore
            element.getAttribute("href").startsWith("/") &&
            !document.documentElement.outerHTML
              .trim()
              .includes("<!-- #vader-disable_relative-paths -->")
          ) {
            element.setAttribute(
              "href",
              // @ts-ignore
              `#/${element.getAttribute("href").replace("/", "")}`
            );
          }

          if (
             element.hasAttribute("src") &&
             // @ts-ignore
             !element.getAttribute("src").includes("http") &&
                 // @ts-ignore
              !element.getAttribute("src").includes("https") &&
            !document.documentElement.outerHTML.includes(`<!-- #vader-disable_relative-paths -->`)
          ) {
            element.setAttribute(
              "src",
              // @ts-ignore
              `./public/${element.getAttribute("src")}`
            );
          }
          break;
      }
    });

    result = dom.body.innerHTML;

    this.Componentcontent = result;

    if (!result.includes("<div data-component")) {
      result = `<div 
      
      data-component="${this.name}">${result}</div>`;
    }

    return result;
  }
  // write types to ensure it returns a string
  /**
   * @method render
   * @description Allows you to render html
   * @returns {Promise <any>}
   * @example
   * async render() {
   * return this.html(`
   * <div className="hero p-5">
   * <h1>Home</h1>
   * </div>
   * `);
   */
  async render(props) {}
}

/**
 * @object Vader
 * @property {class} Component
 * @property {function} useRef
 * @description Allows you to create a component
 * @example
 * import { Vader } from "../../dist/vader/vader.js";
 * export class Home extends Vader.Component {
 * constructor() {
 * super('Home');
 * }
 * async render() {
 * return this.html(`
 * <div className="hero p-5">
 * <h1>Home</h1>
 * </div>
 * `);
 * }
 */
const Vader = {
  /**
   * @class Component
   * @description Allows you to create a component
   * @returns {void}
   * @memberof {Vader}
   * @example
   * import { Vader } from "../../dist/vader/index.js";
   * export class Home extends Vader.Component {
   *  constructor() {
   *   super();
   * }
   *  async render() {
   *  return this.html(`
   *     <div className="hero p-5">
   *        <h1>Home</h1>
   *     </div>
   *   `);
   *  }
   * }
   */
  Component: Component,
  useRef: useRef,
};
export const component = (name) => {
  return new Component();
};

/**
 * @function rf
 * @param {*} name
 * @param {*} fn
 * @returns {void}
 * @deprecated - rf has been replaced with Vader.Component.$Function
 * @description Allows you to register function in global scope
 */
export const rf = (name, fn) => {
  window[name] = fn;
};
let cache = {};
/**
 * @function include
 * @description Allows you to include html file
 * @returns {Promise}  - modified string with html content
 * @param {string}  path
 */
 
export const include = async (path) => {
    
  if (
    path.startsWith("/") &&
    !path.includes("/src/") &&
    !document.documentElement.outerHTML
      .trim()
      .includes("<!-- #vader-disable_relative-paths -->")
  ) {
    path = "/src/" + path;
  }
  if (cache[path]) {
    return new Function(`return \`${cache[path]}\`;`)();
  }

  return fetch(`./${path}`)
    .then((res) => {
      if (res.status === 404) {
        throw new Error(`No file found at ${path}`);
      }
      return res.text();
    })
    .then(async (data) => {
      // Handle includes
      let includes = data.match(/<include src="(.*)"\/>/g);
      if (includes) {
      
        const includePromises = includes.map((e) => {
        
          // @ts-ignore
          let includePath = e.match(/<include src="(.*)"\/>/)[1];

          if (
            includePath.startsWith("/") &&
            !document.documentElement.outerHTML
              .trim()
              .includes("<!-- #vader-disable_relative-paths -->")
          ) {
            includePath = "/src" + includePath;
          }
          return include(includePath).then((includeData) => {
            data = data.replace(e, includeData);
          });
        });

        // Wait for all includes to be fetched and replaced
        return Promise.all(includePromises).then(() => {
          cache[path] = data;
           
          return data
        });
      } else {
        cache[path] = data;
        return data;
      }
    });
};

export default Vader;
