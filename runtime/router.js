import { Component } from "./vader.js";

let middlewares = [];

 

/**
 * @class VaderRouter
 * @description  - creates an instance of Vader Express Router
 *  
 * @param {String} path
 * @param {Function} handler
 * @param {object} req  request object
 * @param {object} res  response object
 * @returns {Object} Express
 *  
 */
class VaderRouter{
    /**
     * @constructor
     * @param {*} basePath 
     *  
     */
    constructor(/**@type {string}**/basePath, /**@type {number}**/port) {
      this.routes = [];
      this.middlewares = [];
      this.errorMiddlewares = [];
      this.listeners = [];
       
      this.basePath = basePath;
     
    }
  
    /**
     * @method get
     * @param {String} path
     * @param {Function} handler
     * @param {{a:b}} req  request object
     * @description This method is used to register a get route
     * @returns {void}
     * @memberof Express
     */
    get(path,  handler) {
     
      this.routes.push({
        path,
        handler,
        method: 'get',
      });
    }
    /**
     * @method use
     * @description This method allows you to use middlewares
     * @param {Function} middleware 
     */
  
    use(/* path, */ middleware) {
      console.log(middleware)
      this.middlewares.push(middleware);
    }
  
    /**
     * @method listen
     * @param {String} port - unique id for the listener
     * @param {Function} callback - callback function
     * @description This method is used to start listening to the routes
     * @returns {void}
     * 
     */
  
    listen(port, callback) {
      if(!port){
       port = Math.random().toString(36).substring(7);
      }
      this.listeners.push(port);
      if (this.listeners.length === 1) {
        this.handleRoute(window.location.hash);
      }else{
        this.listeners.pop();
      }
      if (callback) {
        callback();
      }
      window.onhashchange = () => {
        this.handleRoute(window.location.hash);
      }
    }
    /**
     * @method extractParams
     * @description This method is used to extract parameters from the route path
     * @param {*} routePath
     * @param {*} hash 
     * @returns  {Object} params
     * @memberof Express
     */
  
    extractParams(routePath, hash) {
      const routeParts = routePath.split('/');
      const hashParts = hash.split('/');
      const params = {};
      routeParts.forEach((part, index) => {
        if (part.startsWith(':')) {
          const paramName = part.slice(1);
          params[paramName] = hashParts[index];
        }else if(part.startsWith('*')){ 
          let array = hashParts.slice(index)
          array.forEach((i, index)=>{
            params[index] = i
          })
        }
      });
      return params;
    }
    extractQueryParams(hash){
      
      const queryParams = hash.split('?')[1];
      if(!queryParams){
        return {};
      }
      const params = {};
      queryParams.split('&').forEach((param)=>{
        const [key, value] = param.split('=');
        params[key] = value;
      })
      return params;
    }
  
    /**
     * @method handleRoute
     * @param {String} hash
     * @description This method is used to handle the route
     */
  
    handleRoute(hash) {
      hash = hash.slice(1);
      let status = 200;
      let paramsCatchall = {}
      let hashBefore = hash;
      let route = this.routes.find((route) => {
        if (route.path === hash) {
          return true;
        }

        if(hash === '' && route.path === '/'){
          return true
        }
    
        if(hash.includes('?')){
           hash = hash.split('?')[0]
        } 
        if (route.path.includes('*') || route.path.includes(':')) {
          const routeParts = route.path.split('/');
          const hashParts = hash.split('/');
    
          if (routeParts.length !== hashParts.length && !route.path.endsWith('*')) { 
            return false;
          }
    
          for (let index = 0; index < routeParts.length; index++) {
            const routePart = routeParts[index];
            const hashPart = hashParts[index];
    
            if (routePart.startsWith(':') || routePart.startsWith('*')) {
               
              continue;
            }
    
            if (routePart !== hashPart) {
              
              return false;
            }
          }
    
          return true;
        }
     
        const params = this.extractParams(route.path, hashBefore);
        return Object.keys(params).length > 0;
      }); 
    
      
      if (!route) { 
        route = this.routes.find((errorRoute) => {
          if (errorRoute.path.includes('/404')){ 
            this.error = true;
            return true;
          } else if (!this.error && errorRoute.path.includes('/404')){
            window.location.hash = this.basePath
          }
        });
    
        status = route ? 200 : 404;
      }
     
      const queryParams = this.extractQueryParams(hashBefore);
      const params =  route && route.path ? this.extractParams(route.path,  hashBefore) : {};
      const req = {
        headers: {},
        params: params,
        query: queryParams,
        path: hash,
        method: route ? route.method : 'get',
      };
    
      // @ts-ignore
      window.$CURRENT_URL = req.path
     
      // @ts-ignore
      window.$FULL_URL = window.location.href.replace('#', '')
     
      const res = {
        status: status,
        /**
         * @method log
         * @param {String} type 
         * @description This method is used to log the request and response
         */
        log: (type) => {
          if(type === undefined){
            console.log(`${req.path} ${req.method} ${res.status} ${req.timestamp}`);
          }else{
            console.table({
              'Request Path': req.path,
              'Request Method': route.method,
              'Response Status': res.status,
              'Request Timestamp': req.timestamp,
            });
          }
        },
        refresh: () => {
           this.handleRoute(window.location.hash);
        },
        redirect: (path) => { 
          !path.startsWith('/') ? path = `/${path}` : null;
          window.location.hash = `#${path}`;
        },
        render: async (/**@type {Component} */ Component, req, res) => {
          try {
              if(!Component.default || !Component.default.constructor){
                let message = !Component.default ? `Router expected a default exported component ie: export default class Component` : !Component.default.constructor ? 'Component is not a class' : null;
                throw new Error(message);
              }
              
      
              // Create an instance of the component
              Component = Component.default ? new Component.default() : Component.constructor ? new Component() : Component;
      
              // Set the 'mounted' flag to true
              Component.mounted = true;
      
              // Check if the root element exists
              if (!document.querySelector('#root')) {
                  throw new Error('Root element not found, please add an element with id root');
              }
      
              // Reset component state
              Component.reset();
              Component.components = {};
              Component.request = req;
              Component.response = res;
      
              // Check if the component has a router and is not a child component
              if (Component.router.use && !Component.isChild) {
                 
                  // Allow pausing the route and run code before rendering
                  await new Promise(async (resolve) => {
                      await Component.router.use(req, res)
                      if(req.pause){
                      let timer = setInterval(() => {
                        if(!req.pause){
                          resolve();
                          clearInterval(timer);
                        }
                      }, 1000);
                     }else{
                        resolve();
                     }
                  });
              } else if (Component.router.use && Component.isChild) {
                  console.warn('Router.use() is not supported in child components');
              } 
                  const renderedContent = await Component.render();
                  document.querySelector('#root').innerHTML = renderedContent;
                  Component.bindMount();
                  Component.onMount();
             
          } catch (error) {
              console.error(error);
          }
      },
        setQuery: (query) => {
          let queryString = '';
          Object.keys(query).forEach((key, index) => {
            queryString += `${index === 0 ? '?' : '&'}${key}=${query[key]}`;
          }); 
          let route = window.location.hash.split('?')[0];
          queryString = queryString.replace('/', '-').replaceAll('/', '-')
          window.location.hash = `${route}${queryString}`;
        },
        send: (data) => {
          document.querySelector('#root').innerHTML = data;
        },
        json: (data) => {
          const rootElement = document.querySelector('#root');
        
          // Clear existing content in #root
          rootElement.innerHTML = '';
        
          // Create a <pre> element
          const preElement = document.createElement('pre');
        
          // Set the text content of the <pre> element with formatted JSON
          preElement.textContent = JSON.stringify(data, null, 2);
        
          // Append the <pre> element to the #root element
          rootElement.appendChild(preElement);
        }
        
      }; 
      middlewares.forEach((middleware) => { 
        middleware(req, res);
      });
    
      route ? route.handler(req, res) : null;
    }
    
    
  }
 
  window.VaderRouter = VaderRouter;
  
  export default VaderRouter;
   