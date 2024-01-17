import { Component } from "./vader.js";

 

 

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
      let route = this.routes.find((route) => {
        if (route.path === hash) {
          return true;
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
    
        const params = this.extractParams(route.path, hash);
        return Object.keys(params).length > 0;
      });
    
      
      if (!route) { 
        route = this.routes.find((errorRoute) => {
          console.log(errorRoute)
          if (errorRoute.path.includes('/404')){ 
            this.error = true;
            return true;
          } else if (!this.error && errorRoute.path.includes('/404')){
            window.location.hash = this.basePath
          }
        });
    
        status = route ? 200 : 404;
      }
     
      const queryParams = this.extractQueryParams(hash);
      const params =  route && route.path ? this.extractParams(route.path, hash) : {};
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
        redirect: (path) => { 
          !path.startsWith('/') ? path = `/${path}` : null;
          window.location.hash = `#${path}`;
        },
        render: async (/**@type {Component} */ Component, req, res) => {
          
            if(!Component || !Component.default || !Component.constructor){
              let message = !Component || !Component.default ? 'default' : 'constructor';
              switch(message){
                case 'default':
                  throw new Error(`Component must have a default export ex: return {default: Component}`);
                  
                case 'constructor':
                  throw new Error(`Component is invalid, please check the constructor`);
                  
              }
             
            }
        
            Component = Component.default ? new Component.default() :  Component.constructor ? new Component() : Component;
            
         
            Component.mounted = true;
            
            if(!document.querySelector('#root')){
              throw new Error('Root element not found, please add an element with id root');
            }
            Component.router.use = this.use.bind(this)
            Component.state = {}
            Component.reset();
            Component.components = {}
            Component.request = req;
            Component.response = res;
            document.querySelector('#root').innerHTML =   Component.render() 
            Component.bindMount();
            Component.onMount()
           
           
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
        json: (selector, data) => {
          
          if(typeof selector === 'string'){
            // @ts-ignore
            let obj = document.createElement('object');
             // data url
            obj.data =  URL.createObjectURL(new Blob([JSON.stringify(data)], {type: 'application/json'}));
            // @ts-ignore
            document.querySelector(selector).appendChild(obj);
          }else{
            throw new Error('Selector must be a string');
          }
        } 
      };
      this.middlewares.forEach((middleware) => {
        middleware(req, res);
      });
    
      route ? route.handler(req, res) : null;
    }
    
    
  }

  window.VaderRouter = VaderRouter;
  
  export default VaderRouter;
   