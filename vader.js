
/**
 * @function vhtml
 * @param {*} strings 
 * @param  {...any} args 
 * @returns  modified string
 *   
 */
export function vhtml(strings, ...args) {
    let result = '';
  
    for (let i = 0; i < strings.length; i++) {
      result += strings[i];
      if (i < args.length) {
        result += args[i];
      }
    }
  
    return result;
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
    render: (states, setState, useState, useEffect, useAuth) => {
    
   
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
    const states = {};
    const effects = {};
    const executedEffects = {};
    let storedProps = {}
    /**
     * @function setState
     * @param {*} key 
     * @param {*} value 
     * @returns {null}
     * @description Allows you to change state of component and re-render it
     */
    const setState = (key, value) => {
      states[key] = value;
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
      if (!(key in states)) {
        states[key] = initialValue;
        window[key] = initialValue;
      }
    
      return [states[key], (newValue) => setState(key, newValue)];
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
        runEffects();
    };
  
    /**
     * @function useAuth
     * @param {*} rulesets 
     * @param {*} user 
     * @returns {Object} {canAccess, grantAccess, revokeAccess}
     * @description Allows you to manage access to resources through rulesets
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
  
    const updateComponent = () => {
      const componentContainer = document.querySelector(`[data-component="${name}"]`);
      if (componentContainer) {
        runEffects();
        componentContainer.innerHTML = options.render(states, setState, useState, useEffect, useAuth, useSyncStore,  storedProps);
      }
    };
  
    const render = (props) => {
        storedProps = props;
      const componentContainer = document.querySelector(`[data-component="${name}"]`);
      if (componentContainer) {
        runEffects();
        componentContainer.innerHTML = options.render(states, setState, useState, useEffect, useAuth, useSyncStore,  props);
      } else {
        return vhtml`
          <div data-component="${name}">
            ${options.render(states, setState, useState, useEffect, useAuth, useSyncStore,  props)}
          </div>
        `;
      }
    };
  
    return {
      render,
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
   * @function form
   * @param {*} config 
   * @returns  {Object} componentInstance
   * @description Allows you to create form component 
   */
  export const form = (config) => {
    const { name, fields,  inputs, attributes, button,  rules, append } =
      config;
    const formData = {};
  
    const componentInstance = {
      state: {},
      props: {},
      on: (event, callback) => {
        componentInstance[event] = callback;
      },
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
  
  
        if (componentInstance["submit"]) {
          document.onsubmit = (ev) => {
            if (ev.target.name === name) {
              let event = formData;
  
              event["reset"] = componentInstance.reset;
              componentInstance["submit"](ev, event);
            }
          };
        } else if (componentInstance["reset"]) {
          document.onreset = (ev) => {
            if (ev.target.name === name) {
              for (const fieldName in fields) {
                formData[fieldName] = fields[fieldName].value || "";
              }
              componentInstance["reset"](ev);
            }
          };
        } else if (componentInstance["change"]) {
          document.onchange = (ev) => {
            if (formData[ev.target.name]) {
              let event = formData;
  
              event["reset"] = componentInstance.reset;
              componentInstance["change"](ev, event);
            }
          };
        }
      },
    
      render:   () => {
        const formElement = document.createElement("form");
        formElement.name = name;
  
        if (attributes) {
          for (const key in attributes) {
            formElement.setAttribute(key, attributes[key]);
          }
        }
         
  
        for (const fieldName in fields) {
          const fieldConfig = fields[fieldName];
          const fieldElement = document.createElement("input");
          fieldElement.name = fieldName;
          fieldElement.value = fieldConfig.value || "";
          fieldElement.type = fieldConfig.type || "text";
          fieldElement.placeholder = fieldConfig.placeholder || "";
          if (inputs && inputs[fieldName]) {
            const fieldStyles = inputs[fieldName];
            if(fieldStyles.styles) {
              for (const key in fieldStyles.styles) {
                fieldElement.style[key] = fieldStyles.styles[key];
              }
            }
            if(fieldStyles.label) {
              const label = document.createElement('label');
              label.innerHTML = fieldStyles.label.name || fieldName;
              label.setAttribute('for', fieldName);
              formElement.appendChild(label);
              if(fieldStyles.label.styles) {
                for (const key in fieldStyles.label.styles) {
                  label.style[key] = fieldStyles.label.styles[key];
                }
              }
              if(fieldStyles.label.attributes) {
                for (const key in fieldStyles.label.attributes) {
                  label.setAttribute(key, fieldStyles.label.attributes[key]);
                }
              }
            }
  
            if (fieldStyles.attributes) {
              for (const key in fieldStyles.attributes) {
                fieldElement.setAttribute(key, fieldStyles.attributes[key]);
              }
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
        if (button.attributes) {
          for (const key in button.attributes) {
            submitButton.setAttribute(key, button.attributes[key]);
          }
        }
        formElement.appendChild(submitButton);
        if(append) {
          for (const key in append) {
             switch (key) {
                case 'before':
                  let elBefore = document.createElement('div');
                  elBefore.innerHTML = append[key];
                  formElement.prepend(elBefore);
                  break;
                case 'after':
                  let el = document.createElement('div');
                  el.innerHTML = append[key];
                  formElement.append(el);
                  break;
                
                default:
                  break;
             }
          }
        }
        // Call componentDidMount
        componentInstance.componentDidMount(formElement);
  
        return formElement.outerHTML;
      },
    };
    window.currentRender = componentInstance;
  
    return componentInstance;
  };
   
