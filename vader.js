const templates = [];
const cache = {};
/**
 * @file Vader.js
 * @version 1.0.0
 * @license MIT
 * @description A simple ReactLike - framework for building web applications.
 */
/**
 *
 * @param {*} strings
 * @param  {...any} values
 * @returns  {string}
 * @description Creates a template literal and returns it as a string.
 */
const vhtml = (strings, ...values) => {
  let result = "";
  for (let i = 0; i < strings.length; i++) {
    result += strings[i];
    if (i < values.length) {
      result += values[i];
    }
  }
  let dom = new DOMParser().parseFromString(result, "text/html");

  let eventTypes = [
    "click",
    "dblclick",
    "mousedown",
    "mouseup",
    "mouseenter",
    "mouseleave",
    "mousemove",
    "keydown",
    "keyup",
    "focus",
    "blur",
  ];

  dom.querySelectorAll("[data-on]").forEach((element) => {
    eventTypes.forEach((eventType) => {
      const attributeName = `data-on-${eventType}`;
      if (element.hasAttribute(attributeName)) {
        awaitElement(element.tagName).then((el) => {
          el.addEventListener(eventType, () => {
            const eventCode = el.getAttribute(attributeName);
            let eventFunction = new Function(eventCode);
            eventFunction();
          });
        });
      }
    });
  });

  dom.querySelectorAll("[id]").forEach((element) => {
    const id = element.getAttribute("id");
    window[id] = element;
  });

  return dom.body.innerHTML;
};

let init = false;
/**
 *  @param {string} selector
 * @param {function} rt
 * @returns {void}
 * @description Registers a template to be rendered.
 */
const render = async (template) => {
  if (!document.querySelector(template.selector)) {
    throw new Error(`No element found with selector ${template.selector}`);
  } else {
    const content = await template.rt();

    document.querySelector(template.selector).innerHTML = content;
    window["currentRender"] = template;
    if (!init) {
      init = true;
      hydrate();
    }
  }
  return {
    register: () => {
      register(template);
    },
  };
};
/**
 * @alias form
 *
 * @param {*} config
 * @returns form component
 * @description Creates a form component based on the config object.
 * @example
 * const form = form({
 *  name: 'myForm',
 * fields: {
 * name: {
 * value: 'John Doe',
 * type: 'text',
 * placeholder: 'Enter your name'
 * },
 * email: {
 * value: ''
 * }
 * },
 * onSubmit: (e) => {
 * console.log(e)
 * }
 *
 *
 * })
 */
const form = (config) => {
  const { name, fields, onSubmit, inputs, button, onReset, onChange, rules } =
    config;
  const formData = {};

  const componentInstance = {
    state: {},
    props: {},
    reset: () => {
      for (const fieldName in fields) {
        formData[fieldName] = fields[fieldName].value || "";
      }
      document.forms[name].reset();
    },
    componentDidMount: (form) => {
      form.setAttribute("onsubmit", "return false;");

      for (const fieldName in fields) {
        formData[fieldName] = fields[fieldName].value || "";
        const fieldElement = form[fieldName];

        fieldElement.addEventListener("input", (event) => {
          formData[fieldName] = event.target.value;
        });
      }

      if (onSubmit) {
        document.onsubmit = (ev) => {
          if (ev.target.name === name) {
            let event = formData;

            event["reset"] = componentInstance.reset;
            onSubmit(event);
          }
        };
      } else if (onReset) {
        document.onreset = (ev) => {
          if (ev.target.name === name) {
            for (const fieldName in fields) {
              formData[fieldName] = fields[fieldName].value || "";
            }
            onReset();
          }
        };
      } else if (onChange) {
        document.onchange = (ev) => {
          if (formData[ev.target.name]) {
            let event = formData;

            event["reset"] = componentInstance.reset;
            onChange(event);
          }
        };
      }
    },
    render: async () => {
      const formElement = document.createElement("form");
      formElement.name = name;

      for (const fieldName in fields) {
        const fieldConfig = fields[fieldName];
        const fieldElement = document.createElement("input");
        fieldElement.name = fieldName;
        fieldElement.value = fieldConfig.value || "";
        fieldElement.type = fieldConfig.type || "text";
        fieldElement.placeholder = fieldConfig.placeholder || "";
        if (inputs && inputs[fieldName]) {
          const fieldStyles = inputs[fieldName];
          for (const key in fieldStyles) {
            fieldElement.style[key] = fieldStyles[key];
          }
        }

        if (rules) {
          Object.keys(rules).forEach((rule) => {
            if (rule === fieldName) {
              const rulesobj = rules[rule];
              // set all attributes to fieldElement
              for (const key in rulesobj) {
                fieldElement.setAttribute(key, rulesobj[key]);
              }
            }
          });
        }

        document.oninput = (ev) => {
          let fieldName = ev.target.name;
          let fieldValue = ev.target.value;
          formData[fieldName] = fieldValue;
        };

        // Add more attributes or properties to the fieldElement if needed
        formElement.appendChild(fieldElement);
      }
      const submitButton = document.createElement("button");
      submitButton.type = "submit";
      submitButton.textContent = button.text || "Submit";
      if (button.styles) {
        for (const key in button.styles) {
          submitButton.style[key] = button.styles[key];
        }
      }
      formElement.appendChild(submitButton);

      // Call componentDidMount
      componentInstance.componentDidMount(formElement);

      return formElement.outerHTML;
    },
  };
  window.currentRender = componentInstance;

  return componentInstance;
};

/**
 * Component Lifecycle Hooks
 */
const componentLifecycle = {
  componentWillMount: [],
  componentDidMount: [],
  componentWillUnmount: [],
};

/**
 * Register a lifecycle hook for a component
 * @param {string} hookName - Name of the lifecycle hook
 * @param {Function} hookFunction - Function to be called at the lifecycle stage
 */
const registerLifecycleHook = (hookName, hookFunction) => {
  componentLifecycle[hookName].push(hookFunction);
};

/**
 * Call all registered lifecycle hooks for a component
 * @param {string} hookName - Name of the lifecycle hook
 * @param {Object} component - Component object
 */
const callLifecycleHooks = (hookName, component) => {
  componentLifecycle[hookName].forEach((hookFunction) => {
    hookFunction(component);
  });
};

/**
 * Component wrapper function
 * @param {Function} componentFn - Component function
 * @param {Object} props - Component props
 * @returns {Promise} - Promise with the component content
 */
const component = async (componentFn, props) => {
  let isMounted = true;

  const componentInstance = {
    state: {},
    props,
    setState: (newState) => {
      if (isMounted) {
        componentInstance.state = { ...componentInstance.state, ...newState };
        render(template); // Assuming 'template' is defined somewhere
      }
    },
  };

  // Call componentDidMount lifecycle hooks
  callLifecycleHooks("componentWillMount", componentInstance);

  const content = await componentFn(props);

  // Call componentDidMount lifecycle hooks
  callLifecycleHooks("componentDidMount", componentInstance);

  const unmount = () => {
    isMounted = false;
    // Call componentWillUnmount lifecycle hooks
    callLifecycleHooks("componentWillUnmount", componentInstance);
  };

  return {
    ...content,
    unmount,
  };
};

/**
 * Create a new component instance
 * @param {Function} componentFn - Component function
 * @param {Object} props - Component props
 * @returns {Promise<ComponentInstance>} - Promise with the component instance
 * @typedef {Object} ComponentInstance - Component instance
 * @property {Object} state - Component state
 * @property {Object} props - Component props
 * @property {Function} setState - Function to update the component state
 */
const createComponent = async (componentFn, props) => {
  const componentInstance = {
    state: {},
    props,
    setState: (newState) => {
      componentInstance.state = { ...componentInstance.state, ...newState };
    },
  };
  /** @type {Function} */
  return await componentFn(props);
};

// ... (other functions)

// Exported functions
export {
  render,
  vhtml,
  component,
  form,
  useAuth,
  createComponent,
  useExternalStore,
  useState,
  useEffect,
  useReduce,
  useSyncStore,
  require,
  $s,
  registerFunction,
};

// ... (remaining code)

function hydrate() {
  templates.forEach(async (template) => {
    if (template === window["currentRender"]) {
      render(template);
      return;
    }
    const content = await template.rt();
    const element = document.querySelector(template.selector);

    if (element) {
      if (template.renderedContent !== content) {
        element.innerHTML = content;
        template.renderedContent = content;
      }
    }
  });
}
/**
 * Register a function to be available in the component scope for vhtml elements.
 *
 * @param {string} name - The name to assign to the function in the global scope.
 * @param {Function} fn - The function to register.
 * @throws {Error} Throws an error if the name is not a string or if the function is not a valid function.
 * @throws {Error} Throws an error if the name is already used in the global scope.
 * @param {string} name @type {string}
 * @example
 * function login() {
 *   setState({ loggedIn: true });
 * }
 * registerFunction('login', login);
 * return html`<button onclick="login()">Login</button>`;
 */
const registerFunction = (name, fn) => {
  if (typeof name !== "string") {
    throw new Error("The name parameter must be a string.");
  }

  if (typeof fn !== "function") {
    throw new Error("The fn parameter must be a function.");
  }

   

  /**
   * @global
   * @function
   * @name {Function}
   */
  window[name] = fn;
};

function doxMethods(element) {
  element.on = function (event, callback) {
    element.addEventListener(event, callback);
  };
  element.query = function (selector) {
    return element.querySelector(selector);
  };

  return element;
}

const awaitElement = (selector) => {
  return new Promise((resolve, reject) => {
    const interval = setInterval(() => {
      if (document.querySelector(selector)) {
        clearInterval(interval);
        resolve(document.querySelector(selector));
      }
    }, 100);
  });
};

/**
 * Create a new state variable with optional initial value.
 *
 * @param {string} StateName - The name of the state variable.
 * @param {*} initialState - The initial state value.
 * @returns {Array} An array containing the current state value and a function to update the state.
 * @typedef {Array} StateHook
 * @property {*} 0 - The current state value.
 * @property {Function} 1 - A function to update the state.
 */
const useState = (StateName, initialState) => {
  let currentstate;

  // Attempt to retrieve state from sessionStorage
  if (sessionStorage.getItem(StateName)) {
    currentstate = JSON.parse(sessionStorage.getItem(StateName));
  } else {
    // If state is not found in sessionStorage, use initial state
    currentstate = initialState;
    sessionStorage.setItem(StateName, JSON.stringify(initialState));
  }

  /**
   * Update the state with a new value.
   *
   * @param {*} newState - The new state value.
   * @returns {*} The new state value.
   */
  const setState = (newState) => {
    currentstate = newState;
    sessionStorage.setItem(StateName, JSON.stringify(newState));
    let clonedState = JSON.parse(JSON.stringify(newState));
    window.postMessage({ state: clonedState }, "*");
    hydrate();
    window[StateName] = newState;
    return newState;
  };

  return [currentstate, setState];
};

/**
 * Update a state variable in sessionStorage and the global scope.
 *
 * @param {string} statename - The name of the state variable.
 * @param {*} newState - The new state value.
 */
const setState = (statename, newState) => {
  window[statename] = sessionStorage.setItem(
    statename,
    JSON.stringify(newState)
  );
  window.postMessage({ state: newState }, "*");
  hydrate();
};

/**
 * Create a store with state management functionality.
 *
 * @param {Object} initialState - The initial state of the store.
 * @returns {Object} An object containing state management functions.
 */
const createStore = (initialState) => {
  let state = initialState;
  const subscribers = new Set();

  /**
   * Update the store's state and notify subscribers.
   *
   * @param {Object} newState - The new state to set.
   */
  const setState = (newState) => {
    state = newState;
    subscribers.forEach((subscriber) => subscriber(state));

    // Update local storage with the new state
    if (localStorage.getItem("store")) {
      let store = JSON.parse(localStorage.getItem("store"));
      store = { ...store, ...state };
      localStorage.setItem("store", JSON.stringify(store));
    } else {
      localStorage.setItem("store", JSON.stringify(state));
    }

    // Notify other windows/frames about the state change
    window.postMessage({ state: state }, "*");
    hydrate();
  };

  /**
   * Subscribe a function to be notified of state changes.
   *
   * @param {Function} subscriber - The function to call when the state changes.
   * @returns {Function} A function to unsubscribe the subscriber.
   */
  const subscribe = (subscriber) => {
    subscribers.add(subscriber);
    return () => {
      subscribers.delete(subscriber);
    };
  };

  return { state, setState, subscribe };
};

/**
 * Create an authentication object with utility methods for managing user permissions and roles.
 *
 * @param {Object} options - The options object.
 * @param {Array} options.rulesets - An array of rulesets defining user permissions.
 * @param {Object} options.user - The user object containing roles and other information.
 * @returns {Object} The authentication object with utility methods.
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
      return user.roles && user.roles.includes(role);
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
      if (!rules.some((existingRule) => existingRule.action === rule.action)) {
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
 * Create a synchronized store with field-level state management.
 *
 * @param {string} storeName - The name of the store.
 * @param {Object} initialState - The initial state of the store.
 * @returns {Object} An object containing field management functions.
 */
const useSyncStore = (storeName, initialState) => {
  const storedState = JSON.parse(localStorage.getItem("store")) || initialState;
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
    const newState = { ...store.state, [fieldName]: value };
    store.setState(newState);
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
    localStorage.setItem("store", "");
  };

  return {
    getField,
    setField,
    subscribe,
    clear,
  };
};

/**
 * Create an external store with API integration and local storage caching.
 *
 * @param {Object} options - Configuration options for the external store.
 * @param {Function} options.api - The API method to fetch data.
 * @param {string} options.storeKey - The key for storing data in local storage.
 * @param {Object} initialState - The initial state of the store.
 * @returns {Object} An object containing store management functions.
 */
const useExternalStore = (options, initialState) => {
  const store = createStore(initialState);
  const { subscribe, setState } = store;

  let consecutiveFetches = 0;
  let lastFetchedData = null;
  let debounceTimer = null;

  if (options.api) {
    const apiMethod = options.api;

    /**
     * Update the store with fetched data from the API.
     *
     * @param {...*} args - Arguments to pass to the API method.
     */
    store.update = async (...args) => {
      try {
        const fetchedData = await apiMethod(...args);

        if (JSON.stringify(fetchedData) === JSON.stringify(lastFetchedData)) {
          consecutiveFetches++;
        } else {
          consecutiveFetches = 1;
          lastFetchedData = fetchedData;

          // Save the fetched data to localStorage
          localStorage.setItem(options.storeKey, JSON.stringify(fetchedData));
        }

        if (consecutiveFetches === 3) {
          clearTimeout(debounceTimer); // Clear previous timer
          debounceTimer = setTimeout(() => {
            console.log("Updating state with fetched data:", fetchedData);
            setState(fetchedData);
            consecutiveFetches = 0;
          }, 500); // Adjust the delay time as needed
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    // Load initial state from localStorage
    const storedData = localStorage.getItem(options.storeKey);
    if (storedData) {
      localStorage.setItem(options.storeKey, storedData);
      if (!isntHydrated) {
        hydrate(isntHydrated);
        isntHydrated = true;
      }
    }
  }

  return {
    ...store,
    subscribe,
    delete: () => {
      localStorage.removeItem(options.storeKey);
    },
    clear: () => {
      localStorage.setItem(options.storeKey, "");
    },
    return: () => {
      isntHydrated = false;
    },
  };
};

/**
 * Create a state management hook that uses a reducer function to update state.
 *
 * @template S, A
 * @param {function(S, A): S} reducer - The reducer function that updates the state.
 * @param {S} initialState - The initial state value.
 * @returns {[S, function(A): void]} An array containing the current state and a dispatch function.
 */
const useReduce = (reducer, initialState) => {
  /**
   * The current state managed by the reducer.
   * @type {S}
   */
  const [state, setState] = useState(initialState + "state", initialState);

  /**
   * Dispatches an action to the reducer to update the state.
   *
   * @param {A} action - The action to be dispatched.
   */
  const dispatch = (action) => {
    const newState = reducer(state, action);
    setState(newState);
  };

  return [state, dispatch];
};

const getState = (statename) => {
  const storedState = sessionStorage.getItem(statename);
  return storedState ? JSON.parse(storedState) : null;
};
window["getState"] = getState;
window["setState"] = setState;

/**
 *
 * @param {Function} callback
 * @param {Array} dependencies
 * @example
 * useEffect(() => {
 *  console.log('state changed');
 * }, ['state']);
 */
const useEffect = (callback, dependencies) => {
  callback();
  window.addEventListener("message", (event) => {
    if (dependencies.includes(event.data.state)) {
      callback(event.data.state);
      return;
    }
  });
};

const register = (template) => {
  templates.push(template);
};
/**
 *
 * @param {string} path
 * @param {object} props
 * @returns  {Promise} - Promise with the obstructed html.
 * @example
 * const header = await require('./components/header.html');
 */

const require = (path, props) => {
  const promise = new Promise((resolve, reject) => {
    if (cache[path]) {
      resolve(cache[path]);
    }
    if (!path.endsWith(".html")) {
      reject("Only html files are supported");
    }
    fetch(path)
      .then((response) => {
        return response.text();
      })
      .then((code) => {
        cache[path] = new Function("props", "return " + "`" + code + "`");
        hydrate();
        resolve(cache[path]);
      });
  });
  return promise;
};
window["require"] = require;

/**
 * @typedef {Object} $s
 * @property {object}  styles - Object with css properties.
 * @returns {string} - String with css properties.
 * @example
 * $s({ color: 'red' })
 */
function $s(styles = {}) {
  let result = "";
  for (let key in styles) {
    result += `${key}: ${styles[key]};`;
  }
  return `style="${result}"`;
}

window.onbeforeunload = function () {
  sessionStorage.clear();
};
