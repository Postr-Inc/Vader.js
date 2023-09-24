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
export function vhtml(strings, ...args) {
  let result = "";

  for (let i = 0; i < strings.length; i++) {
    result += strings[i];
    if (i < args.length) {
      result += args[i];
    }
  }

  let dom = new DOMParser().parseFromString(result, "text/html");
  if (dom.body.firstChild.nodeName.toLowerCase() !== "div") {
    throw new Error(
      `Ensure that you have a parent div for all component elements`
    );
  }

  dom.body.querySelectorAll("[className]").forEach((el) => {
    el.setAttribute("class", el.getAttribute("classname"));
    el.removeAttribute("classname");
  });
  return dom.body.innerHTML;
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
    window.props[key] = value;
    updateComponent();
  };

  const signal = (key, value) => {
    states[key] = value;
    window.props[key] = value;
    updateComponent();
  };

  /**
   * @function useState
   * @param {*} key
   * @param {*} initialValue
   * @returns  {Array} [state, setState]
   * @description Allows you to bind state to component
   */

  const useState = (key, initialValue) => {
    if (!states[key]) {
      states[key] = initialValue;
    }
    return [
      states[key],
      (value) => {
        states[key] = value;
        window.props[key] = value;
        updateComponent();
      },
    ];
  };
  /**
   * @function useEffect
   * @param {*} effectFn
   * @returns {null}
   * @description Allows you to run side effects
   */

  const useEffect = (effectFn, dependencies) => {
    if (!effects[name]) {
      effects[name] = [];
    }
    effects[name].push(effectFn);

    if (dependencies.length > 0) {
      const oldState = states[name];
      const newState = dependencies.map((dependency) => {
        return states[dependency];
      });
      if (oldState) {
        const hasChanged = newState.some((state) => {
          return state !== oldState;
        });
        if (hasChanged) {
          effectFn();
        }
      }
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
      let html = newDom.body.firstChild;
      let oldHtml = oldDom.body.firstChild;
      if (!html.isEqualNode(oldHtml)) {
        // only update the chunk of DOM that has changed
        componentContainer.innerHTML = newHtml;
      }
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
    options.componentDidMount ? options.componentDidMount() : null;
    return vhtml`
          <div data-component="${name}">
            ${await options.render(states, props)}
          </div>
        `;
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
      cache[path] = data;
      return new Function(`return \`${data}\`;`)();
    });
};
