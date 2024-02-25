/**
 * @fileoverview - A simple router for vaderjs - Kuai
 * @version - 1.0.0
 */
export class Kuai{
    constructor(config = { container: '#app'}){
        this.routes = [];
        this.middleware = [];
        this.container =  config.container ? config.container : document.getElementById('app');
        this.renderPlugins = [];
    }
  
    res = {
        /** 
         * @description render text to the container
         * @param {string} data 
         */
        text: (data) => {
            this.container.innerHTML = data;
        },
        /**
         * @method html
         * @description render html to the container
         * @param {any} data 
         * @returns 
         */
        html: (data) => {
            switch(typeof data){
                case 'function':
                    if(this.renderPlugins.length > 0){
                        this.renderPlugins.forEach((plugin) => {
                            if(plugin.for === 'html'){
                                console.log('Plugin', plugin)
                                plugin.plugin(data, this.container)
                            }
                        })
                        return;
                    }
                    this.container.innerHTML = data();
                    break;
                case 'string':
                    this.container.innerHTML = data;
                    break;
            } 
  
        },
        /**
         * @method json
         * @description render json to the container
         * @param {Object} data 
         */
        json: (data) => {
            this.container.innerHTML =  `<Oject data=${JSON.stringify(data)}></Object>`
        }
    }
    req = {
        /**
         * @method navigate
         * @description - navigate to a new route
         * @param {string} path 
         */
        navigate: (path) => {
            window.history.pushState({}, '', path);
            let currentPath = this.match(window.location.pathname.replace('/index.html', ''))
            if(currentPath){
                this.currentRoute = currentPath.path
                currentPath.callback(this.res, currentPath.params, this.extractQueryParams(window.location.search));
            }
        },
        /**
         * @method back
         * @description - go back to the previous route
         */
        back: () => {
            window.history.back();
        },

        /**
         * @method forward
         * @description - go forward to the next route
         * @returns {void}
         * **/
        forward: () => {
            window.history.forward();
        },
        url: window.location
    }
    /**
     * @private
     */
    extractQueryParams(path){
        let params = new URLSearchParams(path);
        let query = {};
        for(let param of params){
            query[param[0]] = param[1];
        }
        return query;
    }
     /**
     * @private
     */
    extractParams(routePath, currentPath){
        const routeParts = routePath.split('/').filter((part) => part !== '');
        const hashParts = currentPath.split('/').filter((part) => part !== ''); 
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
    use(path, middleware){
        this.middleware.push({path, middleware}); 
    }
    /**
     * @method usePlugin
     * @description - add a plugin to handle how the route should be rendered
     * @param {Function} plugin 
     * @param {('html')} method 
     */
    usePlugin(plugin, method){
        this.renderPlugins.push({plugin, for: method})
    }
    /**
     * @method match
     * @description - match a route to the current path and return the route object
     * @param {string} route 
     * @returns  {Object} -  {path: string, callback: Function, params: Object}
     */
    match(hash){
        hash = hash.endsWith('/') ? hash.slice(0, -1) : hash;  
        hash.includes('index.html') ? hash = hash.replace('index.html', '') : null;
        if(hash.includes('?')){
          hash = hash.split('?')[0]
       } 
        let route = this.routes.find((route) => {  
          if (route.path === hash) { 
            return true;
          }
  
          if(hash === '' && route.path === '/'){
            return true
          }
      
          
          if (route.path.includes('*') || route.path.includes(':')) {
            const routeParts = route.path.split('/').filter((part) => part !== ''); 
            const hashParts = hash.split('/').filter((part) => part !== '');  
              if(this.basePath){
                  hashParts.shift();
              } 
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
          
        });  
        if(route){
          let params = this.extractParams(route.path, hash)
          return { ...route, params}
        }
        return null;
   
    }
  
    /**
     * @description - create a new route
     * @param {string} path 
     * @param {Function} callback 
     */
    get(path, callback){
        this.routes.push({path, callback});
    }
  
    /**
     * @method listen
     * @description - listen for route changes
     */
    listen(){ 
        let currentPath = this.match(window.location.pathname.replace('/index.html', '')) 
        if(currentPath){
            this.middleware.forEach((middleware) => {
                if(middleware.path === currentPath.path){
                    middleware.middleware();
                }
            });
            this.currentRoute = currentPath.path
            let obj = {
                ...this.res,
                res: this.res,
                req:{
                    ...this.req,
                    params: (param) => currentPath.params[param]
                
                }
            }
            currentPath.callback(obj);
        }
        window.onpopstate = () => {
            let currentPath = this.match(window.location.pathname.replace('/index.html', ''))
            if(currentPath){
                this.currentRoute = currentPath.path
                currentPath.callback(this.res, currentPath.params, this.extractQueryParams(window.location.search));
            }
        }
    
    }
  }
  
  export default Kuai;