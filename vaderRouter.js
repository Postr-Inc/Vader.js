 // @ts-ignore
 window.$URL_PARAMS = {};
 // @ts-ignore
window.$URL_QUERY = {};

/**
 * @file VaderRouter.js
 * @version 1.0.0
 * @license MIT
 * @description A simple router for single page applications.
 */
class VaderRouter {
  /**
   * Creates an instance of VaderRouter.
   * @param {string} starturl - The starting URL for the router.
   */
  constructor(starturl) {
    /**
     * Object to store route information.
     * @type {Object}
     */
    this.routes = {};

    /**
     * The current URL being navigated.
     * @type {string}
     */
    this.currentUrl = "";

    /**
     * Listener function for hash change events.
     * @type {Function}
     */
    this.hashChangeListener = null;

    /**
     * Error handlers for different error types.
     * @type {Object}
     */
    this.errorHandlers = {};

    /**
     * Flag indicating if custom error handling is enabled.
     * @type {boolean}
     */
    this.customerror = null;

    /**
     * Flag indicating if the router is currently handling a route.
     * @type {boolean}
     */
    this.hooked = false;

    /**
     * The starting URL for the router.
     * @type {string}
     */
    this.starturl = starturl;

    /**
     * Array to store stored routes.
     * @type {string[]}
     */
    this.storedroutes = [];
  }

  /**
   * Starts the router.
   */
  start() {
    if (window.location.hash === "") {
      window.location.hash = this.starturl;
    }
    this.handleRoute("GET");
    window.addEventListener("hashchange", () => {
      this.handleRoute("POST");
    });
  }

  /**
   * @alias handleErrors
   * @param {*} type
   * @param {*} callback
   * @returns {void}
   * @memberof VaderRouter
   * @description Handles errors for the router.
   * @example
   * router.handleErrors('404', (err) => {
   *  // do something with err
   * });
   */
  handleErrors(type, callback) {
    this.errorHandlers[type] = callback;
    this.customerror = true;
  }
  handleRoute(method) {
   
    let route = window.location.hash.substring(1);
 // @ts-ignore
    window.$CURRENT_URL = route;

    // remove query params from route
    if (route.includes("?")) {
      route = route.split("?")[0];
    }
    route = route.split("/")[0] + "/" + route.split("/")[1];
    if (this.routes[route]) {
       
      this.storedroutes.push(route);
      const req = {
         // @ts-ignore
        params: $URL_PARAMS ? $URL_PARAMS : {},
         // @ts-ignore
        query: $URL_QUERY ? $URL_QUERY : {},
        url: route,
        method: method ? method : "GET",
      };
      const res = {
        return: function (data) {
          this.hooked = false;
        },
        render: function (selector, data) {
          document.querySelector(selector).innerHTML = data;
        },
      };
      if(typeof this.routes[route] === 'function'){
        this.routes[route](req, res);
      }
    } else {
      if (this.customerror) {
        this.handleError("404", route);
        console.error("404: Route not found");
      } else {
        console.error("404: Route not found");
      }

       
    }
  }
  /**
   *
   * @param {*} type
   * @param {*} data
   * @returns {void}
   * @memberof VaderRouter
   * @description used by start() to handle errors.
   */

  handleError(type, data) {
    if (this.errorHandlers[type]) {
      this.errorHandlers[type](data);
    } else {
      console.error("Error: No error handler found for " + type);
    }
  }
  /**
   * @alias get
   * @param {String} path
   * @param {Function} callback
   * @returns  {boolean}
   * @memberof VaderRouter
   * @description  Allows you to perform actions when path matches the current Route on visit.
   */
  get(path, callback) {
    const paramNames = [];
    const queryNames = [];
    const parsedPath = path
      .split("/")
      .map((part) => {
        if (part.startsWith(":")) {
          paramNames.push(part.substring(1));
          return "([^/]+)";
        }
        if (part.startsWith("*")) {
          paramNames.push(part.substring(1));
          return "(.*)";
        }
        if (part.startsWith("?")) {
          queryNames.push(part.substring(1));
          return "([^/]+)";
        }
        return part;
      })
      .join("/");
    const regex = new RegExp("^" + parsedPath + "(\\?(.*))?$");

    if (window.location.hash.substring(1).match(regex)) {
      this.storedroutes.push(window.location.hash.substring(1));
      const matches = window.location.hash.substring(1).match(regex);
      const params = {};

      for (let i = 0; i < paramNames.length; i++) {
        params[paramNames[i]] = matches[i + 1];
      }
      if (
        path.includes(":") &&
        window.location.hash.substring(1).split("?")[1]
      ) {
         

        return false;
      }
      const query = {};

      const queryString = window.location.hash.substring(1).split("?")[1];
      if (queryString) {
        const queryParts = queryString.split("&");
        for (let i = 0; i < queryParts.length; i++) {
          const queryParam = queryParts[i].split("=");
          query[queryParam[0]] = queryParam[1];
        }
      }
      /**
       * @alias req
       * @type {Object}
       * @property {Object} params - The params object.
       * @returns {Object}  current url params
       */

      const req = {
        params: params,
        query: query,
        url: window.location.hash.substring(1),
        method: "GET",
      };
 // @ts-ignore
      window.$URL_PARAMS = params;
       // @ts-ignore
      window.$URL_QUERY = query;
       // @ts-ignore
      window.$CURRENT_URL = window.location.hash.substring(1);
      /**
       * @alias render
       * @param {*} selector
       * @param {*} data
       * @returns {void}
       * @memberof VaderRouter
       * @description  Allows you to perform actions when the currentRoute changes.
       */
      const res = {
        return: function (data) {
          this.hooked = false;
        },
        render: function (selector, data) {
          document.querySelector(selector).innerHTML = data;
        },
      };

      callback(req, res);
     // @ts-ignore
      return true;
    }

    this.hooked = false;
    return false;
  }

  kill(path) {
    if (this.routes[path]) {
      delete this.routes[path];
    }
  }
  /**
   * @alias use
   * @param {String} pattern
   * @param {Function} callback
   * @returns {void}
   * @memberof VaderRouter
   * @description  Allows you to set routes to be used throughout your spa.
   */
  use(pattern, callback = null) {
    const regexPattern = pattern
      .replace(/:[^/]+/g, "([^/]+)") // Replace :param with a capturing group
      .replace(/\//g, "\\/"); // Escape forward slashes
  
    const regex = new RegExp("^" + regexPattern + "(\\?(.*))?$");
    let params = {};
    let query = {};
  
    // Get params
    const match = window.location.hash.substring(1).match(regex);
  
    if (match) {
      this.storedroutes.push(window.location.hash.substring(1));
      const matches = match.slice(1); // Extract matched groups
  
      // Extract named params from the pattern
      const paramNames = pattern.match(/:[^/]+/g) || [];
      for (let i = 0; i < paramNames.length; i++) {
        const paramName = paramNames[i].substring(1); // Remove the leading ":"
        params[paramName] = matches[i];
      }
  
      query = {};
  
      const queryString = matches[paramNames.length]; // The last match is the query string
      if (queryString) {
        const queryParts = queryString.split("&");
        for (let i = 0; i < queryParts.length; i++) {
          const queryParam = queryParts[i].split("=");
          query[queryParam[0]] = queryParam[1];
        }
      }
    }
   // @ts-ignore
    window.$URL_PARAMS = params;
     // @ts-ignore
    window.$URL_QUERY = query;
  
    if (callback) {
      this.routes[pattern] = callback;
    } else {
      this.routes[pattern] = true;
      this.storedroutes.push(window.location.hash.substring(1));
    }
  }
  
  

  onload(callback) {
    // await dom to be done make sure no new elements are added
    if (
      document.readyState === "complete" ||
       // @ts-ignore
      document.readyState === "loaded" ||
      document.readyState === "interactive"
    ) {
      callback();
    }
  }

  /**
   * @alias on
   * @param {String} path
   * @param {Function} callback
   * @returns {void}
   * @memberof VaderRouter
   * @description  Allows you to perform actions when the currentRoute changes.
   *
   */
  on(path, callback) {
    window.addEventListener("hashchange", () => {
      const paramNames = [];
      const queryNames = [];
      const parsedPath = path
        .split("/")
        .map((part) => {
          if (part.startsWith(":")) {
            paramNames.push(part.substring(1));
            return "([^/]+)";
          }
          if (part.startsWith("*")) {
            paramNames.push(part.substring(1));
            return "(.*)";
          }
          if (part.startsWith("?")) {
            queryNames.push(part.substring(1));
            return "([^/]+)";
          }
          return part;
        })
        .join("/");
      const regex = new RegExp("^" + parsedPath + "(\\?(.*))?$");

      let hash = window.location.hash.split("#")[1]
        ? window.location.hash.split("#")[1]
        : window.location.hash;

      let basePath = "";
      if (hash.length > 1) {
        basePath = hash.split("/")[0] + "/" + hash.split("/")[1];
      } else {
        basePath = hash[0];
      }
      const route = basePath;
      this.currentUrl = route;
      // @ts-ignore
      window.$CURRENT_URL = route;
       // @ts-ignore
      window.$URL_PARAMS = {};
      if (
        window.location.hash.substring(1).match(regex)  &&
         // @ts-ignore
        this.routes[window.$CURRENT_URL]
      ) {
        this.storedroutes.push(window.location.hash.substring(1));
        const matches = window.location.hash.substring(1).match(regex);
        const params = {};

        for (let i = 0; i < paramNames.length; i++) {
          params[paramNames[i]] = matches[i + 1];
        }
        if (
          path.includes(":") &&
          window.location.hash.substring(1).split("?")[1]
        ) {
          console.error(
            "Cannot use query params with path params",
            path,
            window.location.hash.substring(1).split("?")[1]
          );
          return false;
        }
        const query = {};

        const queryString = window.location.hash.substring(1).split("?")[1];
        if (queryString) {
          const queryParts = queryString.split("&");
          for (let i = 0; i < queryParts.length; i++) {
            const queryParam = queryParts[i].split("=");
            query[queryParam[0]] = queryParam[1];
          }
        }
        const req = {
          params: params,
          query: query,
          url: window.location.hash.substring(1),
          method: "POST",
        };
        const res = {
          return: function (data) {
            this.hooked = false;
          },
          /**
           * @alias send
           * @param {String} selector
           * @param {String} data
           * @returns {void}
           * @memberof VaderRouter
           * @description  Allows you to perform actions when the currentRoute changes.
           * @example
           * res.send('#root', '<h1>Hello World</h1>');
           * */
          send: function (selector, data) {
            document.querySelector(selector).innerHTML = data;
          },
          /**
           * @alias render
           * @param {String} selector
           * @param {String} data
           * @returns {void}
           * @memberof VaderRouter
           * @description  Allows you to perform actions when the currentRoute changes.
           */
          render: function (selector, data) {
            document.querySelector(selector).innerHTML = data;
          },
        };
         // @ts-ignore
        window.$URL_QUERY = query;
         // @ts-ignore
        window.$URL_PARAMS = params;

        /**
         * @alias callback
         * @type {function}
         * @param {Object} req - The request object.
         * @returns {void}
         * @memberof VaderRouter
         * @description  Allows you to perform actions when the currentRoute changes.
         */
        callback(req, res);
      } 
    });
  }
}
export default VaderRouter;
