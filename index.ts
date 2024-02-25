//@ts-nocheck
import {Element} from 'vaderjs/binaries/Kalix'
import React from 'react'
export const Vader = {
    version: "0.0.1",
}
 
declare global {
    /**
     * @type {boolean}
     * @description A boolean value that returns true if the current environment is a server
     */
    const isServer: boolean;
    var location: {
        href: string,
        pathname: string,
        search: string,
        hash: string,
        host: string,
        hostname: string,
        port: string,
        protocol: string,
        origin: string,
        reload: () => void,
    }
    /**
     * @description The env object - refers to the env variable either set in config or through the process.env
     * @type {Object} [env]
     */
    var env:{
        [key: string]: any
    }
    var history: {
        pushState: (state: any, title: string, url: string) => void,
        replaceState: (state: any, title: string, url: string) => void,
        go: (delta: number) => void,
        back: () => void,
        forward: () => void,
    }
    var localStorage: {
        getItem: (key: string) => string,
        setItem: (key: string, value: string) => void,
        removeItem: (key: string) => void,
        clear: () => void,
    }
    /**
     * @description The window object - used to manipulate the browser window
     * @property {string} location.href - The URL of the current page
     * @property {string} location.pathname - The path of the current page
     * @property {string} location.search - The query string of the current page
     * @property {string} location.hash - The hash of the current page
     * @property {string} location.host - The host of the current page
     * @property {string} location.hostname - The hostname of the current page
     * @property {string} location.port - The port of the current page
     * @property {string} location.protocol - The protocol of the current page
     * @property {string} location.origin - The origin of the current page
     * @property {Function} location.reload - Reloads the current page
     * @property {Object} history - The history object
     * @property {Function} history.pushState - Pushes a new state to the history object
     */
    var window: {
        location: {
            href: string,
            /**
             *  @property {string} location.pathname - The path of the current page
             */
            pathname: string,
            search: string,
            hash: string,
            host: string,
            hostname: string,
            port: string,
            protocol: string,
            origin: string,
            reload: () => void,
        },
        history: {
            pushState: (state: any, title: string, url: string) => void,
            replaceState: (state: any, title: string, url: string) => void,
            go: (delta: number) => void,
            back: () => void,
            forward: () => void,
        },
        localStorage: {
            getItem: (key: string) => string,
            setItem: (key: string, value: string) => void,
            removeItem: (key: string) => void,
            clear: () => void,
        },

    };
    var preRender: boolean;
    /**
     * @type {Object}
     * @description The file object
     * @property {string} name - The name of the file
     * @property {string} filetype - The type of the file
     * @property {string} dataUrl - The data url of the file
     * @property {string} text - The text content of the file
     * @property {string} fileUrl - The file url
     * @property {number} filesize - The file size
     * @property {Blob} blob - The file blob
     * @property {number} lastModified - The last modified date
     * @property {string} mimetype - The file mimetype
     */
     
    const requirePath: (path: string) => any;

    const useFile: (file: string) => {
        name: string,
        type: string,
        lastModified:{
            date: string,
            time: string,
            parsed: string,
        },
        size: number,
        fileContent: string,
    }
       /**
     * @description HTMLTextNode is a global interface that represents a text node
     */

    interface HTMLTextNode{
        nodeType: number,
        textContent: string,
        toString: () => string,
    }
       /**
     * @description HTMLElement is a global interface that represents an HTML element
     */
    interface HTMLElement{
        tagName: string,
        id: string, 
        nodeType: number,
        classList:{
            add: (className: string) => void,
            remove: (className: string) => void,
            toggle: (className: string) => void,
            contains: (className: string) => boolean,
        }
        props: {
            [key: string]: string,
        }
        children: HTMLElement[],
        outerHTML: string,
        innerHTML: string, 
        textContent: string,
        firstChild: HTMLElement | HTMLTextNode | null,
        style?: {
            
            display: string,
            position: string,
            top: string,
            left: string,
            right: string,
            bottom: string,
            width: string,
            height: string,
            maxWidth: string,
            maxHeight: string,
            minWidth: string,
            minHeight: string, 
            margin: string,
            marginTop: string,
            marginRight: string,
            marginBottom: string,
            marginLeft: string, 
            padding: string, 
            paddingTop: string,
            paddingRight: string,
            paddingBottom: string,
            paddingLeft: string,  
            overflow: string,
            zIndex: string,
            cursor: string,
            textAlign: string,
            fontSize: string,
            fontWeight: string,
            fontStyle: string,
            textDecoration: string,
            lineHeight: string,
            letterSpacing: string,
            textTransform: string,
            backgroundColor: string,
            backgroundImage: string,
            backgroundSize: string,
            backgroundPosition: string,
            backgroundRepeat: string,
            backgroundAttachment: string,
            backgroundClip: string,
            backgroundOrigin: string,
            backgroundBlendMode: string,
            boxShadow: string,
            transition: string,
            transform: string,
            transformOrigin: string,
            transformStyle: string,
            perspective: string,
            perspectiveOrigin: string,
            backfaceVisibility: string,
            filter: string,
            backdropFilter: string,
            mixBlendMode: string,
            border: string,
            borderTop: string,
            borderRight: string,
            borderBottom: string,
            borderLeft: string,
            borderStyle: string,
            borderTopStyle: string,
            borderRightStyle: string,
            borderBottomStyle: string,
            borderLeftStyle: string,
            borderColor: string,
            borderTopColor: string,
            borderRightColor: string,
            borderBottomColor: string,
            borderLeftColor: string,
            borderRadius: string,
            borderTopLeftRadius: string,
            borderTopRightRadius: string,
            borderBottomRightRadius: string,
            borderBottomLeftRadius: string,
            borderWidth: string,
            borderTopWidth: string,
            borderRightWidth: string,
            borderBottomWidth: string,
            borderLeftWidth: string, 
            
            [key: string]: string,
        } 
        attributes: {
            [key: string]: string,
        },
        events: [],
        toString: () => string,
        getAttribute: (attr: string) => string | null, 
        setAttribute: (attr: string, value: string) => void,
        appendChild: (child: HTMLElement) => void,
        prepend: (child: HTMLElement) => void,
        append: (...child: HTMLElement[]) => void,
        insertBefore: (node1: HTMLElement, node2: HTMLElement) => void,
        removeChild: (child: HTMLElement) => void,
        querySelector: (selector: string) => HTMLElement | null,
        querySelectorAll: (selector: string) => HTMLElement[], 
    }
} 
let states = []

export const useState = (initialState: any) => {
    let state = initialState
    let setState = (newState: any) => {
        state = newState
    }
    states.push({state, setState})
    return [state, setState]
}

export const useReducer = (reducer: any, initialState: any) => {
    let state = initialState
    let dispatch = (action: any) => {
        state = reducer(state, action)
    }
    states.push({state, dispatch})
    return [state, dispatch]
}
let refs = [] 
   

export const useRef = <T>(defaultValue: T) => {
    if(!globalThis.isNotFirstRun) {
        console.warn(`⚠️  Note: useRef in the server environment  will not work like it does in the client, you cannot  store the reference in a variable within mounted!
        `)
    }
    let refKey = "${Math.random().toString(36).substring(7).replace('.', '').replace('\d', '')}"
    let ref = {name: refKey, current: defaultValue}
    refs.push(ref)
    return ref
}
 
/**
 * @description The mounted function is called when the component is mounted based on pregenerated keys
 * @param callback {Function}
 * @param parent {Function}
 */
export const Mounted = (callback: Function, parent: Function) => {
    callback()
}
 
let effects = []
 /**
     * Use this to perform DOM mutations. This is the primary method you use to update the user interface in response to event handlers and server responses. 
     * Prefer the standard `useEffect` when possible to avoid blocking visual updates.
     */

export const useEffect = (callback: Function, dependencies: any[]) => {
    if(!effects.includes(callback)){
        effects.push({callback, dependencies})
    }
    let deps = effects.find((effect: any) => effect.callback === callback).dependencies
    if(deps){
        deps.forEach((dep: any) => {
            if(dep !== dependencies[0]){
                callback()
            }
        })
    }else{
        callback() 
    }
}

globalThis.window = {
    location: {
        href: '',
        pathname: '',
        search: '',
        hash: '',
        host: '',
        hostname: '',
        port: '',
        protocol: '',
        origin: '',
        reload: () => {}
    },
    history: {
        pushState: (state: any, title: string, url: string) => {},
        replaceState: (state: any, title: string, url: string) => {},
        go: (delta: number) => {},
        back: () => {},
        forward: () => {},
    },
    localStorage: {
        getItem: (key: string) => '',
        setItem: (key: string, value: string) => {},
        removeItem: (key: string) => {},
        clear: () => {},
    }
}

export const render = (element: any, container: any) => {
    container.appendChild(element)
}
export default  Element