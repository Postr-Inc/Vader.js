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
       window.onpopstate = async (e) => {   
        let route = window.location.pathname  
        let baseRoute = `/${route.split('/')[1]}` 
        if(!routes.find((route)=>route.url === baseRoute)){ 
          console.error(`Route ${route} not found`);
        }
        let html =  new DOMParser().parseFromString(await fetch(baseRoute, {
          cache: 'reload'
        }).then((res)=>res.text()), 'text/html').documentElement 
        

        document.querySelector('#root').innerHTML = html.querySelector('#root').innerHTML;
        document.title = html.querySelector('title').innerHTML; 
        document.querySelector('script[id="router"]').remove();
        let newscript = document.createElement('script');
        newscript.id = 'router';
        newscript.innerHTML = html.querySelector('script[id="router"]').innerHTML;
        newscript.setAttribute('type', 'module'); 
        document.body.appendChild(newscript);  
      }
      
      this.listeners.push(port);
      if (this.listeners.length === 1) { 
        this.handleRoute(window.location.pathname);
      }else{
        this.listeners.pop();
      }
      if (callback) {
        callback();
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
      const routeParts = routePath.split('/').filter((part) => part !== '');
      const hashParts = hash.split('/').filter((part) => part !== ''); 
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
        };
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
  
    checkroute(hash){ 
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
          const routeParts = route.path.split('/').filter((part) => part !== '');
          const hashParts = hash.split('/').filter((part) => part !== '');  
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

      return route;
    
    }
    /**
     * @method handleRoute
     * @param {String} hash
     * @description This method is used to handle the route
     */
  
    handleRoute(hash) {   
      let status = 200;
      let paramsCatchall = {}
      let hashBefore = hash; 
       
      let route = this.checkroute(hash);   
      if (!route) {
        route = window.routes.find((errorRoute) => {
          if (errorRoute.url.includes('/404') && !this.error && !window.devMode) {   
            console.error(`Route ${hash} not found`);
            this.error = true;  
            return false
            
          } else if (!this.error && errorRoute.url.includes('/404')){
             return true
          }
          
        });
    
        status = route ? 200 : 404; 
      }
     
      const queryParams = this.extractQueryParams(hashBefore); 
      const params =  route && route.path ? this.extractParams(route.path, hashBefore) : paramsCatchall;
    
     
      // remove queryparams fromparam
      Object.keys(params).forEach((key)=>{
        params[key] = params[key].split('?') ? params[key].split('?')[0] : params[key];
      })
      const req = {
        headers: {},
        params: params,
        query: queryParams,
        path: hash,
        fileUrl: window.location.href.split(window.location.origin)[1],
        url: window.location.href,
        method: route ? route.method : 'get',
        pause: false,
        timestamp: Date.now(),
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
           this.handleRoute(window.location.pathname)
        },
        redirect: (path) => { 
          !path.startsWith('/') ? path = `/${path}` : null;
          window.history.pushState({}, '', path);
          window.dispatchEvent(new Event('popstate'));
        },
        render: async (/**@type {Component} */ component, req, res, metadata) => {
          function isClass(funcOrClass) {
            return typeof funcOrClass === 'function' &&
              /^class\s/.test(Function.prototype.toString.call(funcOrClass));
          } 
          
          try {
              let c  = new Component();
              if(!isClass(component.default)){
                 let render = component.default.toString(); 
                 if(render.includes('this.key')){
                    throw new Error('Using this.key is not supported in functional components use the attribute key="a value" instead')
                 } 
                 
                
                 
                c.key =  component.default.toString().split('key="')[1] ? component.default.toString().split('key="')[1].split('"')[0] : null;
                
                let comp =  {
                   key: c.key,
                   render:  () => { 
                        return component.default.apply(c, [req, res])
                    },
                   request: req,
                   response: res,
                   params: params,
                   queryParams: queryParams,
                   reset: c.reset.bind(c), 
                   onMount: c.onMount.bind(c),
                   useState: null,
                   router: {
                     use: c.router.use.bind(c),
                   },
                   bindMount: c.bindMount.bind(c),
                   memoize: c.memoize.bind(c),
                   createComponent: c.createComponent.bind(c),
                   isChild: false, 
                   useState: c.useState.bind(c),
                   parseStyle: c.parseStyle.bind(c),
                   bind: c.bind.bind(c),
                   useRef: c.useRef.bind(c),
                   useReducer: c.useReducer.bind(c),
                   onMount: c.onMount.bind(c),
                   onUnmount: c.onUnmount.bind(c),
                   hydrate: c.hydrate.bind(c), 
                } 
                c.render = comp.render;
                c = comp; 
                 
              }else{
                let comp = new component.default(); 
                c.state = comp.state; 
                c = comp;
              }
            
          
          
            
              
              
           
        
      
              // Check if the root element exists
              if (!document.querySelector('#root')) {
                  throw new Error('Root element not found, please add an element with id root');
              }
       
              c.reset();
              c.components = {};
              c.request = req;
              c.response = res; 
              if (c.router.use && !c.isChild) {  
                  await new Promise(async (resolve) => {   
                    if(!isClass(component.default) ){ 
                      await component.default.apply(c, [req, res]) 
                      await c.router.use(req, res)
                      switch(req.pause){
                        case true: 
                          let timer = setInterval(() => {
                            if (!req.pause) { 
                              clearInterval(timer);
                              resolve();
                            }else{
                              console.log('still pausing  request', req.url)
                            }
                          }, 1000);
                          break;
                        case false: 
                          resolve();
                          break;
                      }
                    }else if(isClass(component.default)){
                        
                      await c.router.use(req, res) 
                      switch(req.pause){
                        case true:
                          console.log('pausing', req.pause)
                          let timer = setInterval(() => {
                            if (!req.pause) { 
                              clearInterval(timer);
                              resolve();
                            }else{
                              console.log('still pausing', req.pause)
                            }
                          }, 1000);
                          break;
                        case false:
                          resolve();
                          break;
                      }
                    }else{
                        resolve();
                    }
                  });
                  
                 
              } else if (c.router.use && c.isChild) {
                  console.warn('Router.use() is not supported in child components');
              }  
                  const renderedContent = await c.render();
                  if( document.querySelector('#root').innerHTML !== renderedContent){ 
                    document.querySelector('#root').innerHTML = renderedContent;
                  } 
                  c.bindMount();
                  c.onMount();
             
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
   