
let dom = /**@type {Obect}  **/ {};
/**
 * @function useRef
 * @description Allows you to get reference to DOM element
 * @param {String} ref
 * @returns {Object} {current}
 */
export const useRef = (ref /** @type {string} */) => {
  // Try to get the existing DOM element from window.dom
   /**@type {object }*/
  let el =   dom[ref] || document.querySelector(`[ref="${ref}"]`);

  // Function to update the DOM element with new HTML content
  /**
   * @function update
   * @description Allows you to update the DOM element with new HTML content
   * @param {String} data 
   */
  const update = (data) => {
    // Parse the new HTML data
    const newDom = new DOMParser().parseFromString(data, "text/html");
     
     
    const newHtml = newDom.body.firstChild;

    if (el) {
      // If the element already exists, update it
      const isDifferent = !newHtml.isEqualNode(el);
      if (isDifferent) {
        const newElement = newHtml.cloneNode(true);
        // Replace the old element with the new one
        el.parentNode.replaceChild(newElement, el);
        dom[ref] = newElement;
      }
    } else {
      // If the element doesn't exist, create it
      el = newHtml.cloneNode(true);
      dom[ref] = el;
    }
  };

  return {
    current: el,
    update,
  };
};
let components = [];
/**
 * @class Component
 * @description Allows you to create a component
 * @returns {null}
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
    console.log(this.name);
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
    this.$_signal_subscribers_ran =   [];
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
  }

  init() {
    //@ts-ignore
    this.registerComponent();
      //@ts-ignore
    window.states = this.states;
      //@ts-ignore
    window.useState = this.useState;
      //@ts-ignore
    window.setState = this.setState;
      //@ts-ignore
    window.useEffect = this.useEffect;
      //@ts-ignore
    window.useAuth = this.useAuth;
      //@ts-ignore
    window.useSyncStore = this.useSyncStore;
      //@ts-ignore
    window.useReducer = this.useReducer;
      //@ts-ignore
    window.runEffects = this.runEffects;
      //@ts-ignore
    window.rf = this.rf;
      //@ts-ignore
    window.signal = this.signal;
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

  componentUpdate() {}
  /**
   * @method componentDidMount
   * @description Allows you to run code after component has mounted
   */
  componentDidMount() {}
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
    let rules =  options.rulesets;
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
    const [state, setState] = this.useState(key, initialState);
    const dispatch = (action) => {
      const newState = reducer(state, action);
      setState(newState);
    };
    return [state, dispatch];
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
   * @param {*} storeName 
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
  useState(key, initialValue, callback) {
    if (!this.states[key]) {
      this.states[key] = initialValue;
    }
    return [
      this.states[key],
      (value) => {
        this.states[key] = value;
        this.updateComponent();
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

    return{
      cleanup: () => {
        this.effects[this.name] = this.effects[this.name].filter(
          (effect) => effect !== effectFn
        );
      },
    }
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
      name = "anonymous";
    }
    window[name] = fn;
    // @ts-ignore
    return `window.${name}()`;
  }

  // Add other methods like render, useEffect, useReducer, useAuth, etc.

  updateComponent() {
    Object.keys(components).forEach(async (component) => {
      const { name } = components[component];
      const componentContainer = document.querySelector(
        `[data-component="${name}"]`
      );

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
      this.componentDidMount();

      if (newHtml && newHtml !== componentContainer.innerHTML) {
        componentContainer.outerHTML = newHtml;
      }
    });
  }
  html(strings, ...args) {
    let result = "";
    for (let i = 0; i < strings.length; i++) {
      result += strings[i];
      if (i < args.length) {
        result += args[i];
      }
    }
    // add ref to all elements
    let dom = new DOMParser().parseFromString(result, "text/html");
    let elements = dom.body.querySelectorAll("*");
    elements.forEach((element) => {
      if (element.hasAttribute("ref")) {
        dom[element.getAttribute("ref")] = element;
      }
    });
    this.Componentcontent = result;
    if (!result.includes("<div data-component")) {
      result = `<div data-component="${this.name}">${result}</div>`;
    }

    return result;
  }
  async render() {
    this.componentMounted = true;
    this.componentDidMount();
    return await new Function(`return \`${this.Componentcontent}\`;`)();
  }
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
export const Vader = {
  Component: Component,
  useRef: useRef,
};
export const component = (name) => {
  return new Component()
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
 * @returns   - modified string with html content
 * @param {string}  path
 * @param {Object} options
 */

export const include = (path, options) => {
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
    .then((data) => {
      // Handle includes
      let includes = data.match(/<include src="(.*)"\/>/gs);
      if (includes) {
        // Use Promise.all to fetch all includes concurrently
        const includePromises = includes.map((e) => {
          let includePath = e.match(/<include src="(.*)"\/>/)[1];
          return include(includePath).then((includeData) => {
            // Replace the include tag with the fetched data
            data = data.replace(e, includeData);
          });
        });

        // Wait for all includes to be fetched and replaced
        return Promise.all(includePromises).then(() => {
          cache[path] = data;
          return new Function(`return \`${data}\`;`)();
        });
      } else {
        cache[path] = data;
        return new Function(`return \`${data}\`;`)();
      }
    });
};