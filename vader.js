window.dom = {};
/**
 * @function useRef
 * @description Allows you to get reference to DOM element
 * @param {String} ref
 * @returns {Object} {current}
 * @returns
 */
export const useRef = (ref) => {
  // Try to get the existing DOM element from window.dom
  let el = window.dom[ref] || document.querySelector(`[ref="${ref}"]`);

  // Function to update the DOM element with new HTML content
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
        window.dom[ref] = newElement;
      }
    } else {
      // If the element doesn't exist, create it
      el = newHtml.cloneNode(true);
      window.dom[ref] = el;
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
    // get extended class name
    this.name = this.constructor.name;
    console.log(this.name);
    this.executedEffects = {};
    this.storedProps = {};
    this.componentMounted = false;
    this.hasMounted = false;
    this.$_signal_subscribers = [];
    this.$_signal_subscribers_ran = [];
    this.effects = {};
    this.$_useStore_subscribers = [];
    this.init();
    this.Componentcontent = null;
  }

  init() {
    this.registerComponent();
    window.states = this.states;
    window.useState = this.useState;
    window.setState = this.setState;
    window.useEffect = this.useEffect;
    window.useAuth = this.useAuth;
    window.useSyncStore = this.useSyncStore;
    window.useReducer = this.useReducer;
    window.runEffects = this.runEffects;
    window.rf = this.rf;
    window.signal = this.signal;
  }

  registerComponent() {
    components.push({ name: this.name, options: this.options });
  }

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
              this.$_signal_subscribers_ran.includes(
                this.$_signal_subscribers[i]
              )
            ) {
              break;
            } else {
              this.$_signal_subscribers[i].function(state);
              this.$_signal_subscribers_ran.push(this.$_signal_subscribers[i]);
            }
          }
        }
      } else {
        let signalEvent = new CustomEvent("signalDispatch", {
          detail: {
            hasUpdated: true,
            state: state,
          },
        });
        dispatchEvent(signalEvent);
      }
    });
    /**
     * @function  $_signal_subscribe
     * @description Allows you to subscribe to a signal
     * @param {*} fn
     * @param {*} runonce
     * @returns {null}
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
      dispatch();
    };
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
  useAuth(options) {
    let rules = options.rulesets;
    if (!rules) {
      throw new Error("No rulesets provided");
    }
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
      hasRole: (role) => {
        return user.role && user.role.includes(role);
      },
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

  useSyncStore(storeName, initialState) {
    let [storedState, setStoredState] = this.useState(
      storeName,
      initialState ||
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
   * @returns  {null}
   * @description Allows you to run side effects
   * @deprecated - this is no longer suggested please use vader signals instead
   * @returns
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

    return () => {
      this.effects[this.name] = this.effects[this.name].filter(
        (fn) => fn !== effectFn
      );
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
   * @returns
   */
  $Function(fn) {
    if (!typeof fn === "function") {
      throw new Error("fn must be a function");
    }
    let name = fn.name;
    if (!name) {
      name = "anonymous";
    }
    window[name] = fn;

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
        this.rf,
        window.props,
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
        window.dom[element.getAttribute("ref")] = element;
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
  return new Component(name);
};

/**
 * @function rf
 * @param {*} name
 * @param {*} fn
 * @returns {null}
 * @deprecated - rf has been replaced with Vader.Component.$Function
 * @description Allows you to register function in global scope
 */
export const rf = (name, fn) => {
  window[name] = fn;
};
