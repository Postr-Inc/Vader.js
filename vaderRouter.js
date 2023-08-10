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
    if (!this.routes[window.location.hash.substring(1)]) {
      window.location.hash = this.starturl;
    }
    window.addEventListener("hashchange", () => {
      let hash = window.location.hash.substring(1).split("/")
        ? window.location.hash.substring(1).split("/")
        : window.location.hash.substring(1);
      // remove '' from array
      hash = hash.filter((item) => item !== "");
      const basePath = "/" + hash[0];

      if (!this.routes[basePath] && !this.customerror) {
        window.location.hash = this.starturl;
      } else if (!this.routes[basePath] && this.customerror) {
        const errBody = {
          status: 404,
          message: "Page not found",
        };
        this.handleError("404", errBody);
      }
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
      console.error(`No error handler found for type: ${type}`);
    }
  }
  /**
   * @alias get
   * @param {*} path
   * @param {*} callback
   * @returns  {void}
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
        if (debug.enabled) {
          debug.log(
            [
              `
                Cannot use query params with path params ${path} ${
                window.location.hash.substring(1).split("?")[1]
              }`,
            ],
            "assert"
          );
        }

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

      window.$URL_PARAMS = params;
      window.$URL_QUERY = query;

      const res = {
        return: function (data) {
          this.hooked = false;
        },
      };

      callback(req, res);

      return true;
    }

    this.hooked = false;
    return false;
  }

  kill(path) {
    const listener = this.listeners[path];

    if (listener) {
      window.removeEventListener("message", listener);
      delete this.listeners[path];
    }
  }
  /**
   * @alias use
   * @param {*} path
   * @returns {void}
   * @memberof VaderRouter
   * @description  Allows you to set routes to be used throughout your spa.
   */
  use(path) {
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
    path = parsedPath;
    this.routes[path] = true;
    this.storedroutes.push(path);
  }

  onload(callback) {
    // await dom to be done make sure no new elements are added
    if (
      document.readyState === "complete" ||
      document.readyState === "loaded" ||
      document.readyState === "interactive"
    ) {
      callback();
    }
  }

  /**
   * @alias on
   * @param {*} path
   * @param {*} callback
   * @returns {void}
   * @memberof VaderRouter
   * @description  Allows you to perform actions when the currentRoute changes.
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

      this.currentUrl = path;
      // replace params if preset
      let route = "";
      if (path.includes(":")) {
        route = path.split(":")[0].replace(/\/$/, "");
      } else {
        route = path.replace(/\/$/, "");
      }

      window.$CURRENT_URL = route;
      window.$URL_PARAMS = {};
      if (
        window.location.hash.substring(1).match(regex) &&
        this.routes[$CURRENT_URL]
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
        window.$URL_QUERY = query;
        window.$URL_PARAMS = params;

        /**
         * @alias callback
         * @type {function}
         * @param {Object} req - The request object.
         * @returns {void}
         * @memberof VaderRouter
         * @description  Allows you to perform actions when the currentRoute changes.
         */
        callback(req);
      }
    });
  }
}
export default VaderRouter;
