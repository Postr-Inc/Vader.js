/**
 * @Object window
 * @property {Object} props
 * @description Allows you to store props for component
 */
window.props = {};

let events = {};
/**
 * @function vhtml
 * @param {String} strings
 * @param  {...any} args
 * @returns  modified string
 *
 */

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

export function vhtml(strings, options, ...args) {
  let result = "";

  for (let i = 0; i < strings.length; i++) {
    result += strings[i];
    if (i < args.length) {
      result += args[i];
    }
  }

  let dom = new DOMParser().parseFromString(result, "text/html");

  dom.body.querySelectorAll("[className]").forEach((el) => {
    el.setAttribute("class", el.getAttribute("classname"));
    el.removeAttribute("classname");
  });

  return new Function(`return \`${dom.body.innerHTML}\`;`)();
}

/**
 * @function component
 * @param {*} name 
 * @param {*} options 
 * @returns 
 *  @param {*} states
 * @param {*} setState
 * @param {*} useState
 * @param {*} useEffect
 * @param {*} useAuth
 * @param {*} render
 * 
 * @example 
 *   
 *  const app = component('app', {
  render: (states, props) => {
  
 
    let [count, setCount] = useState('count', 0);
 
    useEffect(() => {
      console.log('App component mounted');
    });
 
    function incrementHandler() {
      setCount(count + 1);
    }
    rf('incrementHandler', incrementHandler);
    
 
    return vhtml`
      <div>
        <button onclick="incrementHandler()" >Click me</button>
        <p>You clicked ${count} times</p>
      </div>
    `;
  },
});
 ***/

export function component(name, options) {
  let states = {};
  const effects = {};
  const executedEffects = {};
  let storedProps = {};
  let componentMounted = false;
  let hasMounted = false;
  /**
   * @function setState
   * @param {*} key
   * @param {*} value
   * @returns {null}
   * @description Allows you to change state of component and re-render it
   */
  const setState = (key, value) => {
    states[key] = value;
    updateComponaent();
  };

  /**
   * @function signal
   * @description Manage state much efficiently - alternative to vaders useEffect method
   * @param {String} key
   * @param {Object | String | Number | Boolean} initialState
   * @returns  {Object} {subscribe, cleanup, dispatch, getDetail, call, setDetail}
   * @example
   * let count = signal('count', 0);
   *
   * let counter = count.subscribe((state) => {
   *  console.log(state)
   * });
   *
   * count.cleanup(counter ) // always clear your counters - no duplicates
   *
   * count.call();
   * count.set(1);
   * count.call();
   * count.get();
   *
   * // signals also emit events
   *
   * window.addEventListener('signalDispatch', ()=>{
   * /// do something
   * })
   *
   */
  let $_signal_subscribers = [];
  let $_signalsubscribersran = [];
  const signal = (key, initialState) => {
    let hasCaller = false;

    let [state, setState] = useState(key, initialState, () => {
      if ($_signal_subscribers.length > 0) {
        for (var i = 0; i < $_signal_subscribers.length; i++) {
          if (!hasCaller) {
            if (
              $_signal_subscribers[i].runonce &&
              $_signalsubscribersran.includes($_signal_subscribers[i])
            ) {
              break;
            } else {
              $_signal_subscribers[i].function(state);
              $_signalsubscribersran.push($_signal_subscribers[i]);
              return;
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
     * @function subscribe
     * @param {Function} fn
     * @param {Boolean} runonce - infer that the function should only be ran once or not.
     * @description - Subcribe to state changes
     */
    function subscribe(fn, runonce) {
      $_signal_subscribers.push({
        function: fn,
        runonce: runonce,
      });
    }
    /**
     * @function cleanup
     * @param {Function} fn
     * @description - Ensures that the last subscriber gets cleared after updated state
     */
    function cleanup(fn) {
      $_signal_subscribers = $_signal_subscribers.filter(
        (subscriber) => subscriber.function !== fn
      );
    }
    /**
     * @function dispatch
     * @returns {void}
     * @description - handles signal functions to ensure they are either ran once or infinitely ran
     */
    function dispatch() {
      for (var i = 0; i < $_signal_subscribers.length; i++) {
        if (
          $_signal_subscribers[i].runonce &&
          $_signalsubscribersran.includes($_signal_subscribers[i])
        ) {
          break;
        } else {
          $_signal_subscribers[i].function(state);
          $_signalsubscribersran.push($_signal_subscribers[i]);
          return;
        }
      }
    }
    /**
     * @function get
     * @returns {String | Number | Boolean | Object} - the current state
     */
    function get() {
      return state;
    }
    /**
     * @function call
     * @returns {void}
     * @description Call each subscriber
     */
    function call() {
      hasCaller = true;
      dispatch();
    }
    /**
     * @function set
     * @param detail - change the current state
     * @returns {void}
     */
    function set(detail) {
      setState(detail);
    }
    return {
      subscribe,
      cleanup,
      dispatch,

      call,
      set,
      get,
    };
  };
  window.states = states;
  /**
   * @function useState
   * @param {*} key
   * @param {*} initialValue
   * @param {Function} callback - allows you to call a function when state changes
   * @returns  {Array} [state, setState]
   * @description Allows you to bind state to component
   */

  const useState = (key, initialValue, callback) => {
    if (!states[key]) {
      states[key] = initialValue;
    }
    return [
      states[key],
      (value) => {
        states[key] = value;
        window.props[key] = value;
        updateComponent();
        typeof callback === "function" ? callback() : null;
      },
    ];
  };
  /**
   * @function useEffect
   * @param {*} effectFn
   * @returns {null}
   * @description Allows you to run side effects
   * @deprecated - this is no longer suggested please use vader signals instead
   * @example
   * let [count, setCount] = useState('count', 0);
   * useEffect(() => {
   * console.log('count', count)
   * }, [count])
   */

  const useEffect = (effectFn, dependencies) => {
    if (!effects[name]) {
      effects[name] = [];
    }
    effects[name].push(effectFn);

    if (dependencies.length > 0) {
      dependencies.forEach((d) => {
        if (d.set) {
          throw new Error(
            "signal found, do not use effect and signals at the same time - signals are more efficient"
          );
        }
      });
    } else if (!hasMounted) {
      effectFn();
      hasMounted = true;
    }

    return () => {
      effects[name] = effects[name].filter((fn) => fn !== effectFn);
    };
  };

  /**
   *
   * @param {String} key
   * @param {Function} reducer
   * @param {Object} initialState
   * @returns  {Array} [state, dispatch]
   * @description Allows you to bind state to component
   */

  const useReducer = (key, reducer, initialState) => {
    const [state, setState] = useState(key, initialState);

    const dispatch = (action) => {
      const newState = reducer(state, action);
      setState(newState);
    };

    return [state, dispatch];
  };
  /**
   * @function useSyncStore
   * @param {*} storeName
   * @param {*} initialState
   * @returns {Object} {getField, setField, subscribe, clear}
   * @description Allows you to manage state in local storage
   */
  const useSyncStore = (storeName, initialState) => {
    // Load state from local storage or use initial state
    const storedState =
      JSON.parse(localStorage.getItem(storeName)) || initialState;

    // Create a store object
    const store = createStore(storedState);

    /**
     * Get the value of a specific field from the store's state.
     *
     * @param {string} fieldName - The name of the field.
     * @returns {*} The value of the specified field.
     */
    const getField = (fieldName) => {
      return store.state[fieldName];
    };

    /**
     * Set the value of a specific field in the store's state.
     *
     * @param {string} fieldName - The name of the field.
     * @param {*} value - The new value to set for the field.
     */
    const setField = (fieldName, value) => {
      // Create a new state object with the updated field
      const newState = { ...store.state, [fieldName]: value };
      // Update the store's state and save it to local storage
      store.setState(newState);
      saveStateToLocalStorage(storeName, newState);
    };

    /**
     * Subscribe a function to be notified of state changes.
     *
     * @param {Function} subscriber - The function to call when the state changes.
     * @returns {Function} A function to unsubscribe the subscriber.
     */
    const subscribe = (subscriber) => {
      return store.subscribe(subscriber);
    };

    /**
     * Clear the stored state from local storage.
     */
    const clear = () => {
      localStorage.removeItem(storeName);
    };

    /**
     * Save the state to local storage.
     *
     * @param {string} key - The key under which to store the state.
     * @param {*} state - The state to be stored.
     */
    const saveStateToLocalStorage = (key, state) => {
      try {
        localStorage.setItem(key, JSON.stringify(state));
      } catch (error) {
        // Handle errors when saving to local storage
        console.error("Error saving state to local storage:", error);
      }
    };

    return {
      getField,
      setField,
      subscribe,
      clear,
    };
  };

  /**
   * @function useAuth
   * @param {*} rulesets
   * @param {*} options
   * @returns {Object} {canAccess, grantAccess, revokeAccess}
   * @description Allows you to manage access to resources through rulesets
   * @returns
   */

  function useAuth(options) {
    if (!options.rulesets) {
      throw new Error("No rulesets provided");
    }

    let rules = options.rulesets;
    let user = options.user;

    const auth = {
      /**
       * Check if the user can perform a specific action.
       *
       * @param {string} action - The action to check.
       * @returns {boolean} True if the user can perform the action, false otherwise.
       */
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
       * Check if the user has a specific role.
       *
       * @param {string} role - The role to check.
       * @returns {boolean} True if the user has the role, false otherwise.
       */
      hasRole: (role) => {
        return user.role && user.role.includes(role);
      },
      /**
       * Check if the user can perform a specific action with a specific role.
       *
       * @param {string} action - The action to check.
       * @param {string} role - The role to check.
       * @returns {boolean} True if the user can perform the action with the role, false otherwise.
       */
      canWithRole: (action, role) => {
        return auth.can(action) && auth.hasRole(role);
      },
      /**
       * Assign a new rule to the rulesets.
       *
       * @param {Object} rule - The rule to assign.
       */
      assignRule: (rule) => {
        if (
          !rules.some((existingRule) => existingRule.action === rule.action)
        ) {
          rules.push(rule);
        }
      },
      /**
       * Revoke a rule from the rulesets.
       *
       * @param {string} action - The action of the rule to revoke.
       */
      revokeRule: (action) => {
        rules = rules.filter((rule) => rule.action !== action);
      },
      /**
       * Check if the user can perform any of the specified actions.
       *
       * @param {Array} actions - An array of actions to check.
       * @returns {boolean} True if the user can perform any of the actions, false otherwise.
       */
      canAnyOf: (actions) => {
        return actions.some((action) => auth.can(action));
      },
      /**
       * Check if the user can perform all of the specified actions.
       *
       * @param {Array} actions - An array of actions to check.
       * @returns {boolean} True if the user can perform all of the actions, false otherwise.
       */
      canAllOf: (actions) => {
        return actions.every((action) => auth.can(action));
      },
      /**
       * Check if the user can perform a group of actions based on a logical operator.
       *
       * @param {Array} actions - An array of actions to check.
       * @param {string} logicalOperator - The logical operator to use ('any' or 'all').
       * @returns {boolean} True if the user can perform the actions based on the logical operator, false otherwise.
       */
      canGroup: (actions, logicalOperator = "any") => {
        return logicalOperator === "any"
          ? auth.canAnyOf(actions)
          : auth.canAllOf(actions);
      },
    };

    return auth;
  }

  /**
   * @function runEffects
   * @returns {null}
   * @description Allows you to run side effects
   */
  const runEffects = () => {
    if (!executedEffects[name] && effects[name]) {
      effects[name].forEach((effectFn) => effectFn());
      executedEffects[name] = true;
    }
  };
  window.useState = useState;
  window.setState = setState;
  window.useEffect = useEffect;
  window.useAuth = useAuth;
  window.useSyncStore = useSyncStore;
  window.useReducer = useReducer;
  window.runEffects = runEffects;
  window.signal = signal;

  const updateComponent = async () => {
    const componentContainer = document.querySelector(
      `[data-component="${name}"]`
    );

    const newHtml = await options.render(states, storedProps);
    if (componentContainer && newHtml !== componentContainer.innerHTML) {
      // only update the chunk of DOM that has changed
      let newDom = new DOMParser().parseFromString(newHtml, "text/html");
      let oldDom = new DOMParser().parseFromString(
        componentContainer.innerHTML,
        "text/html"
      );
      let newBody = newDom.body;
      let oldBody = oldDom.body;
      if (newBody.isEqualNode(oldBody)) return;
      componentContainer.innerHTML = newHtml;
      runEffects();
      if (!componentMounted) {
        componentMounted = true;

        // Execute the "component did mount" code here
        if (
          options.componentDidMount &&
          typeof options.componentDidMount === "function"
        ) {
          options.componentUpdate ? options.componentDidMount() : null;
        }
      }
    }
  };

  /**
   * @function render
   * @param {*} states
   * @param {*} props
   * @description Allows you to render component to DOM
   * @returns {HTMLcContent}
   * @returns
   */

  const render = async (props) => {
    let data = await vhtml(
      `<div data-component="${name}"
      style="display: contents; width: 100%; height: 100%;"
      >${await options.render(states, props)}</div>`
    );

    storedProps = props;
    runEffects();
    setTimeout(() => {
      options.componentDidMount ? options.componentDidMount() : null;
    }, 0);

    return data;
  };

  return {
    render,
    setState,
    useState,
    useEffect,
    useAuth,
    useSyncStore,
    useReducer,
    runEffects,
    signal,
  };
}

/**
 * @function rf
 * @param {*} name
 * @param {*} fn
 * @returns {null}
 * @description Allows you to register function in global scope
 */
export const rf = (name, fn) => {
  window[name] = fn;
};
/**
 * @function include
 * @description Allows you to include html file
 * @returns   - modified string with html content
 * @param {string}  path
 */

let cache = {};
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
