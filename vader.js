let dom = [];
let states = {};
//@ts-ignore
let worker = new Worker(new URL("./worker.js", import.meta.url));

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
    update
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
    this.$_signal_dispatch_event = new CustomEvent("SignalDispatch", {
      detail: {
        hasUpdated: false,
        state: null
      }
    });
    /**
     * @property {Object} $_signal_dispatch_cleanup_event
     * @description Allows you to dispatch a signal cleanup event
     * @private
     */
    this.$_signal_dispatch_cleanup_event = new CustomEvent(
      "Signal_Cleanup_Dispatch",
      {
        detail: {
          state: null,
          lastState: null
        }
      }
    );
    /**
     * @property {Array} snapshots
     * @private
     */
    this.snapshots = [];
    /**
     * @property {Object} dom
     * @description Allows you to get reference to DOM element
     * @returns {void | HTMLElement}
     *
     */
    this.dom = [];

    /**
     * @property {Boolean} cfr
     * @description Allows you to compile html code on the fly  - client fly rendering
     *
     */
    this.cfr = false;
    /**
     * @property {Boolean} worker
     * @description Allows you to use a web worker to compile html code on the fly  - client fly rendering
      
     */
  }

  /**
   * @method adapter
   * @description Allows you to create an adapter - this is used to create  custom logic
   *
   *
   */
  adapter(options) {
    // allow you to override the compoent logic
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
        runonce: runonce
      });
      return fn;
    };
    this.$_signal_cleanup = (fn) => {
      this.lastState = state;
      this.$_signal_subscribers = this.$_signal_subscribers.filter(
        (subscriber) => subscriber.function !== fn
      );
      // @ts-ignore
      this.$_signal_dispatch_cleanup_event.detail.state = this.states;
      // @ts-ignore
      this.$_signal_dispatch_cleanup_event.detail.lastState = this.lastState;
      window.dispatchEvent(this.$_signal_dispatch_event);
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
      get: this.$_signal_get
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
      }
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
      }
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
        {}
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
      clear
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
    if (!this.states[key]) {
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
      }
    ];
  }
  /**
   * @method useRef
   * @memberof Component
   * @param {string} ref
   * @description Allows you to get reference to DOM elements from the dom array
   * @returns {Object} {current, update}
   * @example
   * let ref = this.useRef('ref')
   * ref.current // returns the DOM element 
 
   */

  useRef(ref) {
    // get ref from array
    const element = this.dom[ref];

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
      /**@type {HTMLElement} */
      // @ts-ignore
      current: getElement,
      /**@type {Function} */
      update
    };
  }

  /**
   *
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
      }
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

      let componentContainer = document.querySelector(
        `[data-component="${name}"]`
      );
      let time = new Date().getTime();
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
        content: componentContainer.innerHTML
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
    let timer = setInterval(() => {
      if (document.querySelector(`[data-component="${this.name}"]`)) {
        clearInterval(timer);
        this.componentMounted = true;

        document
          .querySelector(`[data-component="${this.name}"]`)
          ?.querySelectorAll("*")
          .forEach((element) => {
            if (element.hasAttribute("ref")) {
              // @ts-ignore
              this.dom[element.getAttribute("ref")] = element;
            }
          });
        this.componentDidMount();
      }
    }, 100);
    let script = document.createElement("script");
    script.setAttribute("type", "text/javascript");
    script.setAttribute(`data-component-script`, this.name);

    worker.postMessage({
      strings,
      args,
      location:
        window.location.origin +
        window.location.pathname.replace(/\/[^\/]*$/, "") +
        "/public/",
      name: this.name
    });
    let promise = new Promise((resolve, reject) => {
      worker.onmessage = (e) => {
        if (e.data.error) {
          throw new Error(e.data.error);
        }
        const dom = this.dom; // Assuming this.dom is an object
        let js = e.data.js;
        let template = e.data.template;
        // Bind the component's context

        const useState = this.useState.bind(this); // Bind the component's context
        const useEffect = this.useEffect.bind(this); // Bind the component's context
        const useReducer = this.useReducer.bind(this); // Bind the component's context
        const useAuth = this.useAuth.bind(this); // Bind the component's context
        const useSyncStore = this.useSyncStore.bind(this); // Bind the component's context
        const signal = this.signal.bind(this); // Bind the component's context
        const $Function = this.$Function.bind(this); // Bind the component's context
        let states = this.states;
        const useRef = this.useRef.bind(this); // Bind the component's context
        new Function(
          "useState",
          "useEffect",
          "useAuth",
          "useReducer",
          "useSyncStore",
          "signal",
          "$Function",
          "dom",
          "render",
          "states",
          "useRef",
          js
        )(
          useState,
          useEffect,
          useAuth,
          useReducer,
          useSyncStore,
          signal,
          $Function,
          this.dom,
          this.render,
          this.states,
          useRef
        );

        resolve(
          new Function(
            "useRef",
            "states",
            "signal",
            "useState",
            "useReducer",
            "useAuth",
            "useSyncStore",
            "useRef",
            "$Function",
            "return" + "`" + template + "`"
          )(
            useRef,
            states,
            signal,
            useState,
            useReducer,
            useAuth,
            useSyncStore,
            useRef,
            $Function
          )
        );
      };
      worker.onerror = (e) => {
        reject(e);
      };
    });
    // @ts-ignore
    return promise;
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
  useRef: useRef
};
/**
 * @function component
 * @description Allows you to create a component
 * @returns {Component}
 */
export const component = () => {
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
async function handletemplate(data) {
  let dom = new DOMParser().parseFromString(data, "text/html");
  let elements = dom.documentElement.querySelectorAll("*");

  if (elements.length > 0) {
    for (var i = 0; i < elements.length; i++) {
      if (elements[i].nodeName === "INCLUDE") {
        if (
          !elements[i].getAttribute("src") ||
          elements[i].getAttribute("src") === ""
        ) {
          throw new Error("Include tag must have src attribute");
        }

        let componentName = elements[i]
          .getAttribute("src")
          ?.split("/")
          .pop()
          ?.split(".")[0];
        // @ts-ignore
        let filedata = await include(elements[i].getAttribute("src"));
        // replace ` with \`\` to allow for template literals
        filedata = filedata.replace(/`/g, "\\`");
        cache[elements[i].getAttribute("src")] = filedata;
        filedata = new Function(`return \`${filedata}\`;`)();
        let newdom = new DOMParser().parseFromString(filedata, "text/html");

        newdom.querySelectorAll("include").forEach((el) => {
          el.remove();
        });
        // @ts-ignore

        let els = dom.querySelectorAll(componentName);

        els.forEach((el) => {
          if (el.attributes.length > 0) {
            for (var i = 0; i < el.attributes.length; i++) {
              // @ts-ignore
              let t = "{{" + el.attributes[i].name + "}}";
              if (newdom.body.innerHTML.includes(t)) {
                // @ts-ignore
                newdom.body.innerHTML = newdom.body.innerHTML.replaceAll(
                  t,
                  el.attributes[i].value
                );
              }
            }
          }
          if (el.children.length > 0 && newdom.body.querySelector("slot")) {
            for (var i = 0; i < el.children.length; i++) {
              let slots = newdom.body.querySelectorAll("slot");
              slots.forEach((slot) => {
                let id = slot.getAttribute("id");

                if (
                  (el.hasAttribute("key") && el.getAttribute("key") === id) ||
                  (!el.hasAttribute("key") && el.nodeName === id)
                ) {
                  if (el.children[i].innerHTML.length > 0) {
                    slot.outerHTML = el.children[i].innerHTML;
                  }
                }
              });
            }
          }

          dom.body.querySelectorAll("include").forEach((el) => {
            el.remove();
          });
          // replace ` with \`\` to allow for template literals
          dom.body.outerHTML = dom.body.outerHTML.replace(/`/g, "\\`");
          dom.body.outerHTML = dom.body.outerHTML.replace(
            el.outerHTML,
            new Function(`return \`${newdom.body.outerHTML}\`;`)()
          );
        });
      }
    }
  }

  // replace ` with \`\` to allow for template literals
  dom.body.outerHTML = dom.body.outerHTML.replace(/`/g, "\\`");
  data = new Function(`return \`${dom.body.outerHTML}\`;`)();

  return data;
}
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
    return await handletemplate(new Function(`return \`${cache[path]}\`;`)());
  } else {
    return fetch(`./${path}`)
      .then((res) => {
        if (res.status === 404) {
          throw new Error(`No file found at ${path}`);
        }
        return res.text();
      })
      .then(async (data) => {
        cache[path] = data;

        data = await handletemplate(new Function(`return \`${data}\`;`)());

        return data;
      });
  }
};

export default Vader;
