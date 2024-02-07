/**
 * @file Vader.js - A lightweight, modern, and fast front-end framework for building web applications.
 * @copyright - Malikwhitten67 
 * @license MIT
 */


/**
 * @class Component
 * @description Base class for all components - functional and class components
 * @example 
 * class App extends Component {
 *    constructor(props){
 *     super(props)
 *     this.state = {
 *         count: 0
 *       }
 *    }
 * 
 *    render(){
 *      return  <div>
 *           <h1>Count is {this.state.count}</h1>
 *          <button onClick={()=> this.setState({count: this.state.count + 1})}>Click me</button>
 *      </div>
 *     }
 * }
 * 
 */
export class Component {
  /**
   * @constructor 
   * @param {object} props - Component props
   * @param {string} props.key - Unique identifier for the component
   * @param {object} props.children - Content to be displayed inside the component
   */
  constructor() {
    this.state = {};
    this.props = {};
    this.key = Math.random();
    this.__internalInstance = {};
  }

  /**
   * @function
   * @description  This method allows you to update the state of a component
   */
  render() {}
  /**
   *  @function
   * @description  This method allows you to update the state of a component
   * **/
  onMount() {}

  /**
   * @function
   * @description  This method allows you to update the state of a component 
   * @param {any} initialValue 
   * @returns  {[any, Function]}
   */

  useState(initialValue) {
    if (!this.state[key]) this.state[key] = initialValue;
    let state = this.state[key];
    const setState = (newState) => {
      state = newState;
      this.state[key] = newState;
      this.updateInstance(this.__internalInstance);
    };
    const getUpdatedState = () => {
      return this.state[key] || initialValue;
    }
    state = getUpdatedState();
    return [state, setState];
  
  }

  /**
   * @function useRef
   * @description  This method allows you to create a reference to a DOM element
   * @param {string} key
   * @param {any} initialValue
   * @returns {current: any}
   */
  useRef(initialValue) {
    return {current: initialValue}
  }

  /**
   * @function useReducer
   * @description  This method allows you to use a reducer to manage state
   * @param {function} reducer
   * @param {any} initialState
   */
  useReducer(reducer, initialState) {
    if (!this.state[key]) this.state[key] = initialState;
    let state = this.state[key];
    const setState = (newState) => {
      state = newState;
      this.state[key] = newState;
      this.updateInstance(this.__internalInstance);
    };
    const getUpdatedState = () => {
      return this.state[key] || initialState;
    }
    state = getUpdatedState();
    return [state, setState];
  }
  
}
 
/**
 * @method Mounted
 * @description  This method allows you to await until the component is mounted before running a callback
 *  
 * @param {function} callback - Function to be called when the component is mounted
 * @param {Component} component - Component to be determined mounted
 * @param {boolean} runOnlyOnce - Run the callback only once - default: true
 */
export const Mounted = (callback, /**@type {Component} */ component, runOnlyOnce = true) => {

};
 
 





 



/**
* @class Link
* @description Allows you to seamlessly navigate to different pages in your application
* @extends Component
* @example
* <Link href="/some-path" class="custom-link" style="color: blue;">Click me!</Link>
*/
export class Link extends Component {
  /**
     * @constructor
     * @param {object} props - Component props 
     * @param {string} props.href - URL for the link 
     * @param {string} props.action - Action to be performed when the link is clicked - can be function or string
     * @param {string} [props.class] - CSS class for the link
     * @param {string} [props.style] - Inline CSS style for the link
     * @param {string} [props.children] - Content to be displayed inside the link
     */
  constructor(props) {
    super(props);
    /**
          * @type {object}
          * @property {string} href - URL for the link
          * @property {string} [action] - Action to be performed when the link is clicked
          * @property {string} [class] - CSS class for the link
          * @property {string} [style] - Inline CSS style for the link
          * @property {string} [children] - Content to be displayed inside the link
          */
    this.props = {
      href: props.href,
      /**
       * @type {string|function}
       * @param {string} [action='outside'] - Action to be performed when the link is clicked
       */
      action: props.action || 'outside',
      class: props.class,
      style: props.style,
    }
 
    /**
     * @type {HTMLAnchorElement}
     */
    this.link = document.createElement('a');

    /**
     * @type {string}
     */
    this.key = props.href + Math.random();
  }

  /**
   * @function
   * @returns {string} - Rendered HTML for the Link component
   */
  render() {

    return this.link.outerHTML;
  }
}



/**
* @class Image
* @description Image component
* @extends Component
* @example
* <Image src="https://via.placeholder.com/150"  alt="image" />
*/
export class Image extends Component {
  /**
   * @constructor
   * @param {object} props - Component props
   * @param {string} props.src - Image source URL
   * @param {string} props.class - CSS class for the image
   * @param {string} props.style - Inline CSS style for the image
   * @param {number} props.blur - Blur value for the image (optional)
   * @param {number} props.width - Width of the image (optional)
   * @param {number} props.height - Height of the image (optional)
   * @param {boolean} props.optimize - Optimize the image (optional, default: true)
   * @param {boolean} props.loader - Show a placeholder loader (optional, default: true)
   * @param {string} props.alt - Alt text for the image (optional, default: 'image')
   */
  constructor(props) {
    super(props);

    /**
     * @type {object}
     * @property {string} src - Image source URL 
     * @property {string} [class] - CSS class for the image
     * @property {string} [style] - Inline CSS style for the image
     * @property {number} [blur] - Blur value for the image (optional)
     * @property {number} [width] - Width of the image (optional)
     * @property {number} [height] - Height of the image (optional)
     * @property {boolean} [optimize] - Optimize the image (optional, default: true)
     * @property {boolean} [loader] - Show a placeholder loader (optional, default: true)
     * @property {string} [alt] - Alt text for the image (optional, default: 'image')
     * @property {string} [children] - Content to be displayed inside the image
     * @property {string} [key] - Unique identifier for the image
     * @property {string} [onLoad] - Function to be called when the image is loaded
     */
    this.props = {
      src: props.src,
      class: props.class,
      style: props.style,
      blur: props.blur,
      width: props.width,
      height: props.height,
      optimize: props.optimize || true,
      loader: props.loader || true,
      alt: props.alt || 'image',
    };

    /**
     * @type {string}
     */
    this.key = props.src + Math.random();

    /**
     * @type {HTMLImageElement}
     * @private
     */
    this.img = document.createElement('img');

    /**
     * @type {HTMLDivElement}
     * @private
     */
    this.placeholder = document.createElement('div');
  }

  /**
   * @function
   * @returns {string} - Rendered JSX for the Image component
   */
  render() {
    // adjust width and height to the user's screen size


    return this.img.outerHTML;
  }
}

export class Head extends Component {
  /**
  * @constructor
  * @param {object} props - Component props
  * @param {boolean} props.updateOnReload - update metadata and title when rerendered
  * @param {string} props.children - Content to be displayed inside the head
  */
  constructor(props) {
    super(props);
    /**
* @type {object}
* @param {object} props - Component props
* @param {boolean} props.updateOnReload - update metadata and title when rerendered
* @param {string} props.children - Content to be displayed inside the head
*/
    this.props = {
      children: props.children,
      updateOnReload: props.updateOnReload
    }
    this.key = 'head';
    this.head = document.createElement('head');
  }



  render() {
    this.head.innerHTML = this.props.children;
    return this.head.outerHTML;
  }

  onMount() {
    document.head.innerHTML = this.head.innerHTML;
    document.body.querySelector(`[key="${this.key}"]`).remove();
  }
}

export class Script extends Component {
  /**
  * @constructor
  * @param {object} props - Component props
  * @param {string} props.children - Content to be displayed inside the script
  */
  constructor(props) {
    super(props);
    this.props = {
      children: props.children,
    }
    this.key = 'script';
    this.script = document.createElement('script');
  }



  render() {
    this.script.innerHTML = this.props.children.split('\n').join(';\n');
    return this.script.outerHTML;
  }

  onMount() {
    document.head.appendChild(this.script);
    document.body.querySelector(`[key="${this.key}"]`).remove();
  }

}

/**
 * @class HTML
 * @description HTML component 
 * @extends Component
 */
export class Html extends Component {
  /**
   * @constructor
   * @param {object} props - Component props
   * @param {string} props.key - Identifier which is used to check if the component has been mounted
   * @param {string} props.children - Content to be displayed inside the HTML
   * @param {string} props.lang - Language for the HTML
   */
  constructor(props) {
    super(props);
    /**
     * @type {object}
     * @property {string} children - Content to be displayed inside the HTML
     * @property {string} lang - Language for the HTML
     * @property {object} attributes - Attributes for the HTML
     */
    this.props = {
      children: props.children,
      lang: props.lang || 'en',
      attributes: props.attributes || {},
    }
    this.key =  props.key || 'html';
    this.html = document.createElement('html');
  }

  render() {
    this.html.innerHTML = this.props.children;
    return this.html.outerHTML;
  }

  onMount() {
    if (window.isServer) {
      document.documentElement.innerHTML = this.html.outerHTML;
    }
    console.log('Document Has Been Mounted')
  }

}
/**
 * @function useRef
 * @description  This method allows you to create a reference to a DOM element
 * @param {any} initialValue 
 * @returns 
 */
export const useRef = (initialValue) => {
  return {
    current: initialValue
  } 
}

/**
 *  @function useState
 * @description  This method allows you to use to bind state to a component and update on changes
 * @param {any} initialValue 
 * @returns  {[any, Function]}
 */
export const useState = (initialValue) => {
  return [initialValue, () => {}]
}
/**
 * @function useReducer
 * @description  This method allows you to use a reducer to manage state
 * @param {function} reducer 
 * @param {any} initialState 
 * @returns 
 */

export const useReducer = (reducer, initialState) => {
  return [initialState, () => {}]
}
export default {
  Component,
  useRef,
  useReducer,
  useState,
  strictMount,
  Link,
  Image,
  Head,
  Html,

}